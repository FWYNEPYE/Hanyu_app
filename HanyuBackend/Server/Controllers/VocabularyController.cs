using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Server.Data;
using Server.Models;

namespace Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class VocabularyController : ControllerBase
    {
        private readonly AppDbContext _context;

        public VocabularyController(AppDbContext context)
        {
            _context = context;
        }

        // Lấy toàn bộ từ vựng 
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Vocabulary>>> GetVocabularies()
        {
            return await _context.Vocabularies
                .Include(v => v.Category) // Load thông tin từ bảng Cate
                .ToListAsync();
        }

        // 2. Lọc từ theo bộ (Dùng cho Game)
        [HttpGet("filter")]
        public async Task<ActionResult<IEnumerable<Vocabulary>>> GetFiltered([FromQuery] string categoryId)
        {
            // Chỉ lấy từ vựng thuộc về CategoryID mà User chọn 
            // Và Category đó phải có Type là user
            var query = _context.Vocabularies
                .Include(v => v.Category)
                .Where(v => v.CategoryID == categoryId && v.Category.CategoryType == "user");

            var result = await query.ToListAsync();
            
            if (!result.Any()) 
                return BadRequest(new { message = "Bộ từ này chưa có từ nào, hãy thêm từ để chơi game!" });

            return Ok(result);
        }
     

        [HttpPost]
        public async Task<ActionResult> PostVocabulary(Vocabulary voca) 
        {
            _context.Vocabularies.Add(voca);
            
            // Tìm bộ từ chủ quản và tăng Version
            var category = await _context.Categories.FindAsync(voca.CategoryID);
            if (category != null) {
                category.Version += 1; // Mỗi lần thay đổi từ là tăng 1 đơn vị
                category.UpdatedAt = DateTime.Now;
            }
            
            await _context.SaveChangesAsync();
            return Ok();
        }

        //xóa từ theo id
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteVocabulary(int id)
        {
            // Tìm từ vựng theo ID (kiểu int)
            var vocabulary = await _context.Vocabularies.FindAsync(id);
            
            if (vocabulary == null)
            {
                return NotFound(new { message = "Không tìm thấy từ vựng này!" });
            }

            _context.Vocabularies.Remove(vocabulary);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Đã xóa từ vựng thành công!" });
        }


        [HttpPut("{id}")]
        public async Task<IActionResult> PutVocabulary(int id, Vocabulary vocabulary)
        {
            if (id != vocabulary.VocaId)
            {
                return BadRequest(new { message = "ID không khớp!" });
            }
            _context.Entry(vocabulary).State = EntityState.Modified;
            _context.Entry(vocabulary).Property(x => x.CreatedDate).IsModified = false;
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!VocabularyExists(id))
                {
                    return NotFound(new { message = "Không tìm thấy từ vựng để cập nhật!" });
                }
                else
                {
                    throw;
                }
            }

            return Ok(new { message = "Cập nhật thành công!", data = vocabulary });
        }
            private bool VocabularyExists(int id)
            {
            return _context.Vocabularies.Any(e => e.VocaId == id);
         }
    }
}