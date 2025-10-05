namespace RedditClone.API.DTOs;

public class CreateSubredditRequest
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
}

public class SubredditDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public string CreatorUsername { get; set; } = string.Empty;
    public int MemberCount { get; set; }
    public bool IsJoined { get; set; }
}
