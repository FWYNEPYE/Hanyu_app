using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Server.Data;
using Server.Models;

namespace Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AdminAIController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AdminAIController(AppDbContext context)
        {
            _context = context;
        }

        // 1. Lấy danh sách các User đã từng phát sinh hội thoại với AI
        [HttpGet("users-active")]
        public async Task<IActionResult> GetUsersActive()
        {
            try
            {
                var users = await _context.ChatHistories
                    .Include(c => c.User)
                    .Select(c => new 
                    { 
                        userID = c.UserID, 
                        username = c.User.Username 
                    })
                    .Distinct()
                    .ToListAsync();

                return Ok(users);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Lỗi lấy danh sách User: " + ex.Message });
            }
        }

        // 2. Lấy danh sách các Session (phiên hội thoại) của một User cụ thể
        [HttpGet("user-sessions/{userId}")]
        public async Task<IActionResult> GetUserSessions(int userId)
        {
            try
            {
                var sessions = await _context.ChatHistories
                    .Where(c => c.UserID == userId)
                    .GroupBy(c => c.SessionID)
                    .Select(g => new 
                    { 
                        sessionID = g.Key, 
                        // Lấy thời gian của tin nhắn mới nhất trong session đó
                        lastActive = g.Max(x => x.CreatedAt) 
                    })
                    .OrderByDescending(s => s.lastActive)
                    .Select(s => new {
                        s.sessionID,
                        lastActive = s.lastActive.ToString("HH:mm dd/MM/yyyy")
                    })
                    .ToListAsync();

                return Ok(sessions);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Lỗi lấy danh sách Session: " + ex.Message });
            }
        }

        // 3. Lấy chi tiết toàn bộ tin nhắn trong một SessionID
        [HttpGet("session-detail/{sessionId}")]
        public async Task<IActionResult> GetSessionDetail(string sessionId)
        {
            try
            {
                var messages = await _context.ChatHistories
                    .Where(c => c.SessionID == sessionId)
                    .OrderBy(c => c.CreatedAt) 
                    .Select(c => new 
                    {
                        id = c.Id,
                        role = c.Role,
                        content = c.Content,
                        pinyin = c.Pinyin,
                        translation = c.Translation,
                        time = c.CreatedAt.ToString("HH:mm")
                    })
                    .ToListAsync();

                if (messages == null || !messages.Any())
                {
                    return NotFound(new { message = "Không tìm thấy nội dung phiên hội thoại này." });
                }

                return Ok(messages);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Lỗi lấy chi tiết hội thoại: " + ex.Message });
            }
        }

        // 4. (Bonus) Thống kê tổng quan cho Dashboard
        [HttpGet("stats")]
        public async Task<IActionResult> GetAIStats()
        {
            try
            {
                var totalMessages = await _context.ChatHistories.CountAsync();
                var totalUsers = await _context.ChatHistories.Select(c => c.UserID).Distinct().CountAsync();
                var totalSessions = await _context.ChatHistories.Select(c => c.SessionID).Distinct().CountAsync();

                return Ok(new
                {
                    totalMessages,
                    totalUsers,
                    totalSessions
                });
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}