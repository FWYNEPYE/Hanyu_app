using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Server.Data;
using Server.Models;

namespace Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UserController : ControllerBase
    {
        private readonly AppDbContext _context;
        // Cấu hình Domain
        private readonly string _serverDomain = "http://localhost:5252";

        public UserController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("profile")]
        public async Task<IActionResult> GetProfile()
        {
            try
            {
                var user = await GetCurrentUserAsync();
                if (user == null) return NotFound(new { message = "Không tìm thấy User!" });

                // LOGIC XỬ LÝ AVATAR
                string finalAvatar = user.AvatarUrl;

                if (string.IsNullOrEmpty(finalAvatar))
                {
                    //  Nếu trống -> Dùng placeholder
                    finalAvatar = $"https://ui-avatars.com/api/?name={user.Username}&background=random";
                }
                else if (finalAvatar.StartsWith("/uploads"))
                {
                    //Nếu là ảnh tự upload (lưu dạng /uploads/abc.jpg) 
                    finalAvatar = $"{_serverDomain}{finalAvatar}";
                }
                

                return Ok(new
                {
                    name = user.Username,
                    email = user.Email,
                    avatar = finalAvatar,
                    joinDate = user.CreatedAt.ToString("dd/MM/yyyy"),
                    streak = user.CurrentStreak
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi Backend!", error = ex.Message });
            }
        }

        [HttpPut("update-name")]
        public async Task<IActionResult> UpdateName([FromBody] UpdateNameDto data)
        {
            try
            {
                var user = await GetCurrentUserAsync();
                if (user == null) return NotFound();

                user.Username = data.NewName;
                await _context.SaveChangesAsync();

                return Ok(new { message = "Thành công!", newName = user.Username });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi update!", error = ex.Message });
            }
        }

        [HttpPost("update-avatar")]
        public async Task<IActionResult> UpdateAvatar(IFormFile avatar)
        {
            try
            {
                var user = await GetCurrentUserAsync();
                if (user == null) return NotFound();

                if (avatar == null || avatar.Length == 0)
                    return BadRequest(new { message = "File ảnh không hợp lệ!" });

                // Xử lý thư mục lưu trữ
                var folderPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
                if (!Directory.Exists(folderPath)) Directory.CreateDirectory(folderPath);

                // Tạo tên file duy nhất
                var fileName = $"{Guid.NewGuid()}{Path.GetExtension(avatar.FileName)}";
                var filePath = Path.Combine(folderPath, fileName);

                // Lưu file 
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await avatar.CopyToAsync(stream);
                }

                // Cập nhật vào DB dạng đường dẫn 
                user.AvatarUrl = $"/uploads/{fileName}";
                await _context.SaveChangesAsync();

                
                return Ok(new { 
                    message = "Cập nhật ảnh thành công!", 
                    newAvatarUrl = $"{_serverDomain}{user.AvatarUrl}" 
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi server khi upload!", error = ex.Message });
            }
        }

        // Hàm phụ để lấy User
        private async Task<User?> GetCurrentUserAsync()
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdStr)) return null;
            
            // Ép kiểu ID về int để tìm kiếm 
            if (int.TryParse(userIdStr, out int id))
            {
                return await _context.Users.FirstOrDefaultAsync(u => u.UserID == id);
            }
            return null;
        }
    }

    public class UpdateNameDto
    {
        public string NewName { get; set; } = string.Empty;
    }
}