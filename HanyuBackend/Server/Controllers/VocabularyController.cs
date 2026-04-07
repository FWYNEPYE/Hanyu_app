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

        // 1. Lấy toàn bộ từ vựng (Có kèm thông tin Category để hiển thị tên bộ từ)
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Vocabulary>>> GetVocabularies()
        {
            return await _context.Vocabularies
                .Include(v => v.Category) // Load thông tin từ bảng Cate sang luôn
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
        // 3. Thêm từ vựng mới (Có kiểm tra CategoryID hợp lệ)
        [HttpPost]
        public async Task<ActionResult<Vocabulary>> PostVocabulary(Vocabulary vocabulary)
        {
            // Kiểm tra xem CategoryID gửi lên có tồn tại trong bảng Cates chưa
            var categoryExists = await _context.Categories.AnyAsync(c => c.CategoryID == vocabulary.CategoryID);
            
            if (!categoryExists)
            {
                return BadRequest(new { message = "Lỗi: CategoryID này không tồn tại trong hệ thống!" });
            }

            // Gán ngày tạo nếu Model của mày có trường này
            vocabulary.CreatedDate = DateTime.Now;

            _context.Vocabularies.Add(vocabulary);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetVocabularies), new { id = vocabulary.VocaId }, vocabulary);
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