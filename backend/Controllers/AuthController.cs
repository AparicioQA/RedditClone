using Microsoft.AspNetCore.Mvc;
using RedditClone.API.DTOs;
using RedditClone.API.Services;

namespace RedditClone.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register(RegisterRequest request)
    {
        var response = await _authService.RegisterAsync(request);
        
        if (response == null)
        {
            return BadRequest(new { message = "Username or email already exists" });
        }

        return Ok(response);
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login(LoginRequest request)
    {
        var response = await _authService.LoginAsync(request);
        
        if (response == null)
        {
            return Unauthorized(new { message = "Invalid username or password" });
        }

        return Ok(response);
    }
}
