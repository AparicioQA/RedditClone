export interface Post {
  id: number;
  title: string;
  content: string;
  createdAt: Date;
  authorUsername: string;
  authorId: number;
  subredditName: string;
  subredditId: number;
  voteCount: number;
  userVote: number | null;
  commentCount: number;
}

export interface CreatePostRequest {
  title: string;
  content: string;
  subredditId: number;
}

export interface VoteRequest {
  value: number;
}
