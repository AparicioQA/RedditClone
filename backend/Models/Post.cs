namespace RedditClone.API.Models;

public class Post
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public int AuthorId { get; set; }
    public int SubredditId { get; set; }

    // Navigation properties
    public User Author { get; set; } = null!;
    public Subreddit Subreddit { get; set; } = null!;
    public ICollection<Comment> Comments { get; set; } = new List<Comment>();
    public ICollection<Vote> Votes { get; set; } = new List<Vote>();
}
