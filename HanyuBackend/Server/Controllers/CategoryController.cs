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

        //  Lấy danh sách tất cả bộ từ để hiện lên giao diện
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Category>>> GetCategories()
        {
            return await _context.Categories.ToListAsync();
        }

        // 2. Tạo bộ từ mới 
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
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCategory(string id)
        {
            var category = await _context.Categories.FindAsync(id);
            if (category == null) return NotFound(new { message = "Không tìm thấy bộ từ này!" });

            //  Tìm tất cả từ vựng thuộc bộ này
            var relatedVocab = _context.Vocabularies.Where(v => v.CategoryID == id);
            
            //  Xóa đống từ vựng đó trước
            _context.Vocabularies.RemoveRange(relatedVocab);

            // xóa bộ
            _context.Categories.Remove(category);
            
            await _context.SaveChangesAsync();

            return Ok(new { message = "Đã xóa bộ từ và các từ vựng liên quan!" });
        }
        //Lấy danh sách bộ từ theo UserID 
[HttpGet("user/{userId}")]
public async Task<ActionResult<IEnumerable<Category>>> GetUserCategories(int userId)
{
    // Lấy những bộ từ của chính user đó HOẶC bộ từ mặc định của hệ thống (system)
    var categories = await _context.Categories
        .Where(c => c.UserID == userId || c.CategoryType == "system")
        .ToListAsync();

    if (categories == null || !categories.Any())
    {
        return Ok(new List<Category>()); // Trả về mảng rỗng
    }

    return Ok(categories);
}
    }
}