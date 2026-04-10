using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Server.Data;
using Server.Models;
using System.Security.Claims;

namespace Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DashboardController : ControllerBase
    {
        private readonly AppDbContext _context;

        public DashboardController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("stats")]
        public async Task<IActionResult> GetDashboardStats()
        {
            // 1. Lấy UserID từ Token (giả sử bạn dùng JWT)
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null) return Unauthorized();
            int userId = int.Parse(userIdClaim.Value);

            // 2. Lấy thông tin User (Streak, Avatar...)
            var user = await _context.Users
                .Select(u => new { u.UserID, u.Username, u.CurrentStreak, u.LongestStreak })
                .FirstOrDefaultAsync(u => u.UserID == userId);

            if (user == null) return NotFound("User không tồn tại.");

            // 3. Thống kê tổng số từ vựng trong các Category của User này
            var totalVocab = await _context.Vocabularies
                .CountAsync(v => _context.Categories
                    .Where(c => c.UserID == userId)
                    .Select(c => c.CategoryID)
                    .Contains(v.CategoryID));

            // 4. Lấy dữ liệu tiến độ 7 ngày gần nhất để vẽ biểu đồ
            var last7Days = Enumerable.Range(0, 7)
                .Select(i => DateTime.Today.AddDays(-i))
                .OrderBy(d => d)
                .ToList();

            var progressData = await _context.DailyProgresses
                .Where(p => p.UserID == userId && p.StudyDate >= DateTime.Today.AddDays(-7))
                .ToListAsync();

            // Kết hợp dữ liệu 
            var chartData = last7Days.Select(date => new
            {
                Date = date.ToString("dd/MM"),
                Seconds = progressData.FirstOrDefault(p => p.StudyDate.Date == date.Date)?.TotalSeconds ?? 0,
                IsCompleted = progressData.FirstOrDefault(p => p.StudyDate.Date == date.Date)?.IsCompleted ?? false
            });

            return Ok(new
            {
                UserStats = user,
                TotalVocabulary = totalVocab,
                ActivityChart = chartData
            });
        }
    }
}

