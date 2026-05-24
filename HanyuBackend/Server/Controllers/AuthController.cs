using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Server.Data; 
using Server.Models; 

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IConfiguration _config;

    public AuthController(AppDbContext context, IConfiguration config)
    {
        _context = context;
        _config = config;
    }

    [HttpPost("google-login")]
    public async Task<IActionResult> GoogleLogin([FromBody] GoogleLoginDto data)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == data.Email);

        if (user == null)
        {
            user = new User 
            {
                Username = data.Name,
                Email = data.Email,
                GoogleId = data.GoogleId,
                CurrentStreak = 0,
                LongestStreak = 0,
                Points = 200,
                AvailableAIUsage = 10,
                AvatarUrl = data.PhotoUrl,
                CreatedAt = DateTime.UtcNow,
                IsActive = true 
            };
            _context.Users.Add(user);
            await _context.SaveChangesAsync();
        }
        else 
        {
            if (!user.IsActive)
            {
                return BadRequest("Tài khoản của bạn đã bị khóa. Vui lòng liên hệ để được hỗ trợ!");
            }

            if (string.IsNullOrEmpty(user.AvatarUrl) || user.AvatarUrl.Contains("googleusercontent.com")) {
                user.AvatarUrl = data.PhotoUrl;
                await _context.SaveChangesAsync();
            }
        }

        var token = CreateToken(user);

        return Ok(new { 
            token = token, 
            userId = user.UserID, 
            username = user.Username 
        });
    }

    [HttpPost("admin-login")]
public async Task<IActionResult> AdminLogin([FromBody] AdminLoginDto model)
{
    // Chấp nhận pass cứng để demo cho nhanh
    if (model.Username == "admin" && model.Password == "abc1234")
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == "admin");

        if (user == null) return NotFound("Chưa tạo user admin trong SQL!");
    
        // Cập nhật lại chuẩn role admin nếu bị nhảy sang cái khác
        if (user.Role != "admin") {
            user.Role = "admin";
            await _context.SaveChangesAsync();
        }

        var token = CreateToken(user); 
        return Ok(new { token, userId = user.UserID, username = user.Username });
    }
    return Unauthorized("Mày không phải Sếp, cúc!");
}


    // Hợp nhất hàm tạo Token, dùng chung cho cả Google và Admin
    private string CreateToken(User user)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(
            _config.GetSection("AppSettings:Token").Value!));

        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, user.UserID.ToString()),
            new Claim(ClaimTypes.Email, user.Email ?? ""),
            new Claim(ClaimTypes.Name, user.Username),
            new Claim(ClaimTypes.Role, user.Role ?? "user")
        };

        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha512Signature);

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddDays(7),
            SigningCredentials = creds
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        var token = tokenHandler.CreateToken(tokenDescriptor);

        return tokenHandler.WriteToken(token);
    }
}

// DTOs
public class GoogleLoginDto {
    public string Email { get; set; }
    public string Name { get; set; }
    public string GoogleId { get; set; }
    public string PhotoUrl { get; set; }
}

public class AdminLoginDto {
    public string Username { get; set; }
    public string Password { get; set; }
}