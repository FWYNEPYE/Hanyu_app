using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Server.Data;

namespace Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AdminRankingController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AdminRankingController(AppDbContext context)
        {
            _context = context;
        }

        // 1. Lấy toàn bộ danh sách để Admin quản lý
        [HttpGet("list")]
        public async Task<IActionResult> GetAdminRankings()
        {
            var rankings = await _context.Users
                .Where(u => u.Role == "user") // Chỉ quản lý người học, không hiện Admin lên bảng
                .OrderByDescending(u => u.Points)
                .Select(u => new {
                    userId = u.UserID,
                    userName = u.Username,
                    totalPoints = u.Points,
                    streak = u.CurrentStreak
                })
                .ToListAsync();

            return Ok(rankings);
        }

        // 2. Hủy hạng (Reset điểm) của một User cụ thể
        [HttpDelete("reset/{id}")]
        public async Task<IActionResult> ResetUserPoints(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound("Không tìm thấy người dùng !");

            // Xóa điểm và streak để hủy hạng
            user.Points = 0;
            user.CurrentStreak = 0;

            await _context.SaveChangesAsync();
            return Ok(new { success = true, message = $"Đã hủy hạng người dùng {user.Username}" });
        }
    }
}