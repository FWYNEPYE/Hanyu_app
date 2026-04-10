using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace Server.Services 
{
    public class GroqService
    {
        private readonly string _apiKey = "....."; 
        private readonly HttpClient _httpClient;
        private readonly string _url = "https://api.groq.com/openai/v1/chat/completions";

        public GroqService(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        public async Task<LiliResponse> GetLiliChat(string userPrompt)
        {
            var url = "https://api.groq.com/openai/v1/chat/completions";

            // Groq dùng Bearer Token để xác thực
            _httpClient.DefaultRequestHeaders.Authorization = 
                new AuthenticationHeaderValue("Bearer", _apiKey);

            var payload = new
            {
                model = "llama-3.1-8b-instant",
                messages = new[] {
                    // Trong GroqService hoặc GeminiService
                new { 
                    role = "system", 
                    content = @"Mày là trợ lý học tiếng Trung Lili. Xưng 'anh', gọi 'em'.
                            QUY TẮC PHẢN HỒI:
                            1. Bất kể mày/ (người dùng) nói bằng tiếng gì, mày PHẢI luôn trả lời bằng tiếng Trung (Chữ Hán).
                            2. TRƯỜNG 'text': Bắt buộc là CHỮ HÁN. Không được để tiếng Việt hay Pinyin vào đây.
                            3. TRƯỜNG 'pinyin': Là phiên âm của câu Chữ Hán đó.
                            4. TRƯỜNG 'translation': Là nghĩa tiếng Việt của câu Chữ Hán đó.

                            Ví dụ: Nếu người dùng nói 'Chào mày', mày phải trả về:
                            {
                            ""text"": ""你好"",
                            ""pinyin"": ""Nǐ hǎo"",
                            ""translation"": ""Chào em""
                            }
                    Cấm trả về văn bản thuần, chỉ trả về JSON."
                },
                    new { role = "user", content = userPrompt }
                },
                response_format = new { type = "json_object" }
            };

            var response = await _httpClient.PostAsJsonAsync(url, payload);
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
            _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _apiKey);
            var payload = new {
                model = "llama-3.1-8b-instant",
                messages = new[] {
                    new { role = "system", content = "You are a professional Chinese-Vietnamese dictionary assistant. Respond only in JSON." },
                    new { role = "user", content = prompt }
                },
                response_format = new { type = "json_object" }
            };

            var response = await _httpClient.PostAsJsonAsync(_url, payload);
            return (await response.Content.ReadAsStringAsync()); // Trả về JSON thô
        }
    }

    public class LiliResponse {
        public string Text { get; set; } = "";
        public string Pinyin { get; set; } = "";
        public string Translation { get; set; } = "";
    }

}
  
