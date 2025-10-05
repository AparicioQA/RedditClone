namespace RedditClone.API.Models;

public class User
{
    public int Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string? FirebaseUid { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public ICollection<Post> Posts { get; set; } = new List<Post>();
    public ICollection<Comment> Comments { get; set; } = new List<Comment>();
    public ICollection<Vote> Votes { get; set; } = new List<Vote>();
    public ICollection<Subreddit> CreatedSubreddits { get; set; } = new List<Subreddit>();
    public ICollection<SubredditMember> SubredditMemberships { get; set; } = new List<SubredditMember>();
}
