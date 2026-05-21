using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Net.Http.Json;

namespace Server.Services 
{
    public class GroqService
    {
        private readonly HttpClient _httpClient;
        private readonly ISystemConfigService _configService;
        private readonly string _url = "https://api.groq.com/openai/v1/chat/completions";

        public GroqService(HttpClient httpClient, ISystemConfigService configService)
        {
            _httpClient = httpClient;
            _configService = configService;
        }

public async Task<LiliResponse> GetLiliChat(string userPrompt)
{
    // Lấy API Key từ Database
    var apiKey = await _configService.GetConfigAsync("ApiKey");

    var modelFromDb = await _configService.GetConfigAsync("ModelVersion");
    string modelName = !string.IsNullOrEmpty(modelFromDb) ? modelFromDb : "llama-3.3-70b-versatile";

    _httpClient.DefaultRequestHeaders.Authorization = 
        new AuthenticationHeaderValue("Bearer", apiKey);

    var payload = new
    {
        model = modelName,
        temperature = 0.1, // Giữ nguyên để output JSON không bị lệch cấu trúc
        messages = new[] {
            new { 
                role = "system", 
                content = @"Bạn là Lili, một trợ lý học tiếng Trung thông minh. Bạn trò chuyện với người dùng như một người bạn (bằng tiếng Việt), đồng thời đóng vai trò giáo viên bản xứ kiểm tra xem câu tiếng Trung của user viết ĐÚNG hay SAI ngữ pháp.

🚨 LUẬT TỐI CAO ĐỂ TRÁNH BỊA LỖI (CRITICAL - TRÁNH FALSE POSITIVE):
- Hãy tỉnh táo! Những câu khẩu ngữ thông dụng, ngắn gọn, lược chủ ngữ của người dùng (Ví dụ: '你说什么呢' - Cậu nói cái gì thế, '你去哪儿' - Cậu đi đâu đấy, '怎么 rồi' - Sao thế, '不知道' - Không biết) là HOÀN TOÀN ĐÚNG và tự nhiên.
- TUYỆT ĐỐI CẤM vạch lá tìm sâu hoặc tự bịa ra lỗi khi câu của user đã có nghĩa rõ ràng và đúng ngữ pháp. 
- Nếu câu của user ĐÚNG, bạn BẮT BUỘC phải áp dụng TRƯỜNG HỢP 1. Chỉ khi câu thực sự sai nghiêm trọng (sai trật tự từ, dùng sai từ hoàn toàn) mới được dùng TRƯỜNG HỢP 2.

QUY TẮC PHẢN HỒI JSON KHẮT KHE (BẮT BUỘC):
1. Trường 'text': Luôn là câu trả lời/đáp lại bằng chữ Hán của bạn đối với tin nhắn của user để duy trì cuộc trò chuyện. TUYỆT ĐỐI KHÔNG đưa câu sửa lỗi hay phân tích vào đây!
2. Trường 'pinyin': Phiên âm Pinyin chính xác của trường 'text'.
3. Trường 'translation': Định dạng nội dung trường này phụ thuộc HOÀN TOÀN vào việc câu của user Đúng hay Sai:

--- 🟢 TRƯỜNG HỢP 1: CÂU CỦA USER ĐÃ ĐÚNG NGỮ PHÁP HOẶC LÀ KHẨU NGỮ TỰ NHIÊN ---
Nếu câu của user ĐÚNG, trường 'translation' CHỈ ĐƯỢC PHÉP CHỨA ĐÚNG MỘT DÒNG duy nhất dịch nghĩa câu phản hồi của bạn (trường 'text'). TUYỆT ĐỐI KHÔNG BẮT LỖI, KHÔNG HIỂN THỊ PHẦN PHÂN TÍCH NGỮ PHÁP!
Mẫu hiển thị đúng:
""[Dịch nghĩa câu ở trường 'text' của bạn sang tiếng Việt]""

--- 🔴 TRƯỜNG HỢP 2: CÂU CỦA USER BỊ SAI NGỮ PHÁP RÕ RÀNG (Ví dụ: '你好今天吗', '你/tên gì') ---
Nếu câu của user thực sự SAI, trường 'translation' bắt buộc phải xuống dòng bằng ký tự '\n' để phân tách rõ ràng các mục sau:
""[Dịch câu ở trường 'text' sang tiếng Việt]\n--------------------------------------------------\n⚠️ PHÂN TÍCH NGỮ PHÁP:\n- Câu đúng của bạn: [Sửa lại câu của user cho đúng] - [Pinyin câu sửa]\n- Loại lỗi sai: [Ghi rõ: Sai trật tự từ / Dùng sai từ / Thiếu từ]\n- Giải thích lỗi: [Giải thích ngắn gọn bằng tiếng Việt tại sao sai]\n- Gợi ý câu tương tự: [1 câu tương tự] - [Pinyin] (Dịch nghĩa)""

👉 HÃY NHÌN VÍ DỤ MẪU NÀY ĐỂ THẤY SỰ KHÁC BIỆT:
- User viết ĐÚNG KHẨU NGỮ: '你说什么呢' -> AI phải nhận định là ĐÚNG và trả về JSON mẫu:
{
  ""text"": ""i 我 đéo nói gì cả (我 kết hợp nói đùa công nghệ, hoặc viết chuẩn: 我没说什么呀。)"",
  ""pinyin"": ""Wǒ méi shuō shénme ya."",
  ""translation"": ""Mình có nói gì đâu á.""
}
- User viết SAI: '你什么吃' -> AI trả về JSON mẫu:
{
  ""text"": ""我 thích ăn cơm."",
  ""pinyin"": ""Wǒ xǐhuān chī fàn."",
  ""translation"": ""Dịch nghĩa: Mình thích ăn cơm.\n--------------------------------------------------\n⚠️ PHÂN TÍCH NGỮ PHÁP:\n- Câu đúng của bạn: 你吃什么 - Nǐ chī shénme?\n- Loại lỗi sai: Sai trật tự từ.\n- Giải thích lỗi: Từ để hỏi phải đứng sau động từ.\n- Gợi ý câu tương tự: 你想吃什么？ - Nǐ xiǎng chī shénme? (Bạn muốn ăn gì?)""
}"
            },
            new { role = "user", content = userPrompt }
        },
        response_format = new { type = "json_object" }
    };

    var response = await _httpClient.PostAsJsonAsync(_url, payload);
    var resString = await response.Content.ReadAsStringAsync();

    if (!response.IsSuccessStatusCode)
        throw new Exception($"Groq Error: {resString}");

    using var doc = JsonDocument.Parse(resString);
    var content = doc.RootElement
        .GetProperty("choices")[0]
        .GetProperty("message")
        .GetProperty("content").GetString();

    return JsonSerializer.Deserialize<LiliResponse>(content!, 
        new JsonSerializerOptions { PropertyNameCaseInsensitive = true })!;
}



        public async Task<string> GetFullAIResponse(string prompt)
        {
            var apiKey = await _configService.GetConfigAsync("ApiKey");
            var modelName = await _configService.GetConfigAsync("ModelVersion") ?? "llama-3.1-8b-instant";
            _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);
            
            var payload = new {
                model = modelName,
                temperature = 0.3,
                messages = new[] {
                    new { role = "system", content = "You are a professional Chinese-Vietnamese dictionary assistant. Respond only in JSON." },
                    new { role = "user", content = prompt }
                },
                response_format = new { type = "json_object" }
            };

            var response = await _httpClient.PostAsJsonAsync(_url, payload);
            return await response.Content.ReadAsStringAsync();
        }
    }

    public class LiliResponse {
        public string Text { get; set; } = "";
        public string Pinyin { get; set; } = "";
        public string Translation { get; set; } = "";
    }
}