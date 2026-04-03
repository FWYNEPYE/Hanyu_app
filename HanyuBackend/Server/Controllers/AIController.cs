using Microsoft.AspNetCore.Mvc;
using Server.Data;
using Server.Models;
using Server.Services;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace Server.Controllers 
{
    [ApiController]
    [Route("api/[controller]")]
    public class AIController : ControllerBase
    {
        private readonly GroqService _groqService;
        private readonly AppDbContext _context;

        // Tiêm (Inject) Service và Database vào Controller
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
                // Bước A: Lưu tin nhắn của User vào Database
                var userMsg = new ChatHistory {
                    UserID = request.UserId, 
                    Content = request.Message,
                    Role = "user",
                    CreatedAt = DateTime.Now
                };
                _context.ChatHistories.Add(userMsg);

                var aiResult = await _groqService.GetLiliChat(request.Message);

                // Bước C: Lưu câu trả lời của AI vào Database
                var aiMsg = new ChatHistory {
                    UserID = request.UserId,
                    Content = aiResult.Text,
                    Pinyin = aiResult.Pinyin,
                    Translation = aiResult.Translation,
                    Role = "ai",
                    CreatedAt = DateTime.Now
                };
                _context.ChatHistories.Add(aiMsg);
                
                // Chốt sổ xuống SQL Server
                await _context.SaveChangesAsync(); 

                return Ok(aiMsg);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Lỗi hệ thống Lili", detail = ex.Message });
            }
        }

        [HttpPost("context-hint")]
        public IActionResult GetHint([FromBody] DiagnosisRequest request)
        {
            var response = new AIResponse();

            // Logic cũ: Dựa vào trang (URL) để đưa ra câu chào phù hợp
            if (request.CurrentPage.Contains("vocabulary"))
            {
                response.Text = "发现你在背单词！要不要考一下？✍️";
                response.Pinyin = "Fāxiàn nǐ zài bèi dāncí! Yào bùyào kǎoshì yīxià?";
                response.Translation = "Thấy mày đang học từ vựng! Kiểm tra thử không?";
            }
            else if (request.CurrentPage.Contains("video"))
            {
                response.Text = "这段视频很有趣吧？🎥";
                response.Pinyin = "Zhè duàn shìpín hěn yǒuqù ba?";
                response.Translation = "Video này thú vị chứ?";
            }
            else
            {
                response.Text = "你好! 我是 Lili, 准备好学习了吗? 🐾";
                response.Pinyin = "Nǐ hǎo! Wǒ shì Lili, zhǔnbèi hǎo xuéxí le ma?";
                response.Translation = "Chào mày! Tao là Lili, sẵn sàng học chưa?";
            }

            return Ok(response);
        }
        [HttpGet("history/{userId}")]
        public async Task<IActionResult> GetChatHistory(int userId)
        {
            try
            {
                // Lấy 50 tin nhắn gần nhất của thằng user này
                var history = await _context.ChatHistories
                    .Where(c => c.UserID == userId)
                    .OrderBy(c => c.CreatedAt)
                    .Take(50)
                    .ToListAsync();

                return Ok(history);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Lỗi lấy lịch sử: {ex.Message}");
            }
        }
    }

    public class ChatRequest
    {
        public int UserId { get; set; }
        public string Message { get; set; } = string.Empty;
    }

    public class DiagnosisRequest
    {
        public string CurrentPage { get; set; } = string.Empty;
    }

    public class AIResponse
    {
        public string Text { get; set; } = string.Empty;
        public string Pinyin { get; set; } = string.Empty;
        public string Translation { get; set; } = string.Empty;
    }
}