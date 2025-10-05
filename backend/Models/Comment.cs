namespace RedditClone.API.Models;

public class Comment
{
    public int Id { get; set; }
    public string Content { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public int AuthorId { get; set; }
    public int PostId { get; set; }

    // Navigation properties
    public User Author { get; set; } = null!;
    public Post Post { get; set; } = null!;
    public ICollection<Vote> Votes { get; set; } = new List<Vote>();
}
