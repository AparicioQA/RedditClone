using RedditClone.API.DTOs;

namespace RedditClone.API.Services;

public interface IAuthService
{
    Task<AuthResponse?> RegisterAsync(RegisterRequest request);
    Task<AuthResponse?> LoginAsync(LoginRequest request);
    string GenerateJwtToken(int userId, string username);
}
