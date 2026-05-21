using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Server.Data;
using Server.Models;

namespace Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AdminVideoController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AdminVideoController(AppDbContext context)
        {
            _context = context;
        }

        // 1. Lấy danh sách User đã từng đăng video
        [HttpGet("users-active")]
        public async Task<IActionResult> GetUsersActive()
        {
            var users = await _context.Videos
                .Where(v => v.UserID != null)
                .GroupBy(v => new { v.UserID, v.User.Username }) // Nhóm lại theo User
                .Select(g => new { 
                    userID = g.Key.UserID, 
                    username = g.Key.Username 
                })
                .ToListAsync();
            return Ok(users);
        }

        // 2. Lấy danh sách Video của một User cụ thể
        [HttpGet("user-videos/{userId}")]
        public async Task<IActionResult> GetUserVideos(int userId)
        {
            try
            {
                var videos = await _context.Videos
                    .Where(v => v.UserID == userId)
                    .OrderByDescending(v => v.CreatedAt)
                    .Select(v => new {
                        id = v.VideoId,
                        title = v.Title,
                        status = v.VideoType ?? "Pending", // Giả định dùng VideoType để phân loại trạng thái
                        time = v.CreatedAt.ToString("dd/MM/yyyy HH:mm")
                    })
                    .ToListAsync();

                return Ok(videos);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Lỗi lấy danh sách Video: " + ex.Message });
            }
        }

        // 3. Lấy chi tiết Video & Kết quả quét AI (Mockup logic quét)
        [HttpGet("video-detail/{videoId}")]
        public async Task<IActionResult> GetVideoDetail(int videoId)
        {
            try
            {
                var video = await _context.Videos
                    .Include(v => v.User)
                    .FirstOrDefaultAsync(v => v.VideoId == videoId);

                if (video == null) return NotFound();

                // Logic tách YouTube ID từ UrlOrPath
                string youtubeId = "";
                if (!string.IsNullOrEmpty(video.UrlOrPath))
                {
                    // Hỗ trợ cả link watch?v= và link rút gọn youtu.be/
                    var uri = new Uri(video.UrlOrPath);
                    var query = Microsoft.AspNetCore.WebUtilities.QueryHelpers.ParseQuery(uri.Query);
                    youtubeId = query.ContainsKey("v") ? query["v"].ToString() : uri.Segments.Last();
                }

                return Ok(new {
                    id = video.VideoId,
                    title = video.Title,
                    youtubeUrl = video.UrlOrPath,
                    youtubeId = youtubeId,
                    // Giả lập dữ liệu AI quét nội dung
                    aiAnalysis = new {
                        nsfwScore = new Random().Next(0, 15), // Mockup: Tỉ lệ nhạy cảm thấp
                        isSensitive = false,
                        transcriptionSummary = "Video chứa nội dung hội thoại tiếng Trung về chủ đề đời thường, không phát hiện vi phạm."
                    }
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Lỗi lấy chi tiết video: " + ex.Message });
            }
        }

        // 4. Phê duyệt hoặc Xóa Video
        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> DeleteVideo(int id)
        {
            var video = await _context.Videos.FindAsync(id);
            if (video == null) return NotFound();

            _context.Videos.Remove(video);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Đã gỡ bỏ video thành công." });
        }
    }
}