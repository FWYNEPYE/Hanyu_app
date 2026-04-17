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
        //  Kiểm tra User tồn tại chưa qua Email
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == data.Email);

        if (user == null)
        {
            //  Nếu chưa  -> Tạo mới
            user = new User 
            {
                Username = data.Name,
                Email = data.Email,
                GoogleId = data.GoogleId,
                CurrentStreak = 0,
                LongestStreak = 0,
                Points = 200,      // Mặc định 200 point
                AvailableAIUsage = 10,
                AvatarUrl = data.PhotoUrl,
                CreatedAt = DateTime.Now,
                PasswordHash = null//  để null vì dùng Google
            };
            _context.Users.Add(user);
            await _context.SaveChangesAsync();
        }
        else {

            if (string.IsNullOrEmpty(user.AvatarUrl) || user.AvatarUrl.Contains("googleusercontent.com")) {
                user.AvatarUrl = data.PhotoUrl;
                await _context.SaveChangesAsync();
            }
        }
        //  Tạo Token JWT
        var token = CreateToken(user);

        return Ok(new { 
            token = token, 
            userId = user.UserID, 
            username = user.Username 
        });
    }

    private string CreateToken(User user)
    {
        // Lấy chìa khóa bí mật từ appsettings.json
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(
            _config.GetSection("AppSettings:Token").Value!));

        // Thông tin định danh trong Token
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, user.UserID.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Name, user.Username)
        };

        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha512Signature);

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.Now.AddDays(7), // Token hạn 7 ngày
            SigningCredentials = creds
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        var token = tokenHandler.CreateToken(tokenDescriptor);

        return tokenHandler.WriteToken(token);
    }
}