namespace RedditClone.API.Models;

public class Subreddit
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public int CreatorId { get; set; }

    // Navigation properties
    public User Creator { get; set; } = null!;
    public ICollection<Post> Posts { get; set; } = new List<Post>();
    public ICollection<SubredditMember> Members { get; set; } = new List<SubredditMember>();
}
