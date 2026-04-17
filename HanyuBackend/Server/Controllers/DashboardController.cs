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
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null) return Unauthorized();
            int userId = int.Parse(userIdClaim.Value);

            // Lấy thông tin User 
            var user = await _context.Users
                .Select(u => new { 
                    u.UserID, 
                    u.Username, 
                    u.CurrentStreak,
                    u.Points,        
                    u.Rank,         
                    u.AvailableAIUsage 
                })
                .FirstOrDefaultAsync(u => u.UserID == userId);

            if (user == null) return NotFound();

            // 2. Tính toán tổng số từ vựng (cho ô "Tiến độ hiện tại" 65% của mày)
            
            var totalVocab = await _context.Vocabularies.CountAsync(); 

            //  Lấy dữ liệu biểu đồ
            var last7Days = Enumerable.Range(0, 7)
                .Select(i => DateTime.Today.AddDays(-i))
                .OrderBy(d => d).ToList();

            var progressData = await _context.DailyProgresses
                .Where(p => p.UserID == userId && p.StudyDate >= DateTime.Today.AddDays(-7))
                .ToListAsync();

            var chartData = last7Days.Select(date => new
            {
                Date = date.ToString("dd/MM"),
                Seconds = progressData.FirstOrDefault(p => p.StudyDate.Date == date.Date)?.TotalSeconds ?? 0,
                IsCompleted = progressData.FirstOrDefault(p => p.StudyDate.Date == date.Date)?.IsCompleted ?? false
            });

            return Ok(new { 
                UserStats = user, 
                ActivityChart = chartData,
                TotalVocabulary = totalVocab // Trả về số thực tế
            });
        }

        [HttpPost("update-progress")]
public async Task<IActionResult> UpdateProgress([FromBody] ProgressUpdateDto dto)
{
    var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
    if (userIdClaim == null) return Unauthorized();
    int userId = int.Parse(userIdClaim.Value);

    var today = DateTime.Today;
    var progress = await _context.DailyProgresses
        .FirstOrDefaultAsync(p => p.UserID == userId && p.StudyDate == today);

    if (progress == null) {
        progress = new DailyProgress { 
            UserID = userId, StudyDate = today, TotalSeconds = dto.Seconds,
            IsCompleted = dto.Seconds >= 600 
        };
        _context.DailyProgresses.Add(progress);
    } else {
        if (dto.Seconds > progress.TotalSeconds) progress.TotalSeconds = dto.Seconds;
        if (progress.TotalSeconds >= 600) progress.IsCompleted = true;
    }

    // Tách logic Streak ra riêng, không phụ thuộc vào việc progress.IsCompleted vừa mới đổi
   
    if (progress.TotalSeconds >= 600) 
    {
        var user = await _context.Users.FindAsync(userId);
        if (user != null && user.LastStudyDate?.Date != today.Date) 
        {
            var yesterday = today.AddDays(-1).Date;
            if (user.LastStudyDate?.Date == yesterday) {
                user.CurrentStreak += 1;
            } else {
                user.CurrentStreak = 1;
            }

            user.Points += 10; 

            user.LastStudyDate = today;
            _context.Entry(user).State = EntityState.Modified;
        }
    }

    await _context.SaveChangesAsync();
    return Ok(new { success = true, currentStreak = (await _context.Users.FindAsync(userId))?.CurrentStreak });
}
    }

    public class ProgressUpdateDto { public int Seconds { get; set; } }
}