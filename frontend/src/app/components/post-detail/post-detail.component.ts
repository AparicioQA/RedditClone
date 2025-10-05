import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PostService } from '../../services/post.service';
import { CommentService } from '../../services/comment.service';
import { AuthService } from '../../services/auth.service';
import { Post } from '../../models/post.model';
import { Comment } from '../../models/comment.model';

@Component({
  selector: 'app-post-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './post-detail.component.html',
  styleUrls: ['./post-detail.component.css']
})
export class PostDetailComponent implements OnInit {
  post: Post | null = null;
  comments: Comment[] = [];
  newComment = '';
  isAuthenticated = false;
  currentUser: any = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private postService: PostService,
    private commentService: CommentService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.isAuthenticated = this.authService.isAuthenticated();
    this.currentUser = this.authService.getCurrentUser();
    const postId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadPost(postId);
    this.loadComments(postId);
  }

  loadPost(postId: number): void {
    this.postService.getPost(postId).subscribe({
      next: (post) => {
        this.post = post;
      },
      error: (err) => {
        console.error('Error loading post:', err);
      }
    });
  }

  loadComments(postId: number): void {
    this.postService.getPostComments(postId).subscribe({
      next: (comments) => {
        this.comments = comments;
      },
      error: (err) => {
        console.error('Error loading comments:', err);
      }
    });
  }

  votePost(value: number): void {
    if (!this.isAuthenticated || !this.post) return;

    this.postService.votePost(this.post.id, { value }).subscribe({
      next: () => {
        this.loadPost(this.post!.id);
      },
      error: (err) => {
        console.error('Error voting:', err);
      }
    });
  }

  voteComment(commentId: number, value: number): void {
    if (!this.isAuthenticated) return;

    this.commentService.voteComment(commentId, { value }).subscribe({
      next: () => {
        this.loadComments(this.post!.id);
      },
      error: (err) => {
        console.error('Error voting:', err);
      }
    });
  }

  submitComment(): void {
    if (!this.isAuthenticated || !this.post || !this.newComment.trim()) return;

    this.commentService.createComment({
      content: this.newComment,
      postId: this.post.id
    }).subscribe({
      next: () => {
        this.newComment = '';
        this.loadComments(this.post!.id);
        this.loadPost(this.post!.id);
      },
      error: (err) => {
        console.error('Error creating comment:', err);
      }
    });
  }

  deletePost(): void {
    if (!this.post || !confirm('¿Estás seguro de que quieres eliminar esta publicación?')) {
      return;
    }

    this.postService.deletePost(this.post.id).subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: (err) => {
        console.error('Error deleting post:', err);
        alert('No se pudo eliminar la publicación. Por favor, inténtalo de nuevo.');
      }
    });
  }

  deleteComment(commentId: number): void {
    if (!confirm('¿Estás seguro de que quieres eliminar este comentario?')) {
      return;
    }

    this.commentService.deleteComment(commentId).subscribe({
      next: () => {
        this.loadComments(this.post!.id);
        this.loadPost(this.post!.id);
      },
      error: (err) => {
        console.error('Error deleting comment:', err);
        alert('No se pudo eliminar el comentario. Por favor, inténtalo de nuevo.');
      }
    });
  }

  canDeletePost(): boolean {
    return this.isAuthenticated && this.currentUser && this.post && this.currentUser.username === this.post.authorUsername;
  }

  canDeleteComment(comment: Comment): boolean {
    return this.isAuthenticated && this.currentUser && this.currentUser.username === comment.authorUsername;
  }

  getTimeAgo(date: Date): string {
    const now = new Date();
    const postDate = new Date(date);
    const diffMs = now.getTime() - postDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  }
}
