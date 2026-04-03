using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Server.Data;
using Server.Models;

namespace Server.Controllers
    {
        [ApiController]
        [Route("api/[controller]")]
        public class StreakController : ControllerBase
        {
            private readonly AppDbContext _context;
            public StreakController(AppDbContext context) => _context = context;

            [HttpPost("sync-time/{userId}")]
            public async Task<IActionResult> SyncTime(int userId, [FromBody] int seconds)
            {
                var today = DateTime.Today;
                // Lấy hoặc tạo bản ghi tiến độ hôm nay
                var progress = await _context.DailyProgresses
                    .FirstOrDefaultAsync(p => p.UserID == userId && p.StudyDate == today);

                if (progress == null) {
                    progress = new DailyProgress { UserID = userId, StudyDate = today, TotalSeconds = 0 };
                    _context.DailyProgresses.Add(progress);
                }

                // Cộng dồn giây
                progress.TotalSeconds += seconds;

                //  Check mốc 10 phút (600s) để tăng Streak
                if (progress.TotalSeconds >= 600 && !progress.IsCompleted) {
                    progress.IsCompleted = true;
                    var user = await _context.Users.FindAsync(userId);
                    if (user != null) {
                        // Nếu hôm qua có học thì Streak++, không thì reset về 1
                        user.CurrentStreak = (user.LastStudyDate == today.AddDays(-1)) ? user.CurrentStreak + 1 : 1;
                        user.LastStudyDate = today;
                    }
                }
                await _context.SaveChangesAsync();
                return Ok(new { total = progress.TotalSeconds, isDone = progress.IsCompleted });
            }

            // API lấy số giây học của hôm nay
            [HttpGet("today-progress/{userId}")]
            public async Task<IActionResult> GetTodayProgress(int userId)
            {
                var today = DateTime.Today;
                var progress = await _context.DailyProgresses
                    .FirstOrDefaultAsync(p => p.UserID == userId && p.StudyDate == today);
                
                return Ok(new { totalSeconds = progress?.TotalSeconds ?? 0 });
            }

            //  API lấy thông tin chuỗi của User
            [HttpGet("user-info/{userId}")]
            public async Task<IActionResult> GetUserInfo(int userId)
            {
                var user = await _context.Users.FindAsync(userId);
                if (user == null) return NotFound();

                return Ok(new { currentStreak = user.CurrentStreak });
            }


        }
    }