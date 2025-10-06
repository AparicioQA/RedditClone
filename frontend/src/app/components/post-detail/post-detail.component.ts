import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PostService } from '../../services/post.service';
import { CommentService } from '../../services/comment.service';
import { AuthService } from '../../services/auth.service';
import { ModalService } from '../../services/modal.service';
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
    isEditingPost = false;
    editPostTitle = '';
    editPostContent = '';
    editingCommentId: number | null = null;
    editCommentContent = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private postService: PostService,
    private commentService: CommentService,
    private authService: AuthService,
    private modalService: ModalService
  ) {}

  ngOnInit(): void {
    this.isAuthenticated = this.authService.isAuthenticated();
    this.currentUser = this.authService.getCurrentUser();
    const postId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadPost(postId);
    this.loadComments(postId);
  }

    startEditPost(): void {
      if (!this.post) return;
      this.isEditingPost = true;
      this.editPostTitle = this.post.title;
      this.editPostContent = this.post.content;
    }

    cancelEditPost(): void {
      this.isEditingPost = false;
    }

    saveEditPost(): void {
      if (!this.post) return;
      this.postService.editPost(this.post.id, {
        title: this.editPostTitle,
        content: this.editPostContent
      }).subscribe({
        next: (updated) => {
          this.post = updated;
          this.isEditingPost = false;
        },
        error: (err) => {
          console.error('Error editing post:', err);
        }
      });
    }

    startEditComment(comment: Comment): void {
      this.editingCommentId = comment.id;
      this.editCommentContent = comment.content;
    }

    cancelEditComment(): void {
      this.editingCommentId = null;
      this.editCommentContent = '';
    }

    saveEditComment(comment: Comment): void {
      this.commentService.editComment(comment.id, {
        content: this.editCommentContent
      }).subscribe({
        next: (updated) => {
          const idx = this.comments.findIndex(c => c.id === comment.id);
          if (idx !== -1) this.comments[idx] = updated;
          this.editingCommentId = null;
          this.editCommentContent = '';
        },
        error: (err) => {
          console.error('Error editing comment:', err);
        }
      });
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
    this.modalService.confirm({
      title: 'Eliminar Publicación',
      message: '¿Estás seguro de que quieres eliminar esta publicación?',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar'
    }).subscribe(confirmed => {
      if (confirmed && this.post) {
        this.postService.deletePost(this.post.id).subscribe({
          next: () => {
            this.router.navigate(['/']);
          },
          error: (err) => {
            console.error('Error deleting post:', err);
            this.modalService.alert({
              title: 'Error',
              message: 'No se pudo eliminar la publicación. Por favor, inténtalo de nuevo.'
            });
          }
        });
      }
    });
  }

  deleteComment(commentId: number): void {
    this.modalService.confirm({
      title: 'Eliminar Comentario',
      message: '¿Estás seguro de que quieres eliminar este comentario?',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar'
    }).subscribe(confirmed => {
      if (confirmed) {
        this.commentService.deleteComment(commentId).subscribe({
          next: () => {
            this.loadComments(this.post!.id);
            this.loadPost(this.post!.id);
          },
          error: (err) => {
            console.error('Error deleting comment:', err);
            this.modalService.alert({
              title: 'Error',
              message: 'No se pudo eliminar el comentario. Por favor, inténtalo de nuevo.'
            });
          }
        });
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

    if (diffMins < 1) return 'justo ahora';
    if (diffMins < 60) return `hace ${diffMins}m`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `hace ${diffHours}h`;

    const diffDays = Math.floor(diffHours / 24);
    return `hace ${diffDays}d`;
  }
}
