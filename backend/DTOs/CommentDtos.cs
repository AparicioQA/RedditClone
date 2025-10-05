namespace RedditClone.API.DTOs;

public class CreateCommentRequest
{
    public string Content { get; set; } = string.Empty;
    public int PostId { get; set; }
}

public class CommentDto
{
    public int Id { get; set; }
    public string Content { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public string AuthorUsername { get; set; } = string.Empty;
    public int AuthorId { get; set; }
    public int PostId { get; set; }
    public int VoteCount { get; set; }
    public int? UserVote { get; set; }
}
