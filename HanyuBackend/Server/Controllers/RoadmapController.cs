using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Server.Models; 
using Server.Data;  

namespace Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RoadmapController : ControllerBase
    {
        private readonly AppDbContext _context;

        public RoadmapController(AppDbContext context)
        {
            _context = context;
        }

       
        [HttpGet("{slug}")]
public async Task<IActionResult> GetRoadmapDetail(string slug)
{
    var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
    int userId = string.IsNullOrEmpty(userIdClaim) ? 0 : int.Parse(userIdClaim);

    var roadmap = await _context.Roadmaps
        .Include(r => r.Steps)
        .FirstOrDefaultAsync(r => r.Slug == slug);

    if (roadmap == null) return NotFound(new { message = "Lộ trình không tồn tại" });

    var completedStepIds = await _context.UserProgresses
        .Where(up => up.UserID == userId)
        .Select(up => up.RoadmapStepId)
        .ToListAsync();

    // Lấy danh sách CategoryID có trong Roadmap này
    var categoryIds = roadmap.Steps.Select(s => s.CategoryID).ToList();

    // Đếm số từ vựng cho mỗi CategoryID (Group by để tối ưu, không cần chạy vòng lặp gọi DB nhiều lần)
    var vocabCounts = await _context.Vocabularies
        .Where(v => categoryIds.Contains(v.CategoryID))
        .GroupBy(v => v.CategoryID)
        .Select(g => new { CategoryID = g.Key, Count = g.Count() })
        .ToDictionaryAsync(x => x.CategoryID, x => x.Count);

    var roadmapSteps = roadmap.Steps.OrderBy(s => s.Order).ToList();
    
    var steps = roadmapSteps.Select((s, index) => 
    {
        string status;
        if (completedStepIds.Contains(s.StepId))
        {
            status = "done";
        }
        else if (index == 0 || completedStepIds.Contains(roadmapSteps[index - 1].StepId))
        {
            status = "open"; 
        }
        else
        {
            status = "locked";
        }

        return new
        {
            s.StepId,
            s.Title,
            s.Description,
            s.CategoryID,
            // Nếu không tìm thấy CategoryID trong từ điển thì để là 0
            VocabCount = vocabCounts.ContainsKey(s.CategoryID) ? vocabCounts[s.CategoryID] : 0,
            Status = status
        };
    });

    return Ok(new { roadmap.Title, roadmap.Description, Steps = steps });
}
       
        [HttpGet("step-vocab/{stepId}")]
public async Task<IActionResult> GetVocabByStep(int stepId)
{
    var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
    int userId = string.IsNullOrEmpty(userIdClaim) ? 0 : int.Parse(userIdClaim);

    var step = await _context.RoadmapSteps.FirstOrDefaultAsync(s => s.StepId == stepId);
    if (step == null) return NotFound(new { message = "Không tìm thấy bài học" });

    // Lấy danh sách từ vựng
    var vocabs = await _context.Vocabularies
        .Where(v => v.CategoryID == step.CategoryID)
        .ToListAsync();

    // Lấy danh sách ID những từ user ĐÃ THUỘC 
    var savedVocaIds = await _context.UserVocaProgresses
        .Where(uvp => uvp.UserID == userId && uvp.IsSaved)
        .Select(uvp => uvp.VocaId)
        .ToListAsync();

    var result = vocabs.Select(v => new {
        v.VocaId,
        v.Hanzi,
        v.Pinyin,
        v.Meaning,
        v.Type,
        v.Example,
        v.ExampleMeaning,
        IsSaved = savedVocaIds.Contains(v.VocaId) // Trả về true/false cho Frontend
    });

    return Ok(result);
}

        
        [HttpPost("complete-step/{stepId}")]
        public async Task<IActionResult> CompleteStep(int stepId)
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdClaim)) return Unauthorized();
            int userId = int.Parse(userIdClaim);

            // Kiểm tra lưu
            var existing = await _context.UserProgresses
                .AnyAsync(up => up.UserID == userId && up.RoadmapStepId == stepId);

            if (!existing)
            {
                var progress = new UserProgress
                {
                    UserID = userId,
                    RoadmapStepId = stepId,
                    IsCompleted = true,
                    CompletedAt = DateTime.UtcNow
                };

                _context.UserProgresses.Add(progress);
                await _context.SaveChangesAsync();
            }

            return Ok(new { message = "Lưu tiến độ thành công" });
        }

        //tiến độ ra db
        [HttpGet("progress-stats")]
        public async Task<IActionResult> GetProgressStats()
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdClaim)) return Ok(new { percentage = 0 });
            int userId = int.Parse(userIdClaim);

            var totalSteps = await _context.RoadmapSteps.CountAsync();
            var completedSteps = await _context.UserProgresses.CountAsync(up => up.UserID == userId);

            double percentage = totalSteps > 0 ? (double)completedSteps / totalSteps * 100 : 0;

            return Ok(new { 
                completed = completedSteps, 
                total = totalSteps, 
                percentage = Math.Round(percentage, 1) 
            });
        }
    }
}