using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Server.Data;
using Server.Models;
using System.Net.Http.Json; // Cần thiết cho PostAsJsonAsync
using YoutubeExplode;
using YoutubeExplode.Videos.Streams;


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

        public class AnalyzeRequest {
            public string Text { get; set; }
        }


                // 3. Hàm Analyze AI (Đã sửa lỗi)
  [HttpPost("analyze")]
public async Task<IActionResult> AnalyzeVideoText([FromBody] AnalyzeRequest request)
{
    if (string.IsNullOrEmpty(request.Text)) return BadRequest("Thiếu text!");

    using var client = new HttpClient();
    var apiKey = "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".Trim();
    client.DefaultRequestHeaders.TryAddWithoutValidation("Authorization", $"Bearer {apiKey}");

    // Sửa Prompt: Ép AI trả về chữ thường (camelCase) để React dễ đọc
    var prompt = $@"Analyze the Chinese sentence: '{request.Text}'.
    Return a JSON object ONLY with this structure:
    {{
      ""vi"": ""dịch câu"",
      ""pinyin"": ""full pinyin"",
      ""tokens"": [
        {{ ""char"": ""chữ hán"", ""pinyin"": ""pinyin"", ""mean"": ""nghĩa"", ""type"": ""loại từ"" }}
      ]
    }}";

    var requestBody = new {
        model = "llama-3.3-70b-versatile",
        messages = new[] {
            new { role = "system", content = "You are a linguistics expert. Output ONLY raw JSON." },
            new { role = "user", content = prompt }
        },
        response_format = new { type = "json_object" }
    };

    var response = await client.PostAsJsonAsync("https://api.groq.com/openai/v1/chat/completions", requestBody);
    var root = await response.Content.ReadFromJsonAsync<System.Text.Json.JsonElement>();
    
    // Lấy chuỗi JSON từ AI trả về
    string content = root.GetProperty("choices")[0].GetProperty("message").GetProperty("content").GetString();

    // Trả về JSON sạch cho React
    return Content(content, "application/json");
}





[HttpPost("{videoId}/seed-subs")]
public async Task<IActionResult> SeedSubtitles(int videoId)
{
    var subs = new List<Subtitle>
    {
        new Subtitle { VideoId = videoId, StartTime = 0, EndTime = 5, Content = "你好，最近怎么样？" },
        new Subtitle { VideoId = videoId, StartTime = 6, EndTime = 10, Content = "我很喜欢学习汉语。" },
        new Subtitle { VideoId = videoId, StartTime = 11, EndTime = 15, Content = "这个视频很有意思。" }
    };
    _context.Subtitles.AddRange(subs);
    await _context.SaveChangesAsync();
    return Ok("Đã nạp sub mẫu thành công!");
}


[HttpGet("{id}")]
public async Task<IActionResult> GetVideoDetail(int id)
{
    // Lấy video và lôi toàn bộ Subtitles của nó ra
    var video = await _context.Videos
        .Include(v => v.Subtitles) 
        .FirstOrDefaultAsync(v => v.VideoId == id);

    if (video == null) return NotFound();

    return Ok(new {
        video.VideoId,
        video.Title,
        video.UrlOrPath,
        video.VideoType,
        // Sắp xếp sub theo thời gian để hiện thị đúng thứ tự câu chuyện
        Subtitles = video.Subtitles.OrderBy(s => s.StartTime).ToList()
    });
}



[HttpPost("{videoId}/auto-generate-sub")]
public async Task<IActionResult> AutoGenerateSub(int videoId)
{
    var video = await _context.Videos.FindAsync(videoId);
    if (video == null) return NotFound("Video không tồn tại");

    try
    {
        // 1. Lấy Audio (Giữ nguyên)
        var youtube = new YoutubeClient();
        var streamManifest = await youtube.Videos.Streams.GetManifestAsync(video.UrlOrPath!);
        var streamInfo = streamManifest.GetAudioOnlyStreams().GetWithHighestBitrate();
        using var httpClient = new HttpClient();
        var audioBytes = await httpClient.GetByteArrayAsync(streamInfo.Url);

        // 2. Whisper (Giữ nguyên)
        using var groqClient = new HttpClient();
        var apiKey = "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";
        groqClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {apiKey}");

        using var content = new MultipartFormDataContent();
        var fileContent = new ByteArrayContent(audioBytes);
        fileContent.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue("audio/mpeg");
        content.Add(fileContent, "file", "audio.mp3");
        content.Add(new StringContent("whisper-large-v3"), "model");
        content.Add(new StringContent("zh"), "language");
        content.Add(new StringContent("verbose_json"), "response_format");

        var response = await groqClient.PostAsync("https://api.groq.com/openai/v1/audio/transcriptions", content);
        if (!response.IsSuccessStatusCode) return StatusCode((int)response.StatusCode, "Lỗi khi gọi Whisper Groq");

        var result = await response.Content.ReadFromJsonAsync<GroqWhisperResponse>();
        if (result?.Segments == null) return BadRequest("Không lấy được segments từ Whisper");

        // Xóa sub cũ
        var oldSubs = _context.Subtitles.Where(s => s.VideoId == videoId);
        _context.Subtitles.RemoveRange(oldSubs);

       foreach (var seg in result.Segments)
{
    try {
        // PHẢI dùng tiếng Việt ở đây để AI hiểu ngữ cảnh dịch sang tiếng Việt
        var analyzePrompt = $@"Phân tích câu: '{seg.Text}'. 
Yêu cầu JSON:
{{
  ""vi"": ""Dịch nghĩa cả câu (tiếng Việt)"",
  ""pinyin"": ""Phiên âm"",
  ""tokens"": [
    {{ 
      ""char"": ""Chữ"", 
      ""pinyin"": ""phiên âm"", 
      ""vi"": ""Nghĩa tiếng Việt của từ"" 
    }}
  ]
}}";
        var analyzeBody = new {
    model = "llama-3.3-70b-versatile",
    messages = new[] { 
        // ĐỊNH NGHĨA LẠI VAI TRÒ CỦA AI Ở ĐÂY
        new { role = "system", content = "Bạn là trợ lý học tiếng Trung cho người Việt. Nhiệm vụ của bạn là dịch và giải nghĩa hoàn toàn bằng tiếng Việt thuần túy. TUYỆT ĐỐI không sử dụng tiếng Anh hoặc giữ nguyên tiếng Trung trong phần giải nghĩa." },
        new { role = "user", content = analyzePrompt } 
    },
    response_format = new { type = "json_object" }
};

        await Task.Delay(1500); // Chống Rate Limit 429

        var aiRes = await groqClient.PostAsJsonAsync("https://api.groq.com/openai/v1/chat/completions", analyzeBody);
        
        if (!aiRes.IsSuccessStatusCode) continue;

        var aiJson = await aiRes.Content.ReadFromJsonAsync<System.Text.Json.JsonElement>();
        string aiContent = aiJson.GetProperty("choices")[0].GetProperty("message").GetProperty("content").GetString();
        
        var parsedAi = System.Text.Json.JsonSerializer.Deserialize<System.Text.Json.JsonElement>(aiContent);

       var newSub = new Subtitle
{
    VideoId = videoId,
    StartTime = seg.Start,
    EndTime = seg.End,
    Content = seg.Text,
    Pinyin = parsedAi.TryGetProperty("pinyin", out var p) ? p.GetString() : "",
    Translation = parsedAi.TryGetProperty("vi", out var v) ? v.GetString() : "", 
    // Lưu ý: t.ToString() sẽ lưu toàn bộ mảng JSON của tokens vào DB
    Tokens = parsedAi.TryGetProperty("tokens", out var t) ? t.ToString() : "[]" 
};
        _context.Subtitles.Add(newSub);
    }
    catch { continue; }
}

        await _context.SaveChangesAsync();
        return Ok(new { status = "Success" });
    }
    catch (Exception ex)
    {
        // Log lỗi cụ thể ra console của VS để debug
        Console.WriteLine($"ERROR: {ex.Message}");
        return StatusCode(500, $"Lỗi server: {ex.Message}");
    }
}

// 1. Xóa Video và Subtitles liên quan
[HttpDelete("{id}")]
public async Task<IActionResult> DeleteVideo(int id)
{
    var video = await _context.Videos.Include(v => v.Subtitles).FirstOrDefaultAsync(v => v.VideoId == id);
    if (video == null) return NotFound();

    _context.Videos.Remove(video);
    await _context.SaveChangesAsync();
    return Ok(new { message = "Đã xóa video!" });
}

// 2. Thêm từ vựng vào bộ từ
[HttpPost("add-vocabulary")]
public async Task<IActionResult> AddVocabulary([FromBody] Vocabulary vocab)
{
    // Giả sử bạn đã có Model Vocabulary trong Database
    _context.Vocabularies.Add(vocab);
    await _context.SaveChangesAsync();
    return Ok(new { message = "Đã thêm vào bộ từ!" });
}
// Class bổ trợ để hứng data từ Groq Whisper
public class GroqWhisperResponse {
    public List<Segment> Segments { get; set; }
}
public class Segment {
    public double Start { get; set; }
    public double End { get; set; }
    public string Text { get; set; }
}
 
    }
}