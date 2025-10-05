import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Subreddit, CreateSubredditRequest } from '../models/subreddit.model';
import { Post } from '../models/post.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SubredditService {
  private apiUrl = `${environment.apiUrl}/subreddits`;

  constructor(private http: HttpClient) {}

  getSubreddits(): Observable<Subreddit[]> {
    return this.http.get<Subreddit[]>(this.apiUrl);
  }

  getSubreddit(id: number): Observable<Subreddit> {
    return this.http.get<Subreddit>(`${this.apiUrl}/${id}`);
  }

  createSubreddit(request: CreateSubredditRequest): Observable<Subreddit> {
    return this.http.post<Subreddit>(this.apiUrl, request);
  }

  joinSubreddit(id: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/join`, {});
  }

  leaveSubreddit(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}/leave`);
  }

  getSubredditPosts(id: number): Observable<Post[]> {
    return this.http.get<Post[]>(`${this.apiUrl}/${id}/posts`);
  }
}
