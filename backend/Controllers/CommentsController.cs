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
public class CommentsController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IFirebaseUserService _firebaseUserService;

    public CommentsController(AppDbContext context, IFirebaseUserService firebaseUserService)
    {
        _context = context;
        _firebaseUserService = firebaseUserService;
    }

    [Authorize]
    [HttpPost]
    public async Task<ActionResult<CommentDto>> CreateComment(CreateCommentRequest request)
    {
        var user = await _firebaseUserService.GetOrCreateUserAsync(User);
        var userId = user.Id;

        var post = await _context.Posts.FindAsync(request.PostId);
        if (post == null)
        {
            return BadRequest(new { message = "Post not found" });
        }

        var comment = new Comment
        {
            Content = request.Content,
            AuthorId = userId,
            PostId = request.PostId,
            CreatedAt = DateTime.UtcNow
        };

        _context.Comments.Add(comment);
        await _context.SaveChangesAsync();

        var author = await _context.Users.FindAsync(userId);

        return CreatedAtAction(nameof(GetComment), new { id = comment.Id }, new CommentDto
        {
            Id = comment.Id,
            Content = comment.Content,
            CreatedAt = comment.CreatedAt,
            AuthorUsername = author!.Username,
            AuthorId = userId,
            PostId = request.PostId,
            VoteCount = 0,
            UserVote = null
        });
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<CommentDto>> GetComment(int id)
    {
        int? currentUserId = null;
        if (User.Identity?.IsAuthenticated ?? false)
        {
            var user = await _firebaseUserService.GetOrCreateUserAsync(User);
            currentUserId = user.Id;
        }

        var comment = await _context.Comments
            .Include(c => c.Author)
            .Include(c => c.Votes)
            .Where(c => c.Id == id)
            .Select(c => new CommentDto
            {
                Id = c.Id,
                Content = c.Content,
                CreatedAt = c.CreatedAt,
                AuthorUsername = c.Author.Username,
                AuthorId = c.AuthorId,
                PostId = c.PostId,
                VoteCount = c.Votes.Sum(v => v.Value),
                UserVote = currentUserId.HasValue ? c.Votes.Where(v => v.UserId == currentUserId.Value).Select(v => (int?)v.Value).FirstOrDefault() : null
            })
            .FirstOrDefaultAsync();

        if (comment == null)
        {
            return NotFound();
        }

        return Ok(comment);
    }

    [Authorize]
    [HttpPost("{id}/vote")]
    public async Task<IActionResult> VoteComment(int id, VoteRequest request)
    {
        if (request.Value != 1 && request.Value != -1)
        {
            return BadRequest(new { message = "Vote value must be 1 or -1" });
        }

        var user = await _firebaseUserService.GetOrCreateUserAsync(User);
        var userId = user.Id;

        var comment = await _context.Comments.FindAsync(id);
        if (comment == null)
        {
            return NotFound();
        }

        var existingVote = await _context.Votes
            .FirstOrDefaultAsync(v => v.CommentId == id && v.UserId == userId);

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
                CommentId = id,
                Value = request.Value
            };
            _context.Votes.Add(vote);
        }

        await _context.SaveChangesAsync();
        return Ok();
    }

    [Authorize]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteComment(int id)
    {
        var user = await _firebaseUserService.GetOrCreateUserAsync(User);
        var userId = user.Id;

        var comment = await _context.Comments.FindAsync(id);
        if (comment == null)
        {
            return NotFound();
        }

        // Check if user is the author
        if (comment.AuthorId != userId)
        {
            return Forbid();
        }

        _context.Comments.Remove(comment);
        await _context.SaveChangesAsync();

        return Ok();
    }
}
