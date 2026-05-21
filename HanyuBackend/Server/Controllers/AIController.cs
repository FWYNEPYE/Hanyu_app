using Microsoft.AspNetCore.Mvc;
using Server.Data;
using Server.Models;
using Server.Services;
using Microsoft.EntityFrameworkCore;

namespace Server.Controllers 
{
    [ApiController]
    [Route("api/[controller]")]
    public class AIController : ControllerBase
    {
        private readonly GroqService _groqService;
        private readonly AppDbContext _context;

        public AIController(GroqService groqService, AppDbContext context)
        {
            _groqService = groqService;
            _context = context;
        }

        [HttpPost("chat")]
        public async Task<IActionResult> Chat([FromBody] ChatRequest request)
        {
            if (string.IsNullOrEmpty(request.Message))
                return BadRequest("Tin nhắn không được để trống.");

            try 
            {
                var sid = string.IsNullOrEmpty(request.SessionID) ? Guid.NewGuid().ToString() : request.SessionID;

                // Bước A: Lưu tin nhắn User
                var userMsg = new ChatHistory {
                    UserID = request.UserId, 
                    SessionID = sid, 
                    Content = request.Message,
                    Role = "user",
                    CreatedAt = DateTime.Now
                };
                _context.ChatHistories.Add(userMsg);

                var aiResult = await _groqService.GetLiliChat(request.Message);

                var aiMsg = new ChatHistory {
                    UserID = request.UserId,
                    SessionID = sid,
                    Content = aiResult.Text,
                    Pinyin = aiResult.Pinyin,
                    Translation = aiResult.Translation,
                    Role = "ai",
                    CreatedAt = DateTime.Now
                };
                _context.ChatHistories.Add(aiMsg);
                
                await _context.SaveChangesAsync(); 

                return Ok(aiMsg);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Lỗi hệ thống Lili", detail = ex.Message });
            }
        }

        [HttpGet("sessions/{userId}")]
        public async Task<IActionResult> GetSessions(int userId)
        {
            try
            {
                var sessions = await _context.ChatHistories
                    .Where(c => c.UserID == userId)
                    .GroupBy(c => c.SessionID)
                    .Select(g => new {
                        SessionId = g.Key,
                        Title = g.Where(m => m.Role == "user")
                                .OrderBy(m => m.CreatedAt)
                                .Select(m => m.Content)
                                .FirstOrDefault() ?? "Cuộc hội thoại mới",
                        LastMessageAt = g.Max(m => m.CreatedAt)
                    })
                    .OrderByDescending(s => s.LastMessageAt)
                    .ToListAsync();

                return Ok(sessions);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Lỗi: {ex.Message}");
            }
        }

        [HttpGet("history/session/{sessionId}")]
        public async Task<IActionResult> GetMessagesBySession(string sessionId)
        {
            try
            {
                // Lấy TOÀN BỘ tin nhắn của session này
                var history = await _context.ChatHistories
                    .Where(c => c.SessionID == sessionId)
                    .OrderBy(c => c.CreatedAt) // Sắp xếp từ cũ đến mới
                    .ToListAsync();

                if (history == null || !history.Any())
                    return NotFound("Không tìm thấy tin nhắn cho hội thoại này.");

                return Ok(history);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Lỗi lấy chi tiết hội thoại: {ex.Message}");
            }
        }

        [HttpPost("context-hint")]
        public IActionResult GetHint([FromBody] DiagnosisRequest request)
        {
            var response = new AIResponse();
            if (request.CurrentPage.Contains("vocabulary")) {
                response.Text = "发现你在背单词！要不要考一下？✍️";
                response.Translation = "Thấy bạn đang học từ vựng! Kiểm tra thử không?";
            } else if (request.CurrentPage.Contains("video")) {
                response.Text = "这段视频很有趣吧？🎥";
                response.Translation = "Video này thú vị chứ?";
            } else {
                response.Text = "你好啊! 我是Lili, 准备好学了吗？🐾";
                response.Translation = "Chào bạn! Mìn là Lili, sẵn sàng học chưa?";
            }
            return Ok(response);
        }
    }

    public class ChatRequest
    {
        public int UserId { get; set; }
        public string? SessionID { get; set; } 
        public string Message { get; set; } = string.Empty;
    }

    public class DiagnosisRequest { public string CurrentPage { get; set; } = string.Empty; }
    public class AIResponse { public string Text { get; set; } = string.Empty; public string Pinyin { get; set; } = string.Empty; public string Translation { get; set; } = string.Empty; }
}