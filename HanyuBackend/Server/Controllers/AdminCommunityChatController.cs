using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Server.Data;
using Server.Models;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;

namespace Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AdminCommunityChatController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AdminCommunityChatController(AppDbContext context)
        {
            _context = context;
        }

        
        //  Lấy danh sách tin nhắn 
        [HttpGet("monitor")]
        public async Task<IActionResult> GetMonitorMessages()
        {
            try 
            {
                var messages = await _context.Messages
                    .Include(m => m.User)
                    .OrderByDescending(m => m.CreatedAt)
                    .Take(50) 
                    .Select(m => new {
                        id = m.MessId,
                        userId = m.UserID,
                        user = m.User != null ? m.User.Username : "Người dùng ẩn danh",
                        content = m.Content ?? "",
                        time = m.CreatedAt,
                        isMuted = m.User != null ? m.User.IsLocked : false, 
                        isDanger = (m.Content ?? "").ToLower().Contains("mua điểm") || 
                                (m.Content ?? "").ToLower().Contains("http") || 
                                (m.Content ?? "").ToLower().Contains("www")
                    })
                    .ToListAsync();

                return Ok(messages);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi Database: " + ex.Message });
            }
        }

        //  Xóa tin nhắn
        [HttpDelete("delete-message/{id}")]
        public async Task<IActionResult> DeleteMessage(int id)
        {
            var message = await _context.Messages.FindAsync(id);
            if (message == null) return NotFound(new { message = "Tin nhắn không tồn tại" });

            _context.Messages.Remove(message);
            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Đã xóa tin nhắn thành công" });
        }

        //  Khóa mõm
        [HttpPut("mute-user/{userId}")]
        public async Task<IActionResult> MuteUser(int userId)
        {
            var adminIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (adminIdClaim != null && int.Parse(adminIdClaim) == userId)
            {
                return BadRequest(new { message = "Sao tự cấm chat chính mình!" });
            }

            var user = await _context.Users.FindAsync(userId);
            if (user == null) return NotFound(new { message = "Người dùng không tồn tại" });

            user.IsLocked = true; 
            user.IsActive = false; 

            await _context.SaveChangesAsync();
            return Ok(new { success = true, message = $"Đã khóa tài khoản {user.Username}" });
        }

        //  Mở khóa 
        [HttpPut("unmute-user/{userId}")]
        public async Task<IActionResult> UnmuteUser(int userId)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return NotFound(new { message = "Không tìm thấy người dùng" });

            user.IsLocked = false; 
            user.IsActive = true; 
            
            await _context.SaveChangesAsync();
            return Ok(new { success = true, message = "Đã mở khóa thành công cho " + user.Username });
        }

        //  Dọn dẹp lịch sử
        [HttpDelete("clear-all-history")]
        public async Task<IActionResult> ClearAllHistory()
        {
            try
            {
                await _context.Messages.ExecuteDeleteAsync();
                return Ok(new { success = true, message = "Đã dọn dẹp sạch sẽ lịch sử chat!" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Lỗi khi dọn dẹp: " + ex.Message });
            }
        }

        [HttpGet("danger-count")]
        public async Task<IActionResult> GetDangerCount()
        {
            // Đếm những tin nhắn có chứa từ khóa nhạy cảm
            var dangerCount = await _context.Messages
                .CountAsync(m => m.Content.ToLower().Contains("mua điểm") || 
                                m.Content.ToLower().Contains("http") || 
                                m.Content.ToLower().Contains("www"));

            return Ok(new { count = dangerCount });
        }
    }
}