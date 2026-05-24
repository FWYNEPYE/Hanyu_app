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
            try
            {
                var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
                if (userIdClaim == null) return Unauthorized();
                int userId = int.Parse(userIdClaim.Value);

                var user = await _context.Users.FirstOrDefaultAsync(u => u.UserID == userId);
                if (user == null) return NotFound();

                // --- LOGIC RESET STREAK TỰ ĐỘNG ---
                var today = DateTime.Today;
                if (user.LastStudyDate.HasValue)
                {
                    var daysGap = (today - user.LastStudyDate.Value.Date).Days;

                    if (daysGap > 1) 
                    {
                        user.CurrentStreak = 0;
                        _context.Entry(user).State = EntityState.Modified;
                        await _context.SaveChangesAsync();
                    }
                }

                var sevenDaysAgo = DateTime.Today.AddDays(-7);
                var newBundlesCount = await _context.Categories
                    .CountAsync(c => c.UpdatedAt >= sevenDaysAgo);

                var lastProgress = await _context.UserProgresses
                    .Include(p => p.RoadmapStep)
                    .Where(p => p.UserID == userId)
                    .OrderByDescending(p => p.CompletedAt)
                    .Select(p => new { 
                        p.RoadmapStep.Title, 
                        p.RoadmapStep.CategoryID 
                    }) 
                    .FirstOrDefaultAsync();

                var suggestion = lastProgress?.Title ?? "Lộ trình HSK 1";
                var suggestedLink = lastProgress?.CategoryID?.ToLower() ?? "hsk";

                var totalVocab = await _context.Vocabularies.CountAsync();
                
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
                    UserStats = new { 
                        user.UserID, 
                        user.Username, 
                        user.CurrentStreak,
                        user.Points,        
                        user.Rank,         
                        user.AvailableAIUsage 
                    }, 
                    ActivityChart = chartData,
                    TotalVocabulary = totalVocab,
                    NewBundlesCount = newBundlesCount, 
                    SuggestedRoadmap = suggestion,
                    SuggestedLink = suggestedLink 
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi hệ thống", error = ex.Message });
            }
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

        private async Task<User?> GetCurrentUserAsync()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null) return null;
            return await _context.Users.FindAsync(int.Parse(userIdClaim.Value));
        }


        [HttpGet("daily-tasks")]
        public async Task<IActionResult> GetDailyTasks()
        {
            try
            {
                var user = await GetCurrentUserAsync(); // Hàm lấy User
                if (user == null) return Unauthorized();

                var today = DateTime.Today;

                // 1. Lấy danh sách task của hôm nay
                var tasks = await _context.UserTasks
                    .Where(t => t.UserID == user.UserID && t.TargetDate == today)
                    .ToListAsync();

                // 2. Nếu hôm nay chưa có task nào (Lần đầu mở app trong ngày)
                if (!tasks.Any())
                {
                    tasks = new List<UserTask>
                    {
                        new UserTask { 
                            UserID = user.UserID, 
                            TaskName = "Học tập 10 phút", 
                            Points = 10, 
                            Type = "STUDY", 
                            TargetDate = today,
                            IsCompleted = false 
                        },
                        new UserTask { 
                            UserID = user.UserID, 
                            TaskName = "Giữ chuỗi hỏa lực", 
                            Points = 5, 
                            Type = "STREAK", 
                            TargetDate = today,
                            IsCompleted = false 
                        },
                        new UserTask { 
                            UserID = user.UserID, 
                            TaskName = "Hoàn thành 1 bài Test", 
                            Points = 20, 
                            Type = "TEST", 
                            TargetDate = today,
                            IsCompleted = false 
                        }
                    };

                    _context.UserTasks.AddRange(tasks);
                    await _context.SaveChangesAsync();
                }

                return Ok(tasks);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi rùi!", error = ex.Message });
            }
        }

        [HttpPost("complete-task/{taskId}")]
        public async Task<IActionResult> CompleteTask(int taskId)
        {
            try
            {
                var task = await _context.UserTasks.FindAsync(taskId);
                if (task == null) return NotFound(new { message = "Không tìm thấy nhiệm vụ!" });
                if (task.IsCompleted) return BadRequest(new { message = "Nhiệm vụ này bạn nhận điểm rồi!" });

                var user = await _context.Users.FindAsync(task.UserID);
                if (user == null) return NotFound(new { message = "User không tồn tại!" });

                // Đánh dấu hoàn thành
                task.IsCompleted = true;
                task.CompletedAt = DateTime.UtcNow;

                // Cộng điểm thưởng của task 
                user.Points += task.Points;

                //  thông báo
                var notification = new Notification
                {
                    UserID = user.UserID,
                    Type = task.Type,
                    Title = "Nhiệm vụ hoàn tất! ✨",
                    Content = $"Chúc mừng bạn đã xong nhiệm vụ '{task.TaskName}'. +{task.Points} point đã nạp vào ví!",
                    CreatedAt = DateTime.UtcNow,
                    IsRead = false
                };
                _context.Notifications.Add(notification);

                await _context.SaveChangesAsync();

                return Ok(new { 
                    message = "Ngon lành cành đào!", 
                    currentPoints = user.Points,
                    taskId = task.TaskId 
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi nhận thưởng!", error = ex.Message });
            }
        }


    }

    public class ProgressUpdateDto { public int Seconds { get; set; } }
}