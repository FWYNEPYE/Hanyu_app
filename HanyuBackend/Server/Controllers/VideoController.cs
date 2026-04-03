using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Server.Data;
using Server.Models;
using System.Net.Http.Json; // Cần thiết cho PostAsJsonAsync

namespace Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class VideosController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly string _uploadFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/uploads/videos");

        public VideosController(AppDbContext context)
        {
            _context = context;
            if (!Directory.Exists(_uploadFolder)) Directory.CreateDirectory(_uploadFolder);
        }

        // 1. Hàm lấy danh sách Video (React cần cái này để hiện list ban đầu)
        [HttpGet]
        public async Task<IActionResult> GetVideos()
        {
            var videos = await _context.Videos.OrderByDescending(v => v.CreatedAt).ToListAsync();
            return Ok(videos);
        }

        // 2. Hàm Upload
        [HttpPost("upload")]
        public async Task<IActionResult> UploadVideo([FromForm] Video dto)
        {
            if (string.IsNullOrEmpty(dto.Title)) return BadRequest("Thiếu tiêu đề rồi mày ơi!");

            string finalPath = "";

            if (dto.VideoType == "youtube")
            {
                finalPath = dto.UrlOrPath;
            }
            else if (dto.VideoType == "local" && dto.File != null)
            {
                var fileName = $"{Guid.NewGuid()}_{dto.File.FileName}";
                var filePath = Path.Combine(_uploadFolder, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await dto.File.CopyToAsync(stream);
                }
                finalPath = $"/uploads/videos/{fileName}";
            }
            else 
            {
                return BadRequest("Dữ liệu video không hợp lệ!");
            }

            var newVideo = new Video
            {
                Title = dto.Title,
                VideoType = dto.VideoType,
                UrlOrPath = finalPath,
                CreatedAt = DateTime.Now
            };

            _context.Videos.Add(newVideo);
            await _context.SaveChangesAsync();

            return Ok(newVideo);
        }

        // 3. Hàm Analyze AI (Đã sửa lỗi)
        [HttpPost("analyze")]
        public async Task<IActionResult> AnalyzeVideoText([FromBody] string text)
        {
            using var client = new HttpClient();
            
            var prompt = $"Phân tích câu tiếng Trung này: '{text}'. Trả về duy nhất 1 đối tượng JSON có: pinyin, vi (dịch Việt), tokens (mảng gồm char, pinyin, mean, type).";

            var requestBody = new
            {
                model = "qwen2.5-7b-instruct-1m", 
                messages = new[] {
                    new { role = "system", content = "You are a professional Chinese language teacher. Always reply in clean JSON." },
                    new { role = "user", content = prompt }
                },
                temperature = 0.3
            };

            try 
            {
                // Sử dụng PostAsJsonAsync giúp code cực ngắn gọn
                var response = await client.PostAsJsonAsync("http://localhost:1234/v1/chat/completions", requestBody);
                
                if (response.IsSuccessStatusCode)
                {
                    var result = await response.Content.ReadAsStringAsync();
                    return Ok(result);
                }
                
                return BadRequest("LM Studio trả về lỗi rồi mày ơi.");
            } 
            catch (Exception ex) 
            {
                return BadRequest("AI Server chưa bật hoặc không kết nối được: " + ex.Message);
            }
        }
    }
}