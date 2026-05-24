using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Server.Data;
using Server.Models;
using Server.Services;
using System.Net.Http.Json;
using System.Net.Http.Headers;
using YoutubeExplode;
using YoutubeExplode.Videos.Streams;
using System.Text.Json;

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
public async Task<IActionResult> GetVideos([FromQuery] int userId)
{
    // Lọc video theo UserID đã được định nghĩa trong Model Video
    var videos = await _context.Videos
        .Where(v => v.UserID == userId) 
        .OrderByDescending(v => v.CreatedAt)
        .ToListAsync();
        
    return Ok(videos);
}



        [HttpPost("upload")]
        public async Task<IActionResult> UploadVideo([FromForm] Video dto)
        {
            // LỖI: Cần kiểm tra UserID nếu bạn muốn gán video cho ai đó
            if (string.IsNullOrEmpty(dto.Title)) return BadRequest("Thiếu tiêu đề rồi!");

            string finalPath = dto.UrlOrPath ?? "";

            if (dto.VideoType == "local" && dto.File != null)
            {
                var fileName = $"{Guid.NewGuid()}{Path.GetExtension(dto.File.FileName)}";
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
                UserID = dto.UserID, // Đảm bảo gán UserID để hiển thị bên Admin
                CreatedAt = DateTime.UtcNow
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
public async Task<IActionResult> AutoGenerateSub(int videoId, [FromServices] IHttpClientFactory httpClientFactory)
{
    var video = await _context.Videos.FindAsync(videoId);
    if (video == null) return NotFound("Không tìm thấy video.");

    try {
        var apiKey = await _configService.GetConfigAsync("ApiKey");
        var client = httpClientFactory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);

        Stream audioStream;
        if (video.VideoType == "youtube") {
            var youtube = new YoutubeClient();
            var ytVideoId = YoutubeExplode.Videos.VideoId.Parse(video.UrlOrPath!);
            var streamManifest = await youtube.Videos.Streams.GetManifestAsync(ytVideoId);
            var streamInfo = streamManifest.GetAudioOnlyStreams().GetWithHighestBitrate();
            audioStream = await client.GetStreamAsync(streamInfo.Url);
        } 
        else {
            var fullPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", video.UrlOrPath.TrimStart('/'));
            if (!System.IO.File.Exists(fullPath)) return BadRequest("File video không tồn tại.");
            audioStream = System.IO.File.OpenRead(fullPath);
        }

        // 1. GỬI FILE QUA WHISPER ĐỂ LẤY TEXT VÀ TIMELINE
        using var requestContent = new MultipartFormDataContent();
        var audioContent = new StreamContent(audioStream);
        audioContent.Headers.ContentType = MediaTypeHeaderValue.Parse("audio/mpeg");
        requestContent.Add(audioContent, "file", "audio.mp3");
        requestContent.Add(new StringContent("whisper-large-v3"), "model");
        requestContent.Add(new StringContent("zh"), "language");
        requestContent.Add(new StringContent("verbose_json"), "response_format");

        var response = await client.PostAsync("https://api.groq.com/openai/v1/audio/transcriptions", requestContent);
        if (!response.IsSuccessStatusCode) return BadRequest(await response.Content.ReadAsStringAsync());

       var result = await response.Content.ReadFromJsonAsync<GroqWhisperResponse>();
if (result?.Segments == null) return BadRequest("Không nhận diện được âm thanh.");

var finalSubtitles = new List<Subtitle>();

// TĂNG TỐC: Gom 5 câu vào 1 lần gọi AI để không bị sót sub và nhanh hơn
var chunks = result.Segments.Chunk(5); 

foreach (var chunk in chunks)
{
    var combinedText = string.Join("\n", chunk.Select((s, i) => $"{i}|{s.Text}"));
    
    var aiPrompt = $@"Dịch các câu tiếng Trung sau sang tiếng Việt, cung cấp Pinyin cho cả câu, 
                 và chia câu thành các từ (tokens) chi tiết.
                 Yêu cầu JSON có key 'data' chứa mảng các object.
                 Mỗi token phải có: 
                 - 'char': Hán tự
                 - 'pinyin': pinyin của từ
                 - 'mean': nghĩa ngắn gọn
                 - 'type': loại từ (VD: đ.từ, d.từ, t.từ, đại từ, trợ từ...)
                 - 'note': ghi chú giải thích cách dùng từ đó trong ngữ cảnh câu này (giống như từ điển).
                 
                 Định dạng: {{ 
                    ""data"": [{{
                        ""vi"": ""..."", 
                        ""pinyin"": ""..."", 
                        ""tokens"": [{{ ""char"": ""..."", ""pinyin"": ""..."", ""mean"": ""..."", ""type"": ""..."", ""note"": ""..."" }}] 
                    }}] 
                 }}
                 Sentences:
                 {combinedText}";
    // Gợi ý bổ sung cho aiRequestBody
var aiRequestBody = new {
    model = "llama-3.3-70b-versatile",
    messages = new[] {
        new { 
            role = "system", 
            content = "You are a professional Chinese-Vietnamese translator. Always respond with a JSON object containing a 'data' key which is an array of objects. Each object must have 'vi' (Vietnamese translation) and 'pinyin' (standard Hanyu Pinyin) keys." 
        },
        new { role = "user", content = aiPrompt }
    },
    response_format = new { type = "json_object" }
};

    var aiRes = await client.PostAsJsonAsync("https://api.groq.com/openai/v1/chat/completions", aiRequestBody);
    
    if (aiRes.IsSuccessStatusCode) {
    var aiRoot = await aiRes.Content.ReadFromJsonAsync<JsonElement>();
    var contentString = aiRoot.GetProperty("choices")[0].GetProperty("message").GetProperty("content").GetString();
    
    using var doc = JsonDocument.Parse(contentString);
    
    // SỬA TẠI ĐÂY: Lấy mảng từ thuộc tính "data" thay vì EnumerateArray trực tiếp RootElement
    JsonElement dataArray;
    if (doc.RootElement.ValueKind == JsonValueKind.Array) {
        dataArray = doc.RootElement;
    } else {
        dataArray = doc.RootElement.GetProperty("data");
    }
    
    var resList = dataArray.EnumerateArray().ToList();

    for (int i = 0; i < chunk.Length; i++) {
    // Lấy object tương ứng từ kết quả AI
    var aiItem = i < resList.Count ? resList[i] : (JsonElement?)null;

    // Trích xuất mảng tokens từ AI
    var tokensArray = "[]";
    if (aiItem != null && aiItem.Value.TryGetProperty("tokens", out var tokensProp)) {
        // Chuyển mảng tokens thành chuỗi JSON để lưu vào DB
        tokensArray = tokensProp.GetRawText(); 
    }

    finalSubtitles.Add(new Subtitle {
        VideoId = videoId,
        StartTime = chunk[i].Start,
        EndTime = chunk[i].End,
        Content = chunk[i].Text,
        Translation = aiItem?.GetProperty("vi").GetString() ?? "Lỗi dịch",
        Pinyin = aiItem?.GetProperty("pinyin").GetString() ?? "",
        Tokens = tokensArray // ĐÃ SỬA: Không còn là mảng rỗng nữa
    });
}
}
    else {
        // Nếu AI lỗi, vẫn phải giữ lại chữ Hán và Time cho user
        foreach (var s in chunk) {
            finalSubtitles.Add(new Subtitle {
                VideoId = videoId, StartTime = s.Start, EndTime = s.End,
                Content = s.Text, Translation = "Chưa dịch được", Pinyin = "", Tokens = "[]"
            });
        }
    }
    
    // Nghỉ 1 chút để không bị Groq khóa (Rate limit)
    await Task.Delay(500); 
}

        // 3. LƯU VÀO DATABASE
        using var transaction = await _context.Database.BeginTransactionAsync();
        try {
            var oldSubs = _context.Subtitles.Where(s => s.VideoId == videoId);
            _context.Subtitles.RemoveRange(oldSubs);

            await _context.Subtitles.AddRangeAsync(finalSubtitles);
            await _context.SaveChangesAsync();
            await transaction.CommitAsync();
            
            return Ok(new { status = "Success", count = finalSubtitles.Count });
        }
        catch (Exception) {
            await transaction.RollbackAsync();
            throw;
        }
    }
    catch (Exception ex) { 
        return StatusCode(500, $"Lỗi: {ex.Message}"); 
    }
}

[HttpGet("{id}")]
public async Task<IActionResult> GetVideoDetail(int id, [FromQuery] int userId)
{
    var video = await _context.Videos
        .Include(v => v.Subtitles)
        .FirstOrDefaultAsync(v => v.VideoId == id);

    if (video == null) return NotFound();

    // Trả về dữ liệu phẳng để Frontend không phải parse phức tạp
    return Ok(new { 
        video.VideoId, 
        video.Title, 
        video.UrlOrPath, 
        video.VideoType, 
        // Đảm bảo Subtitles luôn được sắp xếp theo thời gian
        Subtitles = video.Subtitles.OrderBy(s => s.StartTime).Select(s => new {
            s.VideoId,
            s.StartTime,
            s.EndTime,
            s.Content,
            s.Pinyin,
            s.Translation,
            // Nếu Tokens là chuỗi JSON trong DB, hãy để Frontend tự parse hoặc parse tại đây
            Tokens = s.Tokens 
        }).ToList() 
    });
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