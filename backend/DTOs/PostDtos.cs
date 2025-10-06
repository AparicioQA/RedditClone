namespace RedditClone.API.DTOs;

public class CreatePostRequest
{
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public int SubredditId { get; set; }
}

public class PostDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public string AuthorUsername { get; set; } = string.Empty;
    public int AuthorId { get; set; }
    public string SubredditName { get; set; } = string.Empty;
    public int SubredditId { get; set; }
    public int VoteCount { get; set; }
    public int? UserVote { get; set; }
    public int CommentCount { get; set; }
}

public class VoteRequest
{
    public int Value { get; set; } // +1 or -1
}

public class EditPostRequest
{
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
}
