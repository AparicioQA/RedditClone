export interface Comment {
  id: number;
  content: string;
  createdAt: Date;
  authorUsername: string;
  authorId: number;
  postId: number;
  voteCount: number;
  userVote: number | null;
}

export interface CreateCommentRequest {
  content: string;
  postId: number;
}
