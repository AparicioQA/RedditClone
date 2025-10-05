export interface Subreddit {
  id: number;
  name: string;
  description: string;
  createdAt: Date;
  creatorUsername: string;
  memberCount: number;
  isJoined: boolean;
}

export interface CreateSubredditRequest {
  name: string;
  description: string;
}
