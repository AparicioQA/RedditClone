import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SubredditService } from '../../services/subreddit.service';
import { AuthService } from '../../services/auth.service';
import { Subreddit } from '../../models/subreddit.model';

@Component({
  selector: 'app-subreddit-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './subreddit-list.component.html',
  styleUrls: ['./subreddit-list.component.css']
})
export class SubredditListComponent implements OnInit {
  subreddits: Subreddit[] = [];
  isAuthenticated = false;

  constructor(
    private subredditService: SubredditService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.isAuthenticated = this.authService.isAuthenticated();
    this.loadSubreddits();
  }

  loadSubreddits(): void {
    this.subredditService.getSubreddits().subscribe({
      next: (subreddits) => {
        this.subreddits = subreddits;
      },
      error: (err) => {
        console.error('Error loading subreddits:', err);
      }
    });
  }

  toggleJoin(subreddit: Subreddit): void {
    if (!this.isAuthenticated) return;

    if (subreddit.isJoined) {
      this.subredditService.leaveSubreddit(subreddit.id).subscribe({
        next: () => {
          this.loadSubreddits();
        },
        error: (err) => {
          console.error('Error leaving subreddit:', err);
        }
      });
    } else {
      this.subredditService.joinSubreddit(subreddit.id).subscribe({
        next: () => {
          this.loadSubreddits();
        },
        error: (err) => {
          console.error('Error joining subreddit:', err);
        }
      });
    }
  }
}
