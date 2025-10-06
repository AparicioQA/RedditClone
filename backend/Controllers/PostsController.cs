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
public class PostsController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IFirebaseUserService _firebaseUserService;

    public PostsController(AppDbContext context, IFirebaseUserService firebaseUserService)
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
    public async Task<ActionResult<IEnumerable<PostDto>>> GetPosts()
    {
        var userId = await GetCurrentUserIdAsync();

        var posts = await _context.Posts
            .Include(p => p.Author)
            .Include(p => p.Subreddit)
            .Include(p => p.Votes)
            .Include(p => p.Comments)
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

    [HttpGet("{id}")]
    public async Task<ActionResult<PostDto>> GetPost(int id)
    {
        var userId = await GetCurrentUserIdAsync();

        var post = await _context.Posts
            .Include(p => p.Author)
            .Include(p => p.Subreddit)
            .Include(p => p.Votes)
            .Include(p => p.Comments)
            .Where(p => p.Id == id)
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
            .FirstOrDefaultAsync();

        if (post == null)
        {
            return NotFound();
        }

        return Ok(post);
    }

    [Authorize]
    [HttpPost]
    public async Task<ActionResult<PostDto>> CreatePost(CreatePostRequest request)
    {
        var user = await _firebaseUserService.GetOrCreateUserAsync(User);
        var userId = user.Id;

        var subreddit = await _context.Subreddits.FindAsync(request.SubredditId);
        if (subreddit == null)
        {
            return BadRequest(new { message = "Subreddit not found" });
        }

        var post = new Post
        {
            Title = request.Title,
            Content = request.Content,
            AuthorId = userId,
            SubredditId = request.SubredditId,
            CreatedAt = DateTime.UtcNow
        };

        _context.Posts.Add(post);
        await _context.SaveChangesAsync();

        var author = await _context.Users.FindAsync(userId);

        return CreatedAtAction(nameof(GetPost), new { id = post.Id }, new PostDto
        {
            Id = post.Id,
            Title = post.Title,
            Content = post.Content,
            CreatedAt = post.CreatedAt,
            AuthorUsername = author!.Username,
            AuthorId = userId,
            SubredditName = subreddit.Name,
            SubredditId = subreddit.Id,
            VoteCount = 0,
            UserVote = null,
            CommentCount = 0
        });
    }

    [Authorize]
    [HttpPut("{id}")]
    public async Task<IActionResult> EditPost(int id, EditPostRequest request)
    {
        var user = await _firebaseUserService.GetOrCreateUserAsync(User);
        var userId = user.Id;

        var post = await _context.Posts.FindAsync(id);
        if (post == null)
        {
            return NotFound();
        }
        if (post.AuthorId != userId)
        {
            return Forbid();
        }
        post.Title = request.Title;
        post.Content = request.Content;
        await _context.SaveChangesAsync();
        return Ok(new PostDto
        {
            Id = post.Id,
            Title = post.Title,
            Content = post.Content,
            CreatedAt = post.CreatedAt,
            AuthorUsername = user.Username,
            AuthorId = userId,
            SubredditName = (await _context.Subreddits.FindAsync(post.SubredditId))?.Name,
            SubredditId = post.SubredditId,
            VoteCount = await _context.Votes.Where(v => v.PostId == post.Id).SumAsync(v => v.Value),
            UserVote = null,
            CommentCount = await _context.Comments.CountAsync(c => c.PostId == post.Id)
        });
    }

    [Authorize]
    [HttpPost("{id}/vote")]
    public async Task<IActionResult> VotePost(int id, VoteRequest request)
    {
        if (request.Value != 1 && request.Value != -1)
        {
            return BadRequest(new { message = "Vote value must be 1 or -1" });
        }

        var user = await _firebaseUserService.GetOrCreateUserAsync(User);
        var userId = user.Id;

        var post = await _context.Posts.FindAsync(id);
        if (post == null)
        {
            return NotFound();
        }

        var existingVote = await _context.Votes
            .FirstOrDefaultAsync(v => v.PostId == id && v.UserId == userId);

        if (existingVote != null)
        {
            if (existingVote.Value == request.Value)
            {
                // Remove vote if same value
                _context.Votes.Remove(existingVote);
            }
            else
            {
                // Update vote value
                existingVote.Value = request.Value;
            }
        }
        else
        {
            // Create new vote
            var vote = new Vote
            {
                UserId = userId,
                PostId = id,
                Value = request.Value
            };
            _context.Votes.Add(vote);
        }

        await _context.SaveChangesAsync();
        return Ok();
    }

    [HttpGet("{id}/comments")]
    public async Task<ActionResult<IEnumerable<CommentDto>>> GetPostComments(int id)
    {
        var userId = await GetCurrentUserIdAsync();

        var comments = await _context.Comments
            .Include(c => c.Author)
            .Include(c => c.Votes)
            .Where(c => c.PostId == id)
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

    [Authorize]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeletePost(int id)
    {
        var user = await _firebaseUserService.GetOrCreateUserAsync(User);
        var userId = user.Id;

        var post = await _context.Posts.FindAsync(id);
        if (post == null)
        {
            return NotFound();
        }

        // Check if user is the author
        if (post.AuthorId != userId)
        {
            return Forbid();
        }

        _context.Posts.Remove(post);
        await _context.SaveChangesAsync();

        return Ok();
    }
}
