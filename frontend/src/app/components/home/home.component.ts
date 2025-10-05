import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PostService } from '../../services/post.service';
import { AuthService } from '../../services/auth.service';
import { Post } from '../../models/post.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  posts: Post[] = [];
  isAuthenticated = false;
  currentUser: any = null;

  constructor(
    private postService: PostService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.isAuthenticated = this.authService.isAuthenticated();
    this.currentUser = this.authService.getCurrentUser();
    this.loadPosts();
  }

  loadPosts(): void {
    this.postService.getPosts().subscribe({
      next: (posts) => {
        this.posts = posts;
      },
      error: (err) => {
        console.error('Error loading posts:', err);
      }
    });
  }

  vote(postId: number, value: number): void {
    if (!this.isAuthenticated) {
      return;
    }

    this.postService.votePost(postId, { value }).subscribe({
      next: () => {
        this.loadPosts();
      },
      error: (err) => {
        console.error('Error voting:', err);
      }
    });
  }

  deletePost(postId: number): void {
    if (!confirm('¿Estás seguro de que quieres eliminar esta publicación?')) {
      return;
    }

    this.postService.deletePost(postId).subscribe({
      next: () => {
        this.loadPosts();
      },
      error: (err) => {
        console.error('Error deleting post:', err);
        alert('No se pudo eliminar la publicación. Por favor, inténtalo de nuevo.');
      }
    });
  }

  canDeletePost(post: Post): boolean {
    return this.isAuthenticated && this.currentUser && this.currentUser.username === post.authorUsername;
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
