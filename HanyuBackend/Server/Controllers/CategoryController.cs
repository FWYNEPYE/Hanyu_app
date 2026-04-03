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

        // 1. Lấy danh sách tất cả bộ từ để hiện lên giao diện
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Category>>> GetCategories()
        {
            return await _context.Categories.ToListAsync();
        }

        // 2. Tạo bộ từ mới (Đây là cái đang bị lỗi 404 này)
        [HttpPost]
        public async Task<ActionResult<Category>> PostCategory(Category category)
        {
            // 1. Nếu Frontend không gửi ID, tự tạo ID từ Name (Ví dụ: "Tiếng Trung" -> "tieng-trung")
            if (string.IsNullOrEmpty(category.CategoryID))
            {
                // Tạo slug đơn giản hoặc dùng Guid cho chắc chắn 100% không trùng
                category.CategoryID = Guid.NewGuid().ToString().Substring(0, 8); 
            }

            // 2. Kiểm tra lại lần nữa cho chắc
            var exists = await _context.Categories.AnyAsync(c => c.CategoryID == category.CategoryID);
            if (exists)
            {
                return BadRequest(new { message = "ID bộ từ đã tồn tại, hãy thử tên khác!" });
            }

            _context.Categories.Add(category);
            await _context.SaveChangesAsync();

            return Ok(category);
        }

        // 3. Xóa bộ từ (Nếu cần)
        [HttpDelete("{id}")]
public async Task<IActionResult> DeleteCategory(string id)
{
    var category = await _context.Categories.FindAsync(id);
    if (category == null) return NotFound(new { message = "Không tìm thấy bộ từ này!" });

    // 1. Tìm tất cả từ vựng thuộc bộ này
    var relatedVocab = _context.Vocabularies.Where(v => v.CategoryID == id);
    
    // 2. Xóa đống từ vựng đó trước
    _context.Vocabularies.RemoveRange(relatedVocab);

    // 3. Bây giờ mới xóa bộ từ (Lúc này không còn ràng buộc nào nữa)
    _context.Categories.Remove(category);
    
    await _context.SaveChangesAsync();

    return Ok(new { message = "Đã xóa bộ từ và các từ vựng liên quan!" });
}
    }
}