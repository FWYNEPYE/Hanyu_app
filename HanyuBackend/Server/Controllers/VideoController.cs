using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Server.Data;
using Server.Models;
using Server.Services;
using System.Net.Http.Json;
using System.Net.Http.Headers;
using YoutubeExplode;
using YoutubeExplode.Videos.Streams;

namespace Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class VideosController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ISystemConfigService _configService; 
        private readonly string _uploadFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/uploads/videos");

        public VideosController(AppDbContext context, ISystemConfigService configService)
        {
            _context = context;
            _configService = configService;
            if (!Directory.Exists(_uploadFolder)) Directory.CreateDirectory(_uploadFolder);
        }

        [HttpGet]
        public async Task<IActionResult> GetVideos()
        {
            var videos = await _context.Videos.OrderByDescending(v => v.CreatedAt).ToListAsync();
            return Ok(videos);
        }

        [HttpPost("upload")]
        public async Task<IActionResult> UploadVideo([FromForm] Video dto)
        {
            if (string.IsNullOrEmpty(dto.Title)) return BadRequest("Thiếu tiêu đề rồi!");

            string finalPath = dto.VideoType == "youtube" ? dto.UrlOrPath : "";

            if (dto.VideoType == "local" && dto.File != null)
            {
                var fileName = $"{Guid.NewGuid()}_{dto.File.FileName}";
                var filePath = Path.Combine(_uploadFolder, fileName);
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await dto.File.CopyToAsync(stream);
                }
                finalPath = $"/uploads/videos/{fileName}";
            }

            var newVideo = new Video {
                Title = dto.Title,
                VideoType = dto.VideoType,
                UrlOrPath = finalPath,
                CreatedAt = DateTime.Now
            };

            _context.Videos.Add(newVideo);
            await _context.SaveChangesAsync();
            return Ok(newVideo);
        }

        [HttpPost("analyze")]
        public async Task<IActionResult> AnalyzeVideoText([FromBody] AnalyzeRequest request)
        {
            if (string.IsNullOrEmpty(request.Text)) return BadRequest("Thiếu text!");

            var apiKey = await _configService.GetConfigAsync("ApiKey");
            using var client = new HttpClient();
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);

            var prompt = $@"Analyze the Chinese sentence: '{request.Text}'. Return JSON: {{ ""vi"": """", ""pinyin"": """", ""tokens"": [] }}";

            var requestBody = new {
                model = "llama-3.3-70b-versatile",
                messages = new[] {
                    new { role = "system", content = "Output ONLY raw JSON." },
                    new { role = "user", content = prompt }
                },
                response_format = new { type = "json_object" }
            };

            var response = await client.PostAsJsonAsync("https://api.groq.com/openai/v1/chat/completions", requestBody);
            var root = await response.Content.ReadFromJsonAsync<System.Text.Json.JsonElement>();
            string content = root.GetProperty("choices")[0].GetProperty("message").GetProperty("content").GetString();

            return Content(content, "application/json");
        }

        [HttpPost("{videoId}/auto-generate-sub")]
        public async Task<IActionResult> AutoGenerateSub(int videoId)
        {
            var video = await _context.Videos.FindAsync(videoId);
            if (video == null) return NotFound();

            try {
                var apiKey = await _configService.GetConfigAsync("ApiKey");
                
                // 1. Lấy Audio từ Youtube
                var youtube = new YoutubeClient();
                var streamManifest = await youtube.Videos.Streams.GetManifestAsync(video.UrlOrPath!);
                var streamInfo = streamManifest.GetAudioOnlyStreams().GetWithHighestBitrate();
                using var httpClient = new HttpClient();
                var audioBytes = await httpClient.GetByteArrayAsync(streamInfo.Url);

                // 2. Gọi Whisper Groq
                using var groqClient = new HttpClient();
                groqClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);

                using var content = new MultipartFormDataContent();
                content.Add(new ByteArrayContent(audioBytes), "file", "audio.mp3");
                content.Add(new StringContent("whisper-large-v3"), "model");
                content.Add(new StringContent("zh"), "language");
                content.Add(new StringContent("verbose_json"), "response_format");

                var response = await groqClient.PostAsync("https://api.groq.com/openai/v1/audio/transcriptions", content);
                var result = await response.Content.ReadFromJsonAsync<GroqWhisperResponse>();

                // 3. Xử lý lưu Sub
                var oldSubs = _context.Subtitles.Where(s => s.VideoId == videoId);
                _context.Subtitles.RemoveRange(oldSubs);

                foreach (var seg in result.Segments) {
                    _context.Subtitles.Add(new Subtitle {
                        VideoId = videoId,
                        StartTime = seg.Start,
                        EndTime = seg.End,
                        Content = seg.Text
                    });
                }
                await _context.SaveChangesAsync();
                return Ok(new { status = "Success" });
            }
            catch (Exception ex) { return StatusCode(500, ex.Message); }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetVideoDetail(int id)
        {
            var video = await _context.Videos.Include(v => v.Subtitles).FirstOrDefaultAsync(v => v.VideoId == id);
            if (video == null) return NotFound();
            return Ok(new { video.VideoId, video.Title, video.UrlOrPath, video.VideoType, Subtitles = video.Subtitles.OrderBy(s => s.StartTime).ToList() });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteVideo(int id) {
            var video = await _context.Videos.FindAsync(id);
            if (video == null) return NotFound();
            _context.Videos.Remove(video);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Đã xóa!" });
        }

        public class AnalyzeRequest { public string Text { get; set; } }
        public class GroqWhisperResponse { public List<Segment> Segments { get; set; } }
        public class Segment { public double Start { get; set; } public double End { get; set; } public string Text { get; set; } }
    }
}