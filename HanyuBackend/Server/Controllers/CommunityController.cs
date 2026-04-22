using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Server.Data;
using Server.Models;

namespace Server.Controllers
{
    [ApiController]
    [Route("api/community")]
    public class CommunityController : ControllerBase
    {
        private readonly AppDbContext _context;
        public CommunityController(AppDbContext context) => _context = context;

        //  Lấy danh sách bộ từ công khai
        [HttpGet("decks")]
        public async Task<IActionResult> GetPublicDecks([FromQuery] string? tab, [FromQuery] string? search)
        {
            var query = _context.Categories
                .Include(c => c.User)
                .Include(c => c.Vocabularies)
                .Where(c => c.IsPublic && c.CategoryType == "user")
                .AsQueryable();

            if (!string.IsNullOrEmpty(tab) && tab != "Tất cả")
                query = query.Where(c => c.Tags.Contains(tab) || c.CategoryName.Contains(tab));

            if (!string.IsNullOrEmpty(search))
                query = query.Where(c => c.CategoryName.Contains(search));

            var decks = await query.ToListAsync();

            var result = decks.Select(c => {
                int wordCount = c.Vocabularies.Count;
                return new {
                    Id = c.CategoryID,
                    Title = c.CategoryName,
                    Description = c.Description,
                    Author = c.User?.Username ?? "Hanyu User",
                    AuthorId = c.UserID, 
                    Version = c.Version, // Đảm bảo chữ V viết hoa
                    authorAvatar = (c.User != null && !string.IsNullOrEmpty(c.User.AvatarUrl)) 
                                    ? $"http://localhost:5252{c.User.AvatarUrl}" 
                                    : null,
                    Words = wordCount,
                    Points = CalculateAutoPrice(wordCount), 
                    Icon = c.IconName,
                    Color = c.ColorClass,
                    Level = c.Tags,
                    likes = c.LikesCount
                };
            }).ToList();

            return Ok(result);
        }


        // Preview 5 từ 
[HttpGet("preview/{id}")]
public async Task<IActionResult> GetPreview(string id, [FromQuery] int userId)
{
    var allWords = await _context.Vocabularies.Where(v => v.CategoryID == id).ToListAsync();

    var isOwned = await _context.UserCategories.AnyAsync(uc => uc.UserID == userId && uc.CategoryID == id);

    var result = allWords.Select((v, index) => new {
        v.Hanzi, v.Pinyin, v.Meaning, v.Type, v.Example, v.ExampleMeaning, v.Note,
        IsLocked = !isOwned && index >= 4  // Nếu có vé thì IsLocked luôn là false
    });
    return Ok(result);
}




[HttpPost("redeem")]
public async Task<IActionResult> RedeemDeck([FromBody] RedeemReq req)
{
    var user = await _context.Users.FindAsync(req.UserId);
    var communityDeck = await _context.Categories.Include(c => c.Vocabularies).FirstOrDefaultAsync(c => c.CategoryID == req.DeckId);

    if (user == null || communityDeck == null) return NotFound();

    int price = CalculateAutoPrice(communityDeck.Vocabularies.Count);
    if (user.Points < price) return BadRequest(new { message = "Không đủ điểm!" });

    // Kiểm tra 
    var hasTicket = await _context.UserCategories
        .AnyAsync(uc => uc.UserID == req.UserId && uc.CategoryID == req.DeckId);
    
    if (hasTicket) return BadRequest(new { message = "Đã mua vé bộ này rồi!" });

    //  Trừ điểm
    user.Points -= price;

    //Lưu vào bảng trung gian
    _context.UserCategories.Add(new UserCategory {
        UserID = req.UserId,
        CategoryID = req.DeckId,
        PurchasedAt = DateTime.Now,
        SavedVersion = communityDeck.Version // Lưu lại để sau này biết có update hay không
    });

    await _context.SaveChangesAsync();
    return Ok(new { newPoints = user.Points, message = "Mở khóa thành công!" });
}





        [HttpPost("like/{id}")]
        public async Task<IActionResult> ToggleLike(string id, [FromQuery] bool isUnliking)
        {
            var deck = await _context.Categories.FindAsync(id);
            if (deck == null) return NotFound();

            if (isUnliking) {
                deck.LikesCount = Math.Max(0, deck.LikesCount - 1); // Giảm tim nhưng không âm
            } else {
                deck.LikesCount += 1; // Tăng tim
            }

            await _context.SaveChangesAsync();
            return Ok(new { likes = deck.LikesCount });
        }

         [HttpGet("owned/{userId}")]
        public async Task<IActionResult> GetOwnedDecks(int userId)
        {
            var owned = await _context.UserCategories
                .Where(uc => uc.UserID == userId)
                .Select(uc => new {
                    CategoryId = uc.CategoryID,
                    SavedVersion = uc.SavedVersion
                })
                .ToListAsync();

            return Ok(owned);
        }
            //ham tính số điểm cần đổi tự động
            private int CalculateAutoPrice(int wordCount)
            {
                if (wordCount <= 0) return 0;
                
                double price;
                
                if (wordCount <= 20) {
                    price = 15; 
                }
                else if (wordCount <= 50) {
                    price = 15 + (wordCount - 20) * 0.5;
                }
                else if (wordCount <= 100) {
                    price = 30 + (wordCount - 50) * 0.4;
                }
                else {
                    price = 100;
                }

                return (int)Math.Round(price);
            }
        }

    public class RedeemReq { public string DeckId { get; set; } = ""; public int UserId { get; set; } }
}