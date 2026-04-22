using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Server.Data;
using Server.Models;

namespace Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AdminExamController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AdminExamController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost("generate/{stepId}")]
        public async Task<IActionResult> GenerateExam(int stepId)
        {
            var step = await _context.RoadmapSteps.FindAsync(stepId);
            if (step == null || string.IsNullOrEmpty(step.CategoryID))
                return BadRequest("Step này chưa được gán bộ từ vựng!");

            var allVocabs = await _context.Vocabularies
                .Where(v => v.CategoryID == step.CategoryID)
                .ToListAsync();

            if (allVocabs.Count < 40)
                return BadRequest($"Chỉ có {allVocabs.Count} từ, cần tối thiểu 40 từ.");

            var randomVocabs = allVocabs.OrderBy(x => Guid.NewGuid()).Take(40).ToList();

            var questions = randomVocabs.Select((v, index) => {
                var options = new List<string> { v.Meaning };
                var wrong = allVocabs.Where(x => x.VocaId != v.VocaId)
                                     .OrderBy(x => Guid.NewGuid()).Take(3).Select(x => x.Meaning);
                options.AddRange(wrong);

                return new {
                    Content = v.Hanzi,
                    Pinyin = v.Pinyin,
                    AudioUrl = "",
                    ImageUrl = v.StrokeUrl ?? "",
                    Options = options.OrderBy(x => Guid.NewGuid()).ToList(),
                    CorrectAnswer = v.Meaning
                };
            }).ToList();

            return Ok(new { questions });
        }



        [HttpPost("save-exam")]
public async Task<IActionResult> SaveExam([FromBody] ExamSaveRequest model)
{
    try
    {
        if (model == null || model.StepId <= 0) 
            return BadRequest("Dữ liệu không hợp lệ !");

        // 1. Tìm RoadmapStep để lấy ExamId hiện tại (nếu có)
        var step = await _context.RoadmapSteps.FindAsync(model.StepId);
        if (step == null) return NotFound("Không tìm thấy Step tương ứng.");

        Exam exam;
        if (step.ExamId != null)
        {
            // Nếu Step đã có bài thi, lấy bài thi đó ra cập nhật
            exam = await _context.Exams.Include(e => e.Questions)
                                     .FirstOrDefaultAsync(e => e.ExamId == step.ExamId);
        }
        else
        {
            // Nếu chưa có, tạo mới Exam
            exam = new Exam
            {
                Title = $"Bài thi cho: {step.Title}",
                MinScoreToPass = model.PassScore,
                TimeLimit = model.TimeLimit, 
                PointReward = 100
            };
            _context.Exams.Add(exam);
            await _context.SaveChangesAsync(); // Lưu để lấy ExamId mới

            // Cập nhật lại ExamId cho RoadmapStep
            step.ExamId = exam.ExamId;
            _context.RoadmapSteps.Update(step);
        }

        // 2. Cập nhật thông tin chung của bài thi
        exam.MinScoreToPass = model.PassScore;
        exam.TimeLimit = model.TimeLimit;

        // 3. Xóa các câu hỏi cũ (Ghi đè bộ mới)
        var oldQuestions = _context.Questions.Where(q => q.ExamId == exam.ExamId);
        _context.Questions.RemoveRange(oldQuestions);

        // 4. Thêm 40 câu hỏi mới từ Frontend gửi lên
        foreach (var q in model.Questions)
        {
            _context.Questions.Add(new Question
            {
                ExamId = exam.ExamId,
                Content = q.Content ?? "",
                Pinyin = q.Pinyin,
                AudioUrl = q.AudioUrl,
                ImageUrl = q.ImageUrl,
                QuestionType = 1, 
                OptionA = q.Options.ElementAtOrDefault(0),
                OptionB = q.Options.ElementAtOrDefault(1),
                OptionC = q.Options.ElementAtOrDefault(2),
                OptionD = q.Options.ElementAtOrDefault(3),
                CorrectAnswer = q.CorrectAnswer ?? ""
            });
        }

        await _context.SaveChangesAsync();
        return Ok(new { message = "Lưu bài thi thành công rồi nhé!" });
    }
    catch (Exception ex)
    {
        return StatusCode(500, $"Lỗi server: {ex.Message}");
    }
}


[HttpGet("get-by-step/{stepId}")]
public async Task<IActionResult> GetByStep(int stepId)
{
    // 1. Tìm Step để lấy ExamId
    var step = await _context.RoadmapSteps
        .Include(s => s.Exam)
        .ThenInclude(e => e.Questions)
        .FirstOrDefaultAsync(s => s.StepId == stepId);

    if (step == null || step.Exam == null) 
        return NotFound("Step này chưa có đề !");

    // 2. Map dữ liệu trả về 
    var result = new
    {
        examId = step.Exam.ExamId,
        timeLimit = step.Exam.TimeLimit,
        passScore = step.Exam.MinScoreToPass,
        questions = step.Exam.Questions.Select(q => new
        {
            content = q.Content,
            pinyin = q.Pinyin,
            audioUrl = q.AudioUrl,
            imageUrl = q.ImageUrl,
            options = new List<string> { q.OptionA, q.OptionB, q.OptionC, q.OptionD },
            correctAnswer = q.CorrectAnswer
        }).ToList()
    };

    return Ok(result);
}
    }
    
    public class ExamSaveRequest
    {
        public int StepId { get; set; }
        public int TimeLimit { get; set; }
        public int PassScore { get; set; }
        public List<QuestionDto> Questions { get; set; } = new();
    }

    public class QuestionDto
    {
        public string Content { get; set; } = string.Empty;
        public string Pinyin { get; set; } = string.Empty;
        public List<string> Options { get; set; } = new();
        public string CorrectAnswer { get; set; } = string.Empty;
        public string? AudioUrl { get; set; }
        public string? ImageUrl { get; set; }
    }
}