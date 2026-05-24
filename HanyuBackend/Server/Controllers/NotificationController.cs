using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Server.Models;
using Server.Data; 
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;

namespace Server.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class NotificationController : ControllerBase
    {
        private readonly AppDbContext _context;

        public NotificationController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("user-notifications")]
        public async Task<IActionResult> GetNotifications()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);

            var notifications = await _context.Notifications
                .Where(n => n.UserID == userId)
                .OrderByDescending(n => n.CreatedAt)
                .Take(20)
                .ToListAsync();

            return Ok(notifications);
        }

        [HttpPost("mark-as-read/{id}")]
        public async Task<IActionResult> MarkAsRead(int id)
        {
            var notification = await _context.Notifications.FindAsync(id);
            if (notification == null) return NotFound();

            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            if (notification.UserID != userId) return Forbid();

            notification.IsRead = true;
            await _context.SaveChangesAsync();
            return Ok(new { success = true });
        }

        // 3. Đánh dấu đọc tất cả
        [HttpPost("read-all")]
        public async Task<IActionResult> ReadAll()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            var unreadNotis = await _context.Notifications
                .Where(n => n.UserID == userId && !n.IsRead)
                .ToListAsync();

            foreach (var noti in unreadNotis)
            {
                noti.IsRead = true;
            }

            await _context.SaveChangesAsync();
            return Ok(new { count = unreadNotis.Count });
        }

        [HttpPost("trigger-streak-warning")]
        public async Task<IActionResult> StreakWarning()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            var today = DateTime.Today;

            var exists = await _context.Notifications.AnyAsync(n => 
                n.UserID == userId && 
                n.Type == "STREAK" && 
                n.CreatedAt >= today);

            if (exists) return Ok(new { message = "Already notified today" });

            var noti = new Notification
            {
                UserID = userId,
                Type = "STREAK",
                Title = "Sắp mất chuỗi rồi! 🔥",
                Content = "Hôm nay chưa học đủ 10 phút. Vào học ngay để không bị mất chuỗi nhé!",
                CreatedAt = DateTime.UtcNow,
                IsRead = false
            };

            _context.Notifications.Add(noti);
            await _context.SaveChangesAsync();
            return Ok(new { sent = true });
        }

        [HttpPost("trigger-rank-lost")]
        public async Task<IActionResult> RankLostNotification([FromBody] dynamic data)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            
            var noti = new Notification
            {
                UserID = userId,
                Type = "RANK",
                Title = "Mất Top 1 rồi! 👑",
                Content = "Có người vừa vượt mặt bạn trên bảng xếp hạng. Giành lại vị trí ngay thôi!",
                CreatedAt = DateTime.UtcNow,
                IsRead = false
            };

            _context.Notifications.Add(noti);
            await _context.SaveChangesAsync();
            return Ok();
        }
    }
}