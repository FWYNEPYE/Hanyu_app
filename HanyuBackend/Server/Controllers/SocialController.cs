using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Server.Models;
using System.Security.Claims;
using Server.Data;
using Microsoft.AspNetCore.Authorization;

namespace Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SocialController : ControllerBase
    {
        private readonly AppDbContext _context;

        public SocialController(AppDbContext context)
        {
            _context = context;
        }

        // --- 1. LEADERBOARD: Lấy danh sách Top 10 ---
        [HttpGet("leaderboard")]
        public async Task<IActionResult> GetLeaderboard()
        {
            // Lấy top 10 người dùng nhiều điểm nhất
            var users = await _context.Users
                .OrderByDescending(u => u.Points)
                .Where(u => u.Role == "user")
                .Take(10)
                .Select(u => new {
                    id = u.UserID,
                    name = u.Username,
                    score = u.Points,
                    streak = u.CurrentStreak,
                    avatar = !string.IsNullOrEmpty(u.AvatarUrl) 
                        ? (u.AvatarUrl.StartsWith("http") ? u.AvatarUrl : $"http://localhost:5252{u.AvatarUrl}") 
                        : null
                })
                .ToListAsync();

            return Ok(users);
        }



        [HttpGet("activity-stats/{userId}")]
        public async Task<IActionResult> GetActivity(int userId)
        {
            var startDate = DateTime.Today.AddDays(-97);
            
            var activities = await _context.DailyProgresses
                .Where(p => p.UserID == userId && p.StudyDate >= startDate)
                .ToListAsync();

            var activityData = new int[98];
            for (int i = 0; i < 98; i++)
            {
                var date = startDate.AddDays(i);
                var record = activities.FirstOrDefault(a => a.StudyDate.Date == date.Date);
                
                if (record != null)
                {
                    activityData[i] = record.TotalSeconds / 60; 
                }
                else 
                {
                    activityData[i] = 0;
                }
            }

            return Ok(activityData);
        }
                

        [HttpGet("daily-puzzle")]
        [Authorize] 
        public async Task<IActionResult> GetDailyPuzzle()
        {
            // 1. Lấy UserID từ Identity (Token)
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim)) return Unauthorized();
            int userId = int.Parse(userIdClaim);

            // 2. Logic lấy ID những câu đã làm (Giữ nguyên)
            var completedIds = await _context.UserPuzzleCompletions
                .Where(c => c.UserID == userId)
                .Select(c => c.PuzzleID)
                .ToListAsync();

            // 3. Lấy 1 câu chưa làm
            var puzzle = await _context.SentencePuzzles
                .Where(p => !completedIds.Contains(p.PuzzleId))
                .FirstOrDefaultAsync();

            // Dùng cái này để Console không bị đỏ lòm lỗi 404
            if (puzzle == null) return Ok(null); 

            return Ok(new {
                id = puzzle.PuzzleId,
                correctSentence = puzzle.CorrectSentence.Split('|'),
                pinyin = puzzle.Pinyin.Split('|'),
                points = puzzle.PointsReward
            });
        }



        [HttpPost("complete-puzzle")]
        [Authorize] 
        public async Task<IActionResult> CompletePuzzle([FromBody] PuzzleRequest req)
                {
                    //  Lấy UserID từ Token (Cái này không giả mạo được)
                    var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                    if (string.IsNullOrEmpty(userIdClaim)) return Unauthorized();
                    int userId = int.Parse(userIdClaim);

                    // Tìm user dựa trên ID từ Token
                    var user = await _context.Users.FindAsync(userId);
                    if (user == null) return NotFound("Không tìm thấy người dùng");

                    //  Kiểm tra xem đã làm câu đố này chưa (Dùng userId từ Token)
                    var alreadyDone = await _context.UserPuzzleCompletions
                        .AnyAsync(c => c.UserID == userId && c.PuzzleID == req.PuzzleId);
                    
                    if (alreadyDone) return BadRequest("Câu này bạn làm rồi!");

                    //  Ghi nhận hoàn thành (Dùng userId từ Token)
                    _context.UserPuzzleCompletions.Add(new UserPuzzleCompletion {
                        UserID = userId,
                        PuzzleID = req.PuzzleId
                    });

                    //  Cộng điểm User
                    user.Points += req.Points;

                    // Cập nhật DailyProgress (Dùng userId từ Token)
                    var daily = await _context.DailyProgresses
                        .FirstOrDefaultAsync(d => d.UserID == userId && d.StudyDate.Date == DateTime.Today);

                    if (daily == null) {
                        _context.DailyProgresses.Add(new DailyProgress {
                            UserID = userId,
                            StudyDate = DateTime.Today,
                            PointsGained = req.Points,
                            ActionCount = 1
                        });
                    } else {
                        daily.PointsGained += req.Points;
                        daily.ActionCount += 1;
                    }

                    await _context.SaveChangesAsync();
                    return Ok(new { success = true, newPoints = user.Points });
                }



        [HttpGet("messages")]
        public async Task<IActionResult> GetMessages()
        {
            var messages = await _context.Messages
                .Include(m => m.User) // Để lấy tên và avatar người gửi
                .OrderByDescending(m => m.CreatedAt)
                .Take(20) // Lấy 20 tin gần nhất
                .Select(m => new {
                    userId = m.UserID,
                    user = m.User.Username,
                    avatar = !string.IsNullOrEmpty(m.User.AvatarUrl) 
                        ? (m.User.AvatarUrl.StartsWith("http") ? m.User.AvatarUrl : $"http://localhost:5252{m.User.AvatarUrl}") 
                        : null,
                    text = m.Content,
                    time = m.CreatedAt // Frontend sẽ format lại sau
                })
                .ToListAsync();

            return Ok(messages.OrderBy(m => m.time)); // Sắp xếp lại cho tin mới nằm dưới
        }



       [HttpPost("send-message")]
        [Authorize]
        public async Task<IActionResult> SendMessage([FromBody] MessageRequest req)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            int userId = int.Parse(userIdClaim);


            var user = await _context.Users.FindAsync(userId);
            if (user != null && user.IsLocked) 
            {
                return BadRequest(new { message = "Bạn đã bị cấm chat!" });
            }

            if (string.IsNullOrWhiteSpace(req.Content)) return BadRequest("Nội dung trống");

            var newMessage = new Message
            {
                UserID = userId,
                Content = req.Content,
                CreatedAt = DateTime.UtcNow
            };

            _context.Messages.Add(newMessage);
            await _context.SaveChangesAsync();

            return Ok(new { success = true });
        }

public class MessageRequest {
    public string Content { get; set; }
}
    }

    public class PuzzleRequest {
        public int UserId { get; set; }
        public int PuzzleId { get; set; }
        public int Points { get; set; }
    }
}