using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Server.Data;
using Server.Models;

namespace Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AdminRoadmapController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AdminRoadmapController(AppDbContext context)
        {
            _context = context;
        }

        //  Lấy danh sách Roadmap kèm các Step và thông tin liên quan (Category, Exam)
        [HttpGet]
        public async Task<IActionResult> GetRoadmaps()
        {
            var roadmaps = await _context.Roadmaps
                .Include(r => r.Steps)
                    .ThenInclude(s => s.Category)
                .Include(r => r.Steps)
                    .ThenInclude(s => s.Exam)
                .ToListAsync();

            return Ok(roadmaps);
        }

        // 2. Lấy chi tiết 1 Roadmap
        [HttpGet("{id}")]
        public async Task<IActionResult> GetRoadmap(int id)
        {
            var roadmap = await _context.Roadmaps
                .Include(r => r.Steps)
                .FirstOrDefaultAsync(r => r.RoadmapId == id);

            if (roadmap == null) return NotFound("Không tìm thấy lộ trình");
            return Ok(roadmap);
        }

        // 3. Tạo mới Roadmap
        [HttpPost]
        public async Task<IActionResult> CreateRoadmap([FromBody] CreateRoadmapRequest request)
        {
            if (string.IsNullOrEmpty(request.Title)) return BadRequest("Tiêu đề trống !");

            var roadmap = new Roadmap 
            { 
                Title = request.Title,
                // Gán giá trị mặc định ở đây nếu Database không cho phép NULL
                Description = "Mô tả mặc định cho lộ trình", 
                Steps = new List<RoadmapStep>()
            };

            _context.Roadmaps.Add(roadmap);
            await _context.SaveChangesAsync(); // Dòng 54 bị lỗi vì thiếu Description

            return Ok(new { message = "Tạo lộ trình thành công", data = roadmap });
        }


        // 4. Thêm Step vào Roadmap
        [HttpPost("steps")]
        public async Task<IActionResult> AddStep([FromBody] CreateStepRequest request)
        {
            var roadmapExists = await _context.Roadmaps.AnyAsync(r => r.RoadmapId == request.RoadmapId);
            if (!roadmapExists) return BadRequest("Lộ trình không tồn tại");

            var step = new RoadmapStep { 
                RoadmapId = request.RoadmapId, 
                Title = request.Title 
            };

            _context.RoadmapSteps.Add(step);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Thêm chặng học thành công", data = step });
        }

        // 5. Cập nhật Roadmap
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateRoadmap(int id, [FromBody] Roadmap roadmap)
        {
            if (id != roadmap.RoadmapId) return BadRequest("ID không khớp");

            _context.Entry(roadmap).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.Roadmaps.Any(e => e.RoadmapId == id)) return NotFound();
                throw;
            }

            return Ok(new { message = "Cập nhật thành công" });
        }

        //  Xóa Roadmap 
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRoadmap(int id)
        {
            var roadmap = await _context.Roadmaps.FindAsync(id);
            if (roadmap == null) return NotFound();

            _context.Roadmaps.Remove(roadmap);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Đã xóa lộ trình" });
        }

        [HttpPut("steps/{stepId}/assign-exam")]
public async Task<IActionResult> AssignExamToStep(int stepId, [FromBody] int examId)
{
    var step = await _context.RoadmapSteps.FindAsync(stepId);
    if (step == null) return NotFound("Không tìm thấy chặng học này!");

    // Kiểm tra xem bài thi có tồn tại thật không
    var examExists = await _context.Exams.AnyAsync(e => e.ExamId == examId);
    if (!examExists) return BadRequest("ID bài thi này không tồn tại trong hệ thống!");

    step.ExamId = examId;
    await _context.SaveChangesAsync();

    return Ok(new { message = "Gán bài thi thành công!", examId = examId });
}
    }

    public class CreateRoadmapRequest {
    public string Title { get; set; }
    }

    public class CreateStepRequest {
        public int RoadmapId { get; set; }
        public string Title { get; set; }
    }
}