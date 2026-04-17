using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Server.Data; // Chỉnh lại theo AppDbContext của sếp
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
        public async Task<IActionResult> GetPreview(string id)
        {
            var data = await _context.Vocabularies
                .Where(v => v.CategoryID == id)
                .Take(5)
                .ToListAsync();
            return Ok(data);
        }


        [HttpPost("redeem")]
        public async Task<IActionResult> Redeem([FromBody] RedeemReq req)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                //lấy bộ gốc
                var original = await _context.Categories
                    .Include(c => c.Vocabularies)
                    .AsNoTracking()
                    .FirstOrDefaultAsync(c => c.CategoryID == req.DeckId);

                var user = await _context.Users.FindAsync(req.UserId);

                if (original == null || user == null)
                    return NotFound(new { msg = "Không tìm thấy bộ từ vựng hoặc người dùng!" });

                //  Tìm bản copy hiện tại của User 
                var myCopy = await _context.Categories
                    .Include(c => c.Vocabularies)
                    .FirstOrDefaultAsync(c => c.UserID == req.UserId && c.ParentCategoryID == original.CategoryID);


                // --- TH CẬP NHẬT BỘ TỪ ĐÃ CÓ ---
                if (myCopy != null) {
                    await _context.Entry(myCopy).Collection(c => c.Vocabularies).Query().LoadAsync();
                    var myHanziList = myCopy.Vocabularies.Select(v => v.Hanzi.Trim().ToLower()).ToHashSet();

                    // Lọc từ mới
                    var newWords = original.Vocabularies
                        .Where(v => !myHanziList.Contains(v.Hanzi.Trim().ToLower()))
                        .ToList();

                    // CẬP NHẬT VERSION KHI CÓ TỪ MỚI HOẶC KHI USER BẤM CẬP NHẬT
                    if (newWords.Count == 0) {return BadRequest(new { msg = "Không có từ mới nào để cập nhật!" }); }

                        // Tính phí nạp thêm: 2 Point/từ
                    int updatePrice = newWords.Count * 2;
                    if (user.Points < updatePrice)
                        return BadRequest(new { msg = $"Cần {updatePrice} Point để nạp thêm {newWords.Count} từ!" });

                    user.Points -= updatePrice;

                        // Thêm từ mới vào kho của User
                    foreach (var v in newWords)
                        {
                            _context.Vocabularies.Add(new Vocabulary
                            {
                                CategoryID = myCopy.CategoryID,
                                Hanzi = v.Hanzi.Trim(),
                                Pinyin = v.Pinyin,
                                Meaning = v.Meaning,
                                Type = v.Type,
                                Example = v.Example,
                                ExampleMeaning = v.ExampleMeaning
                            });
                        }

                    myCopy.Version = original.Version; // Chỉ gán khi đã nạp xong từ
                    await _context.SaveChangesAsync();
                    }
                            // --- TH MUA MỚI  ---
                     else
                        {
                            int fullPrice = CalculateAutoPrice(original.Vocabularies.Count);
                            if (user.Points < fullPrice)
                                return BadRequest(new { msg = $"Bạn cần {fullPrice} Point để mua bộ từ này!" });

                            user.Points -= fullPrice;

                            var newCopyId = Guid.NewGuid().ToString().Substring(0, 8);
                            var newCopy = new Category
                                {
                                    CategoryID = newCopyId,
                                    CategoryName = original.CategoryName,
                                    CategoryType = "user",
                                    UserID = user.UserID,
                                    ParentCategoryID = original.CategoryID,
                                    Version = original.Version,
                                    Description = original.Description,
                                    IconName = original.IconName,
                                    ColorClass = original.ColorClass,
                                    Tags = original.Tags,
                                    IsPublic = false
                                };

                            _context.Categories.Add(newCopy);

                                // Copy toàn bộ từ vựng
                            foreach (var v in original.Vocabularies)
                                {
                                    _context.Vocabularies.Add(new Vocabulary
                                    {
                                        CategoryID = newCopyId,
                                        Hanzi = v.Hanzi.Trim(),
                                        Pinyin = v.Pinyin,
                                        Meaning = v.Meaning,
                                        Type = v.Type,
                                        Example = v.Example,
                                        ExampleMeaning = v.ExampleMeaning
                                    });
                                }
                        }

                        await _context.SaveChangesAsync();
                        await transaction.CommitAsync();

                        return Ok(new 
                        { 
                            msg = myCopy != null ? "Cập nhật thành công!" : "Mua bộ từ thành công!", 
                            newPoints = user.Points,
                            newVersion = original.Version 
                        });
            }
            catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    return StatusCode(500, new { msg = "Lỗi xử lý: " + ex.Message });
                }
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
                    price = wordCount * 0.6; 
                }
                else if (wordCount <= 100) {
                    price = wordCount * 0.5; 
                }
                else {
                    price = wordCount * 0.4; 
                }

                return (int)Math.Round(price);
            }
        }

    public class RedeemReq { public string DeckId { get; set; } = ""; public int UserId { get; set; } }
}