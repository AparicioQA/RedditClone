using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using RedditClone.API.Data;
using RedditClone.API.Models;

namespace RedditClone.API.Services;

public interface IFirebaseUserService
{
    Task<User> GetOrCreateUserAsync(ClaimsPrincipal principal);
}

public class FirebaseUserService : IFirebaseUserService
{
    private readonly AppDbContext _context;

    public FirebaseUserService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<User> GetOrCreateUserAsync(ClaimsPrincipal principal)
    {
        var firebaseUid = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                         ?? principal.FindFirst("user_id")?.Value;
        
        if (string.IsNullOrEmpty(firebaseUid))
        {
            throw new UnauthorizedAccessException("Firebase UID not found in token");
        }

        // Try to find existing user by Firebase UID
        var user = await _context.Users.FirstOrDefaultAsync(u => u.FirebaseUid == firebaseUid);
        
        if (user == null)
        {
            // Create new user
            var email = principal.FindFirst(ClaimTypes.Email)?.Value 
                       ?? principal.FindFirst("email")?.Value 
                       ?? $"{firebaseUid}@firebase.user";
            
            var name = principal.FindFirst(ClaimTypes.Name)?.Value 
                      ?? principal.FindFirst("name")?.Value 
                      ?? email.Split('@')[0];

            user = new User
            {
                FirebaseUid = firebaseUid,
                Username = name,
                Email = email,
                PasswordHash = string.Empty, // Not used for Firebase users
                CreatedAt = DateTime.UtcNow
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();
        }

        return user;
    }
}
