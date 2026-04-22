using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Server.Data;
using Server.Models;

namespace Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CategoryController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CategoryController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Category>>> GetCategories()
        {
            return await _context.Categories.ToListAsync();
        }

        [HttpPost]
        public async Task<ActionResult<Category>> PostCategory(Category category)
        {
            //  Nếu Frontend không gửi ID, tự tạo ID từ Name
            if (string.IsNullOrEmpty(category.CategoryID))
            {
                // Tạo slug đơn giản hoặc dùng Guid cho chắc chắn 100% không trùng
                category.CategoryID = Guid.NewGuid().ToString().Substring(0, 8); 
            }

            // Kiểm tra lại
            var exists = await _context.Categories.AnyAsync(c => c.CategoryID == category.CategoryID);
            if (exists)
            {
                return BadRequest(new { message = "ID bộ từ đã tồn tại, hãy thử tên khác!" });
            }

            _context.Categories.Add(category);
            await _context.SaveChangesAsync();

            return Ok(category);
        }



        // Xóa bộ từ
        [HttpDelete("{id}/{userId}")]
        public async Task<IActionResult> DeleteCategory(string id, int userId)
        {
            var category = await _context.Categories.FindAsync(id);
            if (category == null) return NotFound(new { message = "Không tìm thấy bộ từ này!" });

            // người tạo
            if (category.UserID == userId)
            {
                // Xóa tất cả từ vựng liên quan
                var relatedVocab = _context.Vocabularies.Where(v => v.CategoryID == id);
                _context.Vocabularies.RemoveRange(relatedVocab);


                var sharedLinks = _context.UserCategories.Where(uc => uc.CategoryID == id);
                _context.UserCategories.RemoveRange(sharedLinks);

                // Xóa bộ gốc
                _context.Categories.Remove(category);
                
                await _context.SaveChangesAsync();
                return Ok(new { message = "Bạn là chủ: Đã xóa toàn bộ dữ liệu gốc!" });
            }
            
            // lưu từ cđ
            else
            {
                var userLink = await _context.UserCategories
                    .FirstOrDefaultAsync(uc => uc.CategoryID == id && uc.UserID == userId);

                if (userLink != null)
                {
                    _context.UserCategories.Remove(userLink);
                    await _context.SaveChangesAsync();
                    return Ok(new { message = "Đã gỡ bộ từ khỏi kho cá nhân của bạn. Bản gốc vẫn an toàn!" });
                }

                return BadRequest(new { message = "Bạn không có quyền xóa bộ từ này!" });
            }
        }
                
 [HttpGet("user/{userId}")]
public async Task<IActionResult> GetUserCategories(int userId)
{
    // 1. Lấy các bộ từ do chính User này tạo ra
    var myCategories = await _context.Categories
        .Where(c => c.UserID == userId)
        .Select(c => new {
            c.CategoryID,
            c.CategoryName,
            c.CategoryType,
            c.UserID,
            c.ParentCategoryID,
            c.Version,
            c.Description,
            c.IconName,
            c.ColorClass,
            c.Tags,
            c.IsPublic,
            IsBorrowed = false, // Đánh dấu: Đồ chính chủ
            Words = _context.Vocabularies.Count(v => v.CategoryID == c.CategoryID)
        })
        .ToListAsync();

    // 2. Lấy các bộ từ đi mượn từ cộng đồng (qua bảng UserCategories)
    // Loại trừ những bộ mà UserID của bộ đó trùng với userId hiện tại để tránh bị lặp
    var borrowedCategories = await _context.UserCategories
        .Where(uc => uc.UserID == userId && uc.Category.UserID != userId)
        .Select(uc => new {
            uc.Category.CategoryID,
            uc.Category.CategoryName,
            uc.Category.CategoryType,
            uc.Category.UserID,
            uc.Category.ParentCategoryID,
            uc.Category.Version,
            uc.Category.Description,
            uc.Category.IconName,
            uc.Category.ColorClass,
            uc.Category.Tags,
            uc.Category.IsPublic,
            IsBorrowed = true, // Đánh dấu: Đồ cộng đồng
            Words = _context.Vocabularies.Count(v => v.CategoryID == uc.Category.CategoryID)
        })
        .ToListAsync();

    // 3. Gộp lại và trả về
    var result = myCategories.Concat(borrowedCategories).ToList();
    return Ok(result);
}


        [HttpPut("{id}/public-settings")]
        public async Task<IActionResult> UpdatePublicSettings(string id, [FromQuery] int userId, [FromBody] PublicSettingsRequest request)
        {
            var category = await _context.Categories.FindAsync(id);
            if (category == null) return NotFound(new { message = "Không tìm thấy bộ từ!" });

            if (category.UserID != userId)
                return StatusCode(403, new { message = "Không phải bộ từ gốc!" });

            if (!string.IsNullOrEmpty(category.ParentCategoryID) && request.IsPublic)
            {
                return BadRequest(new { message = "Không có quyền đăng lại!" });
            }

            category.IsPublic = request.IsPublic;
            category.Price = request.Price;
            category.Description = request.Description;
            category.IconName = request.Icon;
            category.ColorClass = request.ThemeColor;
            category.Tags = request.Tags;

            if (string.IsNullOrEmpty(category.ParentCategoryID)) 
            {
                category.Version++; 
            }

            try
            {
                await _context.SaveChangesAsync();
                return Ok(new { 
                    message = "Cập nhật thành công!", 
                    isPublic = category.IsPublic,
                    version = category.Version 
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Lỗi hệ thống: " + ex.Message });
            }
        }

        [HttpGet("my-collection/{userId}")]
        public async Task<IActionResult> GetMyCollection(int userId)
        {
            
            var owned = await _context.Categories
                .Where(c => c.UserID == userId)
                .Include(c => c.Vocabularies) 
                .ToListAsync();


            var borrowed = await _context.UserCategories
                .Where(uc => uc.UserID == userId)
                .Include(uc => uc.Category)
                    .ThenInclude(c => c.Vocabularies) 
                .Select(uc => new {
                    
                    Category = uc.Category, 
                    HasUpdate = uc.Category.Version > uc.SavedVersion 
                })
                .ToListAsync();

            return Ok(new { 
                ownedByMe = owned, 
                borrowed = borrowed 
            });
        }

        [HttpPost("save-from-store")]
        public async Task<IActionResult> SaveFromStore([FromBody] SaveCategoryRequest req)
                {
                    // Kiểm tra xem đã sở hữu chưa (Chặn không cho lưu trùng)
                    var isOwned = await _context.UserCategories
                        .AnyAsync(uc => uc.UserID == req.UserID && uc.CategoryID == req.CategoryID);

                    if (isOwned) return BadRequest(new { message = "Đã sở hữu bộ này rồi, chỉ có thể cập nhật thôi!" });

                    var originalCate = await _context.Categories.FindAsync(req.CategoryID);
                    if (originalCate == null) return NotFound(new { message = "Bộ từ không tồn tại" });

                    // Lưu vé thông hành vào bảng UserCategory
                    var userLink = new UserCategory
                    {
                        UserID = req.UserID,
                        CategoryID = req.CategoryID,
                        SavedVersion = originalCate.Version, // Lưu version gốc 
                        PurchasedAt = DateTime.Now
                    };

                    _context.UserCategories.Add(userLink);
                    await _context.SaveChangesAsync();

                    return Ok(new { message = "Đã lưu bộ từ thành công!" });
                }

        
        
        [HttpPost("sync-update")]
        public async Task<IActionResult> SyncUpdate([FromBody] SaveCategoryRequest req)
                {
                    var userLink = await _context.UserCategories
                        .Include(uc => uc.Category)
                        .FirstOrDefaultAsync(uc => uc.UserID == req.UserID && uc.CategoryID == req.CategoryID);

                    if (userLink == null) return NotFound(new { message = "Chưa sở hữu bộ này!" });

                    // Check version
                    if (userLink.Category.Version > userLink.SavedVersion)
                    {
                        var user = await _context.Users.FindAsync(req.UserID);
                        // Công thức tính point: Ví dụ chênh lệch 1 version = 10 point
                        int pointPrice = (userLink.Category.Version - userLink.SavedVersion) * 10;

                        if (user.Points < pointPrice) 
                            return BadRequest(new { message = $"Thiếu {pointPrice} point để cập nhật!" });

                        // Trừ point và đồng bộ version
                        user.Points -= pointPrice;
                        userLink.SavedVersion = userLink.Category.Version;

                        await _context.SaveChangesAsync();
                        return Ok(new { message = "Cập nhật thành công!", newVersion = userLink.SavedVersion });
                    }

                    return BadRequest(new { message = "Đã là bản mới nhất rồi!" });
                }



        [HttpPost("sync/{categoryId}")]
        public async Task<IActionResult> SyncCollection(string categoryId, [FromQuery] int userId)
        {
        var user = await _context.Users.FindAsync(userId);
            
            var original = await _context.Categories.Include(c => c.Vocabularies)
                .FirstOrDefaultAsync(c => c.CategoryID == categoryId);
            
            var myClone = await _context.Categories.Include(c => c.Vocabularies)
                .FirstOrDefaultAsync(c => c.ParentCategoryID == categoryId && c.UserID == userId);

            if (original == null || myClone == null) return NotFound("Dữ liệu không tồn tại");

            int totalOriginalWords = original.Vocabularies.Count; 
            int totalMyWords = myClone.Vocabularies.Count;       
            int newWordsCount = totalOriginalWords - totalMyWords;

            int updateCost = 0;
            if (newWordsCount > 0) 
            {
                updateCost = (int)Math.Ceiling(newWordsCount * 0.6); 
            }

            if (user.Points < updateCost)
                return BadRequest(new { message = $"Cần {updateCost} Point để cập nhật thêm {newWordsCount} từ mới!" });

            user.Points -= updateCost;
            
            _context.Vocabularies.RemoveRange(myClone.Vocabularies);

                foreach (var v in original.Vocabularies)
                {
                    var newVocab = new Vocabulary
                    {
                        Hanzi = v.Hanzi,
                        Pinyin = v.Pinyin,
                        Meaning = v.Meaning,
                        Example = v.Example,
                        ExampleMeaning = v.ExampleMeaning,
                        Type = v.Type,
                        Note = v.Note,
                        CategoryID = myClone.CategoryID 
                    };
                    _context.Vocabularies.Add(newVocab);
                }

            myClone.Version = original.Version;
            await _context.SaveChangesAsync();

            return Ok(new { 
                message = updateCost > 0 ? $"Đã thêm {newWordsCount} từ mới. Trừ {updateCost} Point!" : "Đã đồng bộ nội dung mới nhất!",
                newPoints = user.Points 
            });
        }




        public class PublicSettingsRequest
        {
            public bool IsPublic { get; set; }
            public int Price { get; set; }
            public string? Description { get; set; }
            public string? Icon { get; set; }
            public string? ThemeColor { get; set; }
            public string? Tags { get; set; }
        }

        public class SaveCategoryRequest
        {
            public int UserID { get; set; }
            public string CategoryID { get; set; }
        }

    
    }
}