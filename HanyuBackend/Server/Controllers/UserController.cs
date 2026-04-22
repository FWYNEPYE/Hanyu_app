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
                    streak = user.CurrentStreak,
                    points = user.Points, 
                    availableAIUsage = user.AvailableAIUsage
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
       
       

        [HttpPost("add-points")]
        public async Task<IActionResult> AddPoints([FromBody] AddPointsDto data) 
        {
            try
            {
                var user = await GetCurrentUserAsync();
                if (user == null) return NotFound(new { message = "Không tìm thấy User!" });

                // 1. Cộng điểm
                user.Points += data.PointsToAdd;

                // 2. Tự động tạo thông báo lưu vào lịch sử
                var notification = new Notification
                {
                    UserID = user.UserID,
                    Type = "Chuỗi", // Gắn nhãn là Streak cho rực cháy
                    Title = "Duy trì phong độ! 🔥",
                    Content = $"Diu vừa nhận được {data.PointsToAdd} ☀️ vì đã chăm chỉ học tập. Tiếp tục phát huy nhé!",
                    CreatedAt = DateTime.Now,
                    IsRead = false
                };
                
                _context.Notifications.Add(notification);

                // 3. Lưu tất cả vào Database
                await _context.SaveChangesAsync();

                return Ok(new { 
                    message = $"Đã cộng {data.PointsToAdd} điểm và tạo thông báo!", 
                    currentPoints = user.Points 
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi cộng điểm!", error = ex.Message });
            }
        }


        [HttpPost("exchange-credits")]
        public async Task<IActionResult> ExchangeCredits([FromBody] ExchangeDto data)
        {
            try 
            {
                var user = await GetCurrentUserAsync();
                if (user == null) return NotFound(new { message = "User không tồn tại" });

                // Kiểm tra xem data có bị null không (nếu lỗi map dữ liệu)
                if (data == null) return BadRequest(new { message = "Dữ liệu gửi lên không hợp lệ" });

                if (user.Points < data.Cost) 
                {
                    return BadRequest(new { message = "Mày chưa đủ điểm, học tiếp đi!" });
                }

                // Thực hiện trừ điểm và cộng lượt
                user.Points -= data.Cost;
                user.AvailableAIUsage += data.Amount;

                await _context.SaveChangesAsync();
                
                return Ok(new { 
                    message = "Đổi quà thành công!", 
                    points = user.Points, 
                    credits = user.AvailableAIUsage 
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi server!", error = ex.Message });
            }
        }




public class ExchangeDto { public int Cost { get; set; } public int Amount { get; set; } }

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


    public class AddPointsDto { public int PointsToAdd { get; set; } }


}