using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Server.Data;
using Server.Models;
using Server.Services;
using System.Text.Json;

namespace Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DictionaryController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly GroqService _aiService;

        public DictionaryController(AppDbContext context, GroqService aiService)
        {
            _context = context;
            _aiService = aiService;
        }

        [HttpGet("search")]
        public async Task<IActionResult> Search(string keyword, int userId)
        {
            if (string.IsNullOrEmpty(keyword)) return BadRequest("Nhập từ khóa!");

            try
            {
                // Check DB - Nếu Pinyin rỗng thì xóa để tạo lại
                var existingVocab = await _context.Vocabularies.FirstOrDefaultAsync(v => v.Hanzi == keyword);
                if (existingVocab != null)
                {
                    if (!string.IsNullOrWhiteSpace(existingVocab.Pinyin)) return Ok(existingVocab);
                    _context.Vocabularies.Remove(existingVocab);
                    await _context.SaveChangesAsync();
                }

                // 2. Tìm/Tạo Category
            //     var category = await _context.Categories.FirstOrDefaultAsync(c => c.UserID == userId && c.CategoryName == "Sổ tay cá nhân");
            //     if (category == null) 
            //     { category = new Category
            //             {
            //                 CategoryID = "CAT_" + Guid.NewGuid().ToString().Substring(0, 8),
            //                 CategoryName = "Sổ tay cá nhân",
            //                 CategoryType = "user",
            //                 UserID = userId
            //             };

            // _context.Categories.Add(category);

            // await _context.SaveChangesAsync();}

                // 3. Prompt AI
              string prompt = $@"
                    Mày là một học giả Hán Nôm có kiến thức uyên thâm. 
                    Hãy phân tích từ: '{keyword}' một cách chính xác tuyệt đối.

                    YÊU CẦU NGHIÊM NGẶT:
                    1. Xác định đúng từng chữ Hán trong từ '{keyword}'.
                    2. Đối với mỗi chữ, hãy tra cứu trong bộ nhớ về 214 bộ thủ Khang Hy (Kangxi Radicals). 
                    3. TUYỆT ĐỐI KHÔNG tự sáng tác ra các bộ thủ không có thật.
                    4. Nếu một chữ có cấu trúc phức tạp, hãy tách thành: Bộ thủ chính + Thành phần còn lại.

                    VÍ DỤ MẪU CHUẨN (HÃY LÀM THEO ĐÚNG LOGIC NÀY):
                    - Nếu từ là '你好':
                    radical: ""你: Bộ Nhân (亻) + chữ Nhĩ (尔)\n好: Bộ Nữ (女) + chữ Tử (子)""
                    
                    - Nếu từ là '休息':
                    radical: ""休: Bộ Nhân (亻) + bộ Mộc (木)\n息: Bộ Tự (自) + bộ Tâm (心)""
                   
                    DỰA VÀO ĐÓ, HÃY PHÂN TÍCH TỪ '{keyword}':
                    Trả về JSON duy nhất:
                    {{

                    ""hanzi"": ""{keyword}"",
                    ""pinyin"": ""pinyin with tones"",
                    ""meaning"": ""phân tích chi tiết nghĩa tiếng việt"",
                    ""type"": ""danh từ/động từ/tính từ..."",
                    ""radical"": ""(Phân tích từng chữ theo dòng giống ví dụ trên)"",
                    ""grammar"": ""nếu là câu thì phân tích cấu trúc ngữ pháp, hoặc cách dùng đặc biệt, vị trí trong câu nếu là từ.Dựa vào các bộ thủ đã tách, hãy kể một câu chuyện ngắn gọn hoặc đưa ra logic hội ý thú vị để người học dễ nhớ chữ này nhất. Ví dụ: chữ 'An' (安) là mái nhà trên bộ Nữ, nghĩa là dưới mái nhà có người phụ nữ thì mới bình an."",
                    ""examples"": [
                        {{ ""zh"": ""câu ví dụ 1"", ""vi"": ""nghĩa ví dụ 1"" }},
                        {{ ""zh"": ""câu ví dụ 2"", ""vi"": ""nghĩa ví dụ 2"" }}
                    ]
                    }}
                    Dịch toàn bộ giải thích sang tiếng Việt chuẩn từ điển Hán - Việt.";


                var aiRawResponse = await _aiService.GetFullAIResponse(prompt);

              // 5. BÓC TÁCH CHUẨN: Vì Groq trả về nguyên một Object lớn
                string cleanJson = "";
                try 
                {
                    using (JsonDocument doc = JsonDocument.Parse(aiRawResponse))
                    {
                        // Đào sâu vào cấu trúc của Groq: choices -> [0] -> message -> content
                        if (doc.RootElement.TryGetProperty("choices", out var choices) && choices.GetArrayLength() > 0)
                        {
                            cleanJson = choices[0].GetProperty("message").GetProperty("content").GetString() ?? "";
                        }
                        else 
                        {cleanJson = aiRawResponse;  }
                    }
                }
                catch {
                    cleanJson = aiRawResponse; // Nếu lỗi thì dùng chuỗi gốc
                }

                var match = System.Text.RegularExpressions.Regex.Match(cleanJson, @"\{.*\}", System.Text.RegularExpressions.RegexOptions.Singleline);
                if (!match.Success) return StatusCode(500, "Không tìm thấy nội dung JSON trong: " + cleanJson);

                var finalJson = match.Value;
                var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                var aiDto = JsonSerializer.Deserialize<VocabDto>(finalJson, options);

                // Check var lại lần cuối
                if (aiDto == null || string.IsNullOrEmpty(aiDto.pinyin))
                {
                    return StatusCode(500, "Dữ liệu vẫn rỗng! Nội dung lấy được: " + finalJson);
                }

                var aiVocab = new Vocabulary
                {
                    Hanzi = !string.IsNullOrEmpty(aiDto.hanzi) ? aiDto.hanzi : keyword,
                    Pinyin = aiDto.pinyin ?? "không có pinyin", 
                    Meaning = aiDto.meaning ?? "không có nghĩa",
                    Type = aiDto.type ?? "",
                    Radical = aiDto.radical ?? "",
                    Grammar = aiDto.grammar ?? "",
                    Example = aiDto.examples != null && aiDto.examples.Count > 0 ? aiDto.examples[0].zh : "",
                    ExampleMeaning = aiDto.examples != null && aiDto.examples.Count > 0 ? aiDto.examples[0].vi : "",
                    //CategoryID = category.CategoryID,
                    
                    CreatedDate = DateTime.Now,
                    Level = 0
                };

               // _context.Vocabularies.Add(aiVocab);
               // await _context.SaveChangesAsync();

                return Ok(aiVocab);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Lỗi hệ thống: {ex.Message}");
            }
        }

[HttpPost("add-to-collection")]
public async Task<IActionResult> AddToCollection([FromBody] Vocabulary vocab, [FromQuery] int userId, [FromQuery] string categoryId)
{
    try 
    {
        // 1. Kiểm tra xem từ này đã có trong bộ này chưa
        var exists = await _context.Vocabularies.AnyAsync(v => v.Hanzi == vocab.Hanzi && v.CategoryID == categoryId);
        if (exists) return BadRequest("Từ này đã có trong bộ từ này rồi!");

        // 2. Gán ID bộ từ do người dùng chọn
        vocab.CategoryID = categoryId;
        vocab.CreatedDate = DateTime.Now;
        vocab.Level = 0;

        // Xóa ID cũ nếu có để EF tự sinh ID mới cho bản ghi Vocabulary
        // vocab.VocabularyID = 0; 

        _context.Vocabularies.Add(vocab);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Đã thêm thành công!" });
    }
    catch (Exception ex) { return StatusCode(500, ex.Message); }
}
        [HttpGet("suggestions")]
        public async Task<IActionResult> GetSuggestions([FromQuery] string keyword)
        {
            if (string.IsNullOrEmpty(keyword)) return Ok(new List<object>());

            var suggestions = await _context.Vocabularies
                .Where(d => d.Hanzi.Contains(keyword) || d.Pinyin.Contains(keyword))
                .Select(d => new { 
                    Hanzi = d.Hanzi, 
                    Pinyin = d.Pinyin, 
                    Meaning = d.Meaning 
                })
                .Distinct()
                .Take(6) 
                .ToListAsync();

            return Ok(suggestions);
        }
    }
}