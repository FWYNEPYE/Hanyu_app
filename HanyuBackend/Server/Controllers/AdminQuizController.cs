using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Server.Data;
using Server.Models;

namespace Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AdminQuizController : ControllerBase
    {
        private readonly AppDbContext _context;
        public AdminQuizController(AppDbContext context) => _context = context;

        // 1. Lấy toàn bộ danh sách câu đố sắp xếp
        [HttpGet("all")]
        public async Task<IActionResult> GetAllPuzzles()
        {
            var puzzles = await _context.SentencePuzzles
                .OrderByDescending(p => p.PuzzleId)
                .Select(p => new {
                    id = p.PuzzleId,
                    content = p.CorrectSentence, 
                    pinyin = p.Pinyin,          
                    points = p.PointsReward     
                })
                .ToListAsync();
            return Ok(puzzles);
        }

        // 2. Thêm câu đố mới
        [HttpPost("add")]
        public async Task<IActionResult> AddPuzzle([FromBody] SentencePuzzle model)
        {
            if (string.IsNullOrEmpty(model.CorrectSentence)) 
                return BadRequest(new { message = "Nhập câu tiếng Trung!" });

            _context.SentencePuzzles.Add(model);
            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Đã thêm câu đố sắp xếp mới!" });
        }

        // 3. Xóa câu đố
        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> DeletePuzzle(int id)
        {
            var puzzle = await _context.SentencePuzzles.FindAsync(id);
            if (puzzle == null) return NotFound();

            // Xóa lịch sử hoàn thành của user trước để tránh lỗi FK
            var completions = _context.UserPuzzleCompletions.Where(up => up.PuzzleID == id);
            _context.UserPuzzleCompletions.RemoveRange(completions);

            _context.SentencePuzzles.Remove(puzzle);
            await _context.SaveChangesAsync();
            
            return Ok(new { success = true, message = "Xóa sạch dấu vết!" });
        }
    }
}