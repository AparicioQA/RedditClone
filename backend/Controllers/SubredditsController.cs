using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RedditClone.API.Data;
using RedditClone.API.DTOs;
using RedditClone.API.Models;
using RedditClone.API.Services;

namespace RedditClone.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SubredditsController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IFirebaseUserService _firebaseUserService;

    public SubredditsController(AppDbContext context, IFirebaseUserService firebaseUserService)
    {
        _context = context;
        _firebaseUserService = firebaseUserService;
    }

    private async Task<int?> GetCurrentUserIdAsync()
    {
        if (!User.Identity?.IsAuthenticated ?? true)
            return null;

        var user = await _firebaseUserService.GetOrCreateUserAsync(User);
        return user.Id;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<SubredditDto>>> GetSubreddits()
    {
        var userId = await GetCurrentUserIdAsync();

        var subreddits = await _context.Subreddits
            .Include(s => s.Creator)
            .Include(s => s.Members)
            .Select(s => new SubredditDto
            {
                Id = s.Id,
                Name = s.Name,
                Description = s.Description,
                CreatedAt = s.CreatedAt,
                CreatorUsername = s.Creator.Username,
                MemberCount = s.Members.Count,
                IsJoined = userId.HasValue && s.Members.Any(m => m.UserId == userId.Value)
            })
            .ToListAsync();

        return Ok(subreddits);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<SubredditDto>> GetSubreddit(int id)
    {
        var userId = await GetCurrentUserIdAsync();

        var subreddit = await _context.Subreddits
            .Include(s => s.Creator)
            .Include(s => s.Members)
            .Where(s => s.Id == id)
            .Select(s => new SubredditDto
            {
                Id = s.Id,
                Name = s.Name,
                Description = s.Description,
                CreatedAt = s.CreatedAt,
                CreatorUsername = s.Creator.Username,
                MemberCount = s.Members.Count,
                IsJoined = userId.HasValue && s.Members.Any(m => m.UserId == userId.Value)
            })
            .FirstOrDefaultAsync();

        if (subreddit == null)
        {
            return NotFound();
        }

        return Ok(subreddit);
    }

    [Authorize]
    [HttpPost]
    public async Task<ActionResult<SubredditDto>> CreateSubreddit(CreateSubredditRequest request)
    {
        var user = await _firebaseUserService.GetOrCreateUserAsync(User);
        var userId = user.Id;

        // Check if subreddit name already exists
        if (await _context.Subreddits.AnyAsync(s => s.Name == request.Name))
        {
            return BadRequest(new { message = "Subreddit name already exists" });
        }

        var subreddit = new Subreddit
        {
            Name = request.Name,
            Description = request.Description,
            CreatorId = userId,
            CreatedAt = DateTime.UtcNow
        };

        _context.Subreddits.Add(subreddit);
        await _context.SaveChangesAsync();

        // Auto-join creator to subreddit
        var membership = new SubredditMember
        {
            SubredditId = subreddit.Id,
            UserId = userId,
            JoinedAt = DateTime.UtcNow
        };

        _context.SubredditMembers.Add(membership);
        await _context.SaveChangesAsync();

        var creator = await _context.Users.FindAsync(userId);

        return CreatedAtAction(nameof(GetSubreddit), new { id = subreddit.Id }, new SubredditDto
        {
            Id = subreddit.Id,
            Name = subreddit.Name,
            Description = subreddit.Description,
            CreatedAt = subreddit.CreatedAt,
            CreatorUsername = creator!.Username,
            MemberCount = 1,
            IsJoined = true
        });
    }

    [Authorize]
    [HttpPost("{id}/join")]
    public async Task<IActionResult> JoinSubreddit(int id)
    {
        var user = await _firebaseUserService.GetOrCreateUserAsync(User);
        var userId = user.Id;

        var subreddit = await _context.Subreddits.FindAsync(id);
        if (subreddit == null)
        {
            return NotFound();
        }

        var existingMembership = await _context.SubredditMembers
            .FirstOrDefaultAsync(sm => sm.SubredditId == id && sm.UserId == userId);

        if (existingMembership != null)
        {
            return BadRequest(new { message = "Already a member" });
        }

        var membership = new SubredditMember
        {
            SubredditId = id,
            UserId = userId,
            JoinedAt = DateTime.UtcNow
        };

        _context.SubredditMembers.Add(membership);
        await _context.SaveChangesAsync();

        return Ok();
    }

    [Authorize]
    [HttpDelete("{id}/leave")]
    public async Task<IActionResult> LeaveSubreddit(int id)
    {
        var user = await _firebaseUserService.GetOrCreateUserAsync(User);
        var userId = user.Id;

        var membership = await _context.SubredditMembers
            .FirstOrDefaultAsync(sm => sm.SubredditId == id && sm.UserId == userId);

        if (membership == null)
        {
            return BadRequest(new { message = "Not a member" });
        }

        _context.SubredditMembers.Remove(membership);
        await _context.SaveChangesAsync();

        return Ok();
    }

    [HttpGet("{id}/posts")]
    public async Task<ActionResult<IEnumerable<PostDto>>> GetSubredditPosts(int id)
    {
        var userId = await GetCurrentUserIdAsync();

        var posts = await _context.Posts
            .Include(p => p.Author)
            .Include(p => p.Subreddit)
            .Include(p => p.Votes)
            .Include(p => p.Comments)
            .Where(p => p.SubredditId == id)
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
}
