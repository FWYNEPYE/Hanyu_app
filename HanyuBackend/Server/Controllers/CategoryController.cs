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
            if (string.IsNullOrEmpty(category.CategoryID))
            {
                category.CategoryID = Guid.NewGuid().ToString().Substring(0, 8); 
            }

            var exists = await _context.Categories.AnyAsync(c => c.CategoryID == category.CategoryID);
            if (exists)
            {
                return BadRequest(new { message = "ID bộ từ đã tồn tại, hãy thử tên khác!" });
            }

            _context.Categories.Add(category);
            await _context.SaveChangesAsync();

            return Ok(category);
        }

        // --- API ĐỔI TÊN BỘ TỪ (MỚI THÊM ĐỂ ĐỒNG BỘ FRONTEND) ---
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCategoryName(string id, [FromBody] UpdateCategoryNameRequest request)
        {
            var category = await _context.Categories.FindAsync(id);
            if (category == null) 
                return NotFound(new { message = "Không tìm thấy bộ từ cần sửa tên!" });

            if (category.UserID != request.UserID)
                return StatusCode(403, new { message = "Bạn không có quyền chỉnh sửa bộ từ của người khác!" });

            if (category.CategoryType == "system" || category.CategoryType == "HSK")
                return BadRequest(new { message = "Không được phép chỉnh sửa bộ từ mặc định của hệ thống!" });

            if (string.IsNullOrEmpty(request.CategoryName?.Trim()))
                return BadRequest(new { message = "Tên bộ từ không được để trống!" });

            // Tiến hành cập nhật tên mới
            category.CategoryName = request.CategoryName.Trim();

            // Tăng phiên bản nếu là bộ từ gốc độc lập (để người mượn có thể cập nhật sau này)
            if (string.IsNullOrEmpty(category.ParentCategoryID))
            {
                category.Version++;
            }

            await _context.SaveChangesAsync();

            return Ok(new { 
                message = "Đổi tên bộ từ thành công!", 
                categoryID = category.CategoryID, 
                categoryName = category.CategoryName 
            });
        }

        [HttpDelete("{id}/{userId}")]
        public async Task<IActionResult> DeleteCategory(string id, int userId)
        {
            var category = await _context.Categories.FindAsync(id);
            if (category == null) return NotFound(new { message = "Không tìm thấy bộ từ này!" });

            if (category.UserID == userId)
            {
                var relatedVocab = _context.Vocabularies.Where(v => v.CategoryID == id);
                _context.Vocabularies.RemoveRange(relatedVocab);

                var sharedLinks = _context.UserCategories.Where(uc => uc.CategoryID == id);
                _context.UserCategories.RemoveRange(sharedLinks);

                _context.Categories.Remove(category);
                
                await _context.SaveChangesAsync();
                return Ok(new { message = "Bạn là chủ: Đã xóa toàn bộ dữ liệu gốc!" });
            }
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
            // 1. Bộ từ cá nhân tự tạo (Type = user)
            var myCategories = await _context.Categories
                .Where(c => c.UserID == userId && c.CategoryType == "user")
                .Select(c => new {
                    categoryID = c.CategoryID,
                    categoryName = c.CategoryName,
                    categoryType = c.CategoryType,
                    userID = c.UserID,
                    parentCategoryID = c.ParentCategoryID,
                    version = c.Version,
                    description = c.Description,
                    iconName = c.IconName,
                    colorClass = c.ColorClass,
                    tags = c.Tags,
                    isPublic = c.IsPublic,
                    isBorrowed = false, 
                    words = _context.Vocabularies.Count(v => v.CategoryID == c.CategoryID)
                })
                .ToListAsync();

            // 2. Lấy bộ từ lộ trình hệ thống đang học
            var systemCategories = await _context.Categories
                .Where(c => c.CategoryType == "system" || c.CategoryType == "HSK")
                .Where(c => _context.UserProgresses.Any(up => 
                    up.UserID == userId && 
                    up.IsCompleted == true && 
                    up.RoadmapStep.CategoryID == c.CategoryID))
                .Select(c => new {
                    categoryID = c.CategoryID,
                    categoryName = c.CategoryName,
                    categoryType = "system", 
                    userID = c.UserID,
                    parentCategoryID = c.ParentCategoryID,
                    version = c.Version,
                    description = c.Description,
                    iconName = c.IconName,
                    colorClass = c.ColorClass,
                    tags = c.Tags,
                    isPublic = c.IsPublic,
                    isBorrowed = false,
                    words = _context.Vocabularies.Count(v => v.CategoryID == c.CategoryID)
                })
                .ToListAsync();

            // 3. Lấy bộ từ mượn/mua từ cộng đồng từ bảng trung gian
            var borrowedCategories = await _context.UserCategories
                .Where(uc => uc.UserID == userId && uc.Category.CategoryType != "system" && uc.Category.CategoryType != "HSK")
                .Select(uc => new {
                    categoryID = uc.Category.CategoryID,
                    categoryName = uc.Category.CategoryName,
                    categoryType = uc.Category.CategoryType,
                    userID = uc.Category.UserID,
                    parentCategoryID = uc.Category.ParentCategoryID,
                    version = uc.Category.Version,
                    description = uc.Category.Description,
                    iconName = uc.Category.IconName,
                    colorClass = uc.Category.ColorClass,
                    tags = uc.Category.Tags,
                    isPublic = uc.Category.IsPublic,
                    isBorrowed = true, 
                    words = _context.Vocabularies.Count(v => v.CategoryID == uc.Category.CategoryID)
                })
                .ToListAsync();

            var result = myCategories.Concat(systemCategories).Concat(borrowedCategories).ToList();
            return Ok(result);
        }

        // --- CHỐNG HACK ĐIỂM ---
        [HttpPut("{id}/public-settings")]
        public async Task<IActionResult> UpdatePublicSettings(string id, [FromQuery] int userId, [FromBody] PublicSettingsRequest request)
        {
            var category = await _context.Categories.FindAsync(id);
            if (category == null) return NotFound(new { message = "Không tìm thấy bộ từ!" });

            if (category.UserID != userId)
                return StatusCode(403, new { message = "Không phải bộ từ gốc!" });

            int earnedPoints = 0;
            
            if (request.IsPublic)
            {
                var currentWordCount = await _context.Vocabularies.CountAsync(v => v.CategoryID == id);
                var user = await _context.Users.FindAsync(userId);

                if (user != null)
                {
                    if (!category.IsBonusAwarded) 
                    {
                        earnedPoints = currentWordCount * 2;
                        category.IsBonusAwarded = true;
                    }
                    else 
                    {
                        int diff = currentWordCount - category.LastWordCount;
                        if (diff > 0)
                        {
                            earnedPoints = diff * 1; 
                        }
                        else if (currentWordCount > 0)
                        {
                            earnedPoints = 1; 
                        }
                    }

                    user.Points += earnedPoints;
                    category.LastWordCount = currentWordCount; 
                }
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

            await _context.SaveChangesAsync();

            return Ok(new { 
                message = earnedPoints > 0 ? $"Thành công! +{earnedPoints} điểm thưởng." : "Cập nhật thành công!", 
                pointsEarned = earnedPoints,
                currentPoints = (await _context.Users.FindAsync(userId))?.Points 
            });
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

            return Ok(new { ownedByMe = owned, borrowed = borrowed });
        }

        [HttpPost("save-from-store")]
        public async Task<IActionResult> SaveFromStore([FromBody] SaveCategoryRequest req)
        {
            var isOwned = await _context.UserCategories
                .AnyAsync(uc => uc.UserID == req.UserID && uc.CategoryID == req.CategoryID);

            if (isOwned) return BadRequest(new { message = "Đã sở hữu bộ này rồi!" });

            var originalCate = await _context.Categories.FindAsync(req.CategoryID);
            if (originalCate == null) return NotFound(new { message = "Bộ từ không tồn tại" });

            var userLink = new UserCategory
            {
                UserID = req.UserID,
                CategoryID = req.CategoryID,
                SavedVersion = originalCate.Version, 
                PurchasedAt = DateTime.UtcNow
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

            if (userLink.Category.Version > userLink.SavedVersion)
            {
                var user = await _context.Users.FindAsync(req.UserID);
                int pointPrice = (userLink.Category.Version - userLink.SavedVersion) * 10;

                if (user.Points < pointPrice) 
                    return BadRequest(new { message = $"Thiếu {pointPrice} point để cập nhật!" });

                user.Points -= pointPrice;
                userLink.SavedVersion = userLink.Category.Version;

                await _context.SaveChangesAsync();
                return Ok(new { message = "Cập nhật thành công!", newVersion = userLink.SavedVersion });
            }

            return BadRequest(new { message = "Đã là bản mới nhất rồi!" });
        }

        // --- CÁC CLASS REQUEST DTO ---
        public class UpdateCategoryNameRequest
        {
            public int UserID { get; set; }
            public string CategoryName { get; set; }
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