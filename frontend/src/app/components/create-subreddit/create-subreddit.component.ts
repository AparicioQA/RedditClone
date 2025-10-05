import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SubredditService } from '../../services/subreddit.service';

@Component({
  selector: 'app-create-subreddit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-subreddit.component.html',
  styleUrls: ['./create-subreddit.component.css']
})
export class CreateSubredditComponent {
  subredditData = {
    name: '',
    description: ''
  };
  error = '';

  constructor(
    private subredditService: SubredditService,
    public router: Router
  ) {}

  onSubmit(): void {
    this.error = '';

    if (!this.subredditData.name.trim() || !this.subredditData.description.trim()) {
      this.error = 'Name and description are required';
      return;
    }

    this.subredditService.createSubreddit(this.subredditData).subscribe({
      next: (subreddit) => {
        this.router.navigate(['/r', subreddit.id]);
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to create community';
      }
    });
  }
}
