using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace Server.Services 
{
    public class GroqService
    {
        private readonly string _apiKey = Environment.GetEnvironmentVariable("GROQ_API_KEY"); 
        private readonly HttpClient _httpClient;

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
                model = "llama-3.3-70b-versatile",
                messages = new[] {
                    new { 
                        role = "system", 
                        content = @"Mày là trợ lý học tiếng Trung Lili. 
                        QUY TẮC BẮT BUỘC:
                        1. Trường 'text': CHỈ CHỨA CHỮ HÁN (Ví dụ: 你好). KHÔNG ĐƯỢC để phiên âm ở đây.
                        2. Trường 'pinyin': CHỈ CHỨA PHIÊN ÂM (Ví dụ: Nǐ hǎo).
                        3. Trường 'translation': CHỈ CHỨA TIẾNG VIỆT (Ví dụ: Chào mày).
                        Trả về định dạng JSON thuần túy."
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
    }

    public class LiliResponse {
        public string Text { get; set; } = "";
        public string Pinyin { get; set; } = "";
        public string Translation { get; set; } = "";
    }
}