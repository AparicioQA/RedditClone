namespace RedditClone.API.Models;

public class SubredditMember
{
    public int SubredditId { get; set; }
    public int UserId { get; set; }
    public DateTime JoinedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public Subreddit Subreddit { get; set; } = null!;
    public User User { get; set; } = null!;
}
