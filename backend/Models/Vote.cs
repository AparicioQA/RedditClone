namespace RedditClone.API.Models;

public class Vote
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int? PostId { get; set; }
    public int? CommentId { get; set; }
    public int Value { get; set; } // +1 for upvote, -1 for downvote

    // Navigation properties
    public User User { get; set; } = null!;
    public Post? Post { get; set; }
    public Comment? Comment { get; set; }
}
