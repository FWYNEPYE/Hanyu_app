using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Server.Data;
using Server.Models;

namespace Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AdminCommunityController : ControllerBase
    {
        private readonly AppDbContext _context;
        public AdminCommunityController(AppDbContext context) => _context = context;

        [HttpGet("all-decks")]
        public async Task<IActionResult> GetAllDecks()
        {
            var decks = await _context.Categories
                .Include(c => c.User)
                .Include(c => c.Vocabularies)
                .Where(c => c.CategoryType == "user" && (c.IsPending || c.IsPublic || c.IsLocked)) 
                .OrderByDescending(c => c.CategoryID)
                .ToListAsync(); // Lấy list trước để xử lý logic avatar dễ hơn

            var result = decks.Select(c => new {
                id = c.CategoryID,
                user = c.User?.Username ?? "Ẩn danh",
                // ĐỒNG BỘ LOGIC AVATAR: Lấy ảnh thật từ server nếu có
                authorAvatar = (c.User != null && !string.IsNullOrEmpty(c.User.AvatarUrl)) 
                                ? $"http://localhost:5252{c.User.AvatarUrl}" 
                                : null,
                setName = c.CategoryName,
                wordCount = c.Vocabularies.Count,
                level = c.Tags,
                likes = c.LikesCount,
                // VIỆT HÓA HOÀN TOÀN TRẠNG THÁI
                status = c.IsLocked ? "Đã khóa" : (c.IsPublic ? "Đã duyệt" : "Đang chờ"), 
                time = c.UpdatedAt.ToString("dd/MM/yyyy HH:mm"),
                vocabularies = c.Vocabularies.Select(v => new {
                    word = v.Hanzi,
                    pinyin = v.Pinyin,
                    meaning = v.Meaning,
                    example = v.Example
                })
            }).ToList();

            return Ok(result);
        }

        [HttpPut("approve/{id}")]
        public async Task<IActionResult> ApproveDeck(string id)
        {
            var deck = await _context.Categories.FindAsync(id);
            if (deck == null) return NotFound(new { message = "Không tìm thấy bộ từ!" });

            deck.IsPublic = true;     
            deck.IsPending = false;    
            deck.IsLocked = false;     
            deck.Version += 1; // Tăng version để app của user nhận biết có cập nhật
            deck.UpdatedAt = DateTime.Now;

            await _context.SaveChangesAsync();
            return Ok(new { success = true, message = "Đã duyệt bộ từ này lên sàn công khai!" });
        }

        [HttpPut("reject/{id}")]
        public async Task<IActionResult> RejectDeck(string id)
        {
            var deck = await _context.Categories.FindAsync(id);
            if (deck == null) return NotFound(new { message = "Không tìm thấy bộ từ!" });

            deck.IsPublic = false;     
            deck.IsPending = false;    
            deck.IsLocked = true;      
            deck.UpdatedAt = DateTime.Now;

            await _context.SaveChangesAsync();
            return Ok(new { success = true, message = "Đã khóa bộ từ thành công!" });
        }

        [HttpGet("deck-details/{id}")]
        public async Task<IActionResult> GetDeckDetails(string id)
        {
            var vocabList = await _context.Vocabularies
                .Where(v => v.CategoryID == id)
                .Select(v => new {
                    word = v.Hanzi,
                    pinyin = v.Pinyin,
                    meaning = v.Meaning,
                    example = v.Example
                })
                .ToListAsync();

            if (vocabList == null || !vocabList.Any()) 
                return NotFound(new { message = "Bộ từ này chưa có từ vựng nào!" });

            return Ok(vocabList);
        }
    }
}