import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PostService } from '../../services/post.service';
import { SubredditService } from '../../services/subreddit.service';
import { Subreddit } from '../../models/subreddit.model';

@Component({
  selector: 'app-create-post',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-post.component.html',
  styleUrls: ['./create-post.component.css']
})
export class CreatePostComponent implements OnInit {
  subreddits: Subreddit[] = [];
  postData = {
    title: '',
    content: '',
    subredditId: 0
  };
  error = '';

  constructor(
    private postService: PostService,
    private subredditService: SubredditService,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.loadSubreddits();
  }

  loadSubreddits(): void {
    this.subredditService.getSubreddits().subscribe({
      next: (subreddits) => {
        this.subreddits = subreddits;
        if (subreddits.length > 0) {
          this.postData.subredditId = subreddits[0].id;
        }
      },
      error: (err) => {
        console.error('Error loading subreddits:', err);
      }
    });
  }

  onSubmit(): void {
    this.error = '';

    if (!this.postData.title.trim() || !this.postData.content.trim()) {
      this.error = 'Title and content are required';
      return;
    }

    if (!this.postData.subredditId) {
      this.error = 'Please select a subreddit';
      return;
    }

    this.postService.createPost(this.postData).subscribe({
      next: (post) => {
        this.router.navigate(['/posts', post.id]);
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to create post';
      }
    });
  }
}
