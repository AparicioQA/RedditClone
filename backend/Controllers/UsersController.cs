using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RedditClone.API.Data;
using RedditClone.API.DTOs;

namespace RedditClone.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly AppDbContext _context;

    public UsersController(AppDbContext context)
    {
        _context = context;
    }

    private int? GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        return userIdClaim != null ? int.Parse(userIdClaim) : null;
    }

    [HttpGet("{username}")]
    public async Task<ActionResult<UserDto>> GetUser(string username)
    {
        var user = await _context.Users
            .Where(u => u.Username == username)
            .Select(u => new UserDto
            {
                Id = u.Id,
                Username = u.Username,
                Email = u.Email,
                CreatedAt = u.CreatedAt
            })
            .FirstOrDefaultAsync();

        if (user == null)
        {
            return NotFound();
        }

        return Ok(user);
    }

    [HttpGet("{username}/posts")]
    public async Task<ActionResult<IEnumerable<PostDto>>> GetUserPosts(string username)
    {
        var userId = GetCurrentUserId();

        var posts = await _context.Posts
            .Include(p => p.Author)
            .Include(p => p.Subreddit)
            .Include(p => p.Votes)
            .Include(p => p.Comments)
            .Where(p => p.Author.Username == username)
            .OrderByDescending(p => p.CreatedAt)
            .Select(p => new PostDto
            {
                Id = p.Id,
                Title = p.Title,
                Content = p.Content,
                CreatedAt = p.CreatedAt,
                AuthorUsername = p.Author.Username,
                AuthorId = p.AuthorId,
                SubredditName = p.Subreddit.Name,
                SubredditId = p.SubredditId,
                VoteCount = p.Votes.Sum(v => v.Value),
                UserVote = userId.HasValue ? p.Votes.Where(v => v.UserId == userId.Value).Select(v => (int?)v.Value).FirstOrDefault() : null,
                CommentCount = p.Comments.Count
            })
            .ToListAsync();

        return Ok(posts);
    }

    [HttpGet("{username}/comments")]
    public async Task<ActionResult<IEnumerable<CommentDto>>> GetUserComments(string username)
    {
        var userId = GetCurrentUserId();

        var comments = await _context.Comments
            .Include(c => c.Author)
            .Include(c => c.Votes)
            .Where(c => c.Author.Username == username)
            .OrderByDescending(c => c.CreatedAt)
            .Select(c => new CommentDto
            {
                Id = c.Id,
                Content = c.Content,
                CreatedAt = c.CreatedAt,
                AuthorUsername = c.Author.Username,
                AuthorId = c.AuthorId,
                PostId = c.PostId,
                VoteCount = c.Votes.Sum(v => v.Value),
                UserVote = userId.HasValue ? c.Votes.Where(v => v.UserId == userId.Value).Select(v => (int?)v.Value).FirstOrDefault() : null
            })
            .ToListAsync();

        return Ok(comments);
    }
}
