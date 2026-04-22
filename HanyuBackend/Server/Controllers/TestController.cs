using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Server.Data;
using Server.Models;

namespace Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TestController : ControllerBase
    {
        private readonly AppDbContext _context;

        public TestController(AppDbContext context)
        {
            _context = context;
        }

       [HttpGet("step-auto/{stepId}")]
public async Task<IActionResult> GetAutoTestByStep(int stepId)
{
    // 1. Tìm Step để lấy CategoryID
    var step = await _context.RoadmapSteps.FirstOrDefaultAsync(s => s.StepId == stepId);
    if (step == null) return NotFound("Không thấy bước học này !");

    // 2. Lấy danh sách từ vựng thuộc Category đó
    var vocabList = await _context.Vocabularies
        .Where(v => v.CategoryID == step.CategoryID)
        .ToListAsync();

    if (vocabList.Count < 4) return BadRequest("Ít từ vựng quá, không tạo bài test 4 đáp án được!");

    var rng = new Random();

    // 3. Chuyển đổi thành cấu trúc câu hỏi
    var questions = vocabList.Select((v, index) => new {
        questionId = v.VocaId,
        content = v.Hanzi,      // Chữ Hán
        pinyin = v.Pinyin,
        imageUrl = v.StrokeUrl,     // Đưa ảnh từ bảng Vocabulary 
        referenceImages = new List<string>(),
        correctAnswer = v.Meaning, // Nghĩa tiếng Việt
        
        // Trộn 4 đáp án
        options = GenerateOptions(v.Meaning, vocabList.Select(x => x.Meaning).ToList()),
        
        order = index + 1,
        type = "MultipleChoice" 
    }).ToList();

    return Ok(new {
        title = $"Kiểm tra: {step.Title}",
        description = $"Hệ thống tự động tạo bài tập từ {vocabList.Count} từ vựng đã học.",
        questions = questions
    });
}

// Hàm phụ để trộn đáp án 
private List<string> GenerateOptions(string correct, List<string> allMeanings)
{
    var rng = new Random();
    var options = allMeanings.Where(m => m != correct)
                             .Distinct() // Tránh trùng lặp đáp án nhiễu
                             .OrderBy(x => rng.Next())
                             .Take(3)
                             .ToList();
    options.Add(correct);
    return options.OrderBy(x => rng.Next()).ToList();
}






        // 2. Lấy bài test tổng hợp cho cả Roadmap (HSK 1, HSK 2...)
        [HttpGet("roadmap/{id}")]
        public async Task<IActionResult> GetRoadmapFinalTest(string id)
        {
            // Tìm Roadmap theo Slug hoặc Id
            var roadmap = await _context.Roadmaps
                .Include(r => r.Steps)
                .FirstOrDefaultAsync(r => r.Slug == id || r.RoadmapId.ToString() == id);

            if (roadmap == null) return NotFound(new { message = "Lộ trình không tồn tại" });

            var categoryIds = roadmap.Steps.Select(s => s.CategoryID).ToList();

            // Lấy từ vựng, giới hạn khoảng 20-30 câu để user không nản
            var vocabs = await _context.Vocabularies
                .Where(v => categoryIds.Contains(v.CategoryID))
                .OrderBy(x => Guid.NewGuid()) 
                .Take(30) // tùy chỉnh số lượng câu hỏi 
                .ToListAsync();

            return Ok(new
            {
                Title = $"Thi tổng hợp: {roadmap.Title}",
                Description = $"Bài thi bao gồm các từ vựng từ {roadmap.Steps.Count} cấp độ.",
                Questions = vocabs
            });
        }


        //chấm điểm 
       [HttpPost("submit")]
public async Task<IActionResult> SubmitTest([FromBody] TestSubmitRequest model)
{
    if (model == null || model.Answers == null || !model.Answers.Any())
        return BadRequest("Không nhận được bài làm!");

    // 1. Lấy thông tin đề thi để có điểm sàn
    var step = await _context.RoadmapSteps
        .Include(s => s.Exam)
        .FirstOrDefaultAsync(s => s.StepId == model.StepId);

    if (step == null || step.Exam == null)
        return NotFound("Đề thi này chưa được cấu hình!");

    int correctCount = 0;
    
    // 2. Chấm điểm bằng cách so khớp với bảng Questions
    foreach (var item in model.Answers)
    {
        var question = await _context.Questions.FindAsync(item.QuestionId);
        if (question != null)
        {
            // So sánh không phân biệt hoa thường và khoảng trắng
            if (question.CorrectAnswer.Trim().ToLower() == item.UserAnswer.Trim().ToLower())
            {
                correctCount++;
            }
        }
    }

    // 3. Trả về kết quả
    return Ok(new {
        Total = model.Answers.Count,
        CorrectCount = correctCount,
        Score = Math.Round((double)correctCount / model.Answers.Count * 10, 2),
        IsPassed = correctCount >= step.Exam.MinScoreToPass,
        Message = "Đã chấm điểm xong!"
    });
}

// Thêm class này ở cuối file nếu chưa có để Backend đọc được dữ liệu
public class TestSubmitRequest {
    public int StepId { get; set; }
    public List<AnswerItem> Answers { get; set; } = new();
}

public class AnswerItem {
    public int QuestionId { get; set; }
    public string UserAnswer { get; set; } = string.Empty;
}

        
    }
}