import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Post, CreatePostRequest, VoteRequest } from '../models/post.model';
import { Comment } from '../models/comment.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private apiUrl = `${environment.apiUrl}/posts`;

  constructor(private http: HttpClient) {}

  getPosts(): Observable<Post[]> {
    return this.http.get<Post[]>(this.apiUrl);
  }

  getPost(id: number): Observable<Post> {
    return this.http.get<Post>(`${this.apiUrl}/${id}`);
  }

  createPost(request: CreatePostRequest): Observable<Post> {
    return this.http.post<Post>(this.apiUrl, request);
  }

  votePost(id: number, vote: VoteRequest): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/vote`, vote);
  }

  getPostComments(id: number): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.apiUrl}/${id}/comments`);
  }

  deletePost(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
