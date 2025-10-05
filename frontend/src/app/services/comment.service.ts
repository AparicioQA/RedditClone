import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Comment, CreateCommentRequest } from '../models/comment.model';
import { VoteRequest } from '../models/post.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CommentService {
  private apiUrl = `${environment.apiUrl}/comments`;

  constructor(private http: HttpClient) {}

  createComment(request: CreateCommentRequest): Observable<Comment> {
    return this.http.post<Comment>(this.apiUrl, request);
  }

  voteComment(id: number, vote: VoteRequest): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/vote`, vote);
  }

  deleteComment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
