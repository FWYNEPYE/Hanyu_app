using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Server.Models; 
using Server.Data;

namespace Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserProgressController : ControllerBase
    { 
        private readonly AppDbContext _context;

        public UserProgressController(AppDbContext context)
        {
            _context = context;
        }
        
        [HttpPost("toggle-srs")]
        public async Task<IActionResult> ToggleSRS([FromBody] ToggleSrsRequest request)
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdClaim)) return Unauthorized(new { message = "Vui lòng đăng nhập" });
            int userId = int.Parse(userIdClaim);

            var existing = await _context.UserVocaProgresses
                .FirstOrDefaultAsync(uvp => uvp.UserID == userId && uvp.VocaId == request.VocaId);

            if (existing != null)
            {
                _context.UserVocaProgresses.Remove(existing);
                await _context.SaveChangesAsync();
                return Ok(new { isSaved = false, message = "Đã xóa khỏi mục ôn tập" });
            }
            else
            {
                var newProgress = new UserVocaProgress
                {
                    UserID = userId,
                    VocaId = request.VocaId,
                    CurrentLevel = 1,
                    NextReview = DateTime.UtcNow.AddDays(1),
                    IsSaved = true,
                    CreatedAt = DateTime.UtcNow
                };

                _context.UserVocaProgresses.Add(newProgress);
                await _context.SaveChangesAsync();
                return Ok(new { isSaved = true, message = "Đã thêm vào mục ôn tập" });
            }
        }

        [HttpPost("finish-step")]
        public async Task<IActionResult> FinishStep([FromBody] FinishStepRequest request)
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdClaim)) return Unauthorized();
            int userId = int.Parse(userIdClaim);

            var existingStep = await _context.UserProgresses
                .AnyAsync(up => up.UserID == userId && up.RoadmapStepId == request.StepId);

            if (!existingStep)
            {
                var stepProgress = new UserProgress
                {
                    UserID = userId,
                    RoadmapStepId = request.StepId,
                    IsCompleted = true,
                    CompletedAt = DateTime.UtcNow
                };
                _context.UserProgresses.Add(stepProgress);
            }

            if (request.VocaIds != null && request.VocaIds.Any())
            {
                foreach (var vId in request.VocaIds)
                {
                    var existsVoca = await _context.UserVocaProgresses
                        .AnyAsync(uvp => uvp.UserID == userId && uvp.VocaId == vId);
                    
                    if (!existsVoca)
                    {
                        _context.UserVocaProgresses.Add(new UserVocaProgress
                        {
                            UserID = userId,
                            VocaId = vId,
                            CurrentLevel = 1,
                            NextReview = DateTime.UtcNow.AddDays(1),
                            IsSaved = true,
                            CreatedAt = DateTime.UtcNow
                        });
                    }
                }
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = "Chúc mừng bạn đã hoàn thành bài học!" });
        }

        [HttpPost("update-review")]
        public async Task<IActionResult> UpdateReview([FromBody] ReviewRequest request)
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdClaim)) return Unauthorized();
            int userId = int.Parse(userIdClaim);

            var progress = await _context.UserVocaProgresses
                .FirstOrDefaultAsync(p => p.UserID == userId && p.VocaId == request.VocaId);

            if (progress == null) return NotFound("Không tìm thấy từ vựng");

            switch (request.Quality.ToLower()) 
            {
                case "easy":
                    progress.CurrentLevel += 1;
                    // Công thức giãn cách ngày học 
                    progress.NextReview = DateTime.UtcNow.AddDays(Math.Pow(2, progress.CurrentLevel)); 
                    break;
                case "normal":
                    progress.NextReview = DateTime.UtcNow.AddDays(progress.CurrentLevel + 1);
                    break;
                case "hard":
                    progress.CurrentLevel = 1; // Reset về cấp độ 1 nếu quên
                    progress.NextReview = DateTime.UtcNow.AddDays(1);
                    break;
            }

            if (progress.CurrentLevel > 8) progress.CurrentLevel = 8;

            await _context.SaveChangesAsync();
            return Ok(new { nextReview = progress.NextReview, newLevel = progress.CurrentLevel });
        }

        [HttpGet("srs-list")]
        public async Task<IActionResult> GetSrsList()
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdClaim)) return Unauthorized();
            int userId = int.Parse(userIdClaim);

            var list = await _context.UserVocaProgresses
                .Include(uvp => uvp.Vocabulary)
                    .ThenInclude(v => v.Category) 
                .Where(uvp => uvp.UserID == userId && uvp.IsSaved == true)
                .Select(uvp => new
                {
                    vocaId = uvp.VocaId,
                    word = uvp.Vocabulary != null ? uvp.Vocabulary.Hanzi : "",
                    meaning = uvp.Vocabulary != null ? uvp.Vocabulary.Meaning : "",
                    pinyin = uvp.Vocabulary != null ? uvp.Vocabulary.Pinyin : "",
                    level = uvp.CurrentLevel,
                    next = uvp.NextReview,
                    stepId = uvp.Vocabulary != null ? (int)uvp.Vocabulary.Level : 1,
                    roadmapId = uvp.Vocabulary != null ? uvp.Vocabulary.CategoryID : "unknown",
                    roadmapName = (uvp.Vocabulary != null && uvp.Vocabulary.Category != null) 
                                ? uvp.Vocabulary.Category.CategoryName 
                                : "Khác"
                })
                .ToListAsync();

            return Ok(list);
        }

        [HttpGet("roadmap-srs-stats/{roadmapId}")]
        public async Task<IActionResult> GetRoadmapSrsStats(string roadmapId) 
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdClaim)) return Unauthorized();
            int userId = int.Parse(userIdClaim);

            var allVocaInRoadmap = await _context.UserVocaProgresses
                .Where(uvp => uvp.UserID == userId && uvp.Vocabulary.CategoryID == roadmapId)
                .ToListAsync();

            var stats = new {
                learning = allVocaInRoadmap.Count(v => v.CurrentLevel < 5),
                mastered = allVocaInRoadmap.Count(v => v.CurrentLevel >= 5),
                due = allVocaInRoadmap.Count(v => v.NextReview <= DateTime.UtcNow)
            };

            return Ok(stats);
        }
    }

    public class ReviewRequest {
        public int VocaId { get; set; }
        public string Quality { get; set; } 
    }

    public class ToggleSrsRequest
    {
        public int VocaId { get; set; }
    }

    public class FinishStepRequest
    {
        public int StepId { get; set; }
        public List<int> VocaIds { get; set; }
    }
}