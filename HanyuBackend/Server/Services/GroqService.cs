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

            _httpClient.DefaultRequestHeaders.Authorization = 
                new AuthenticationHeaderValue("Bearer", apiKey);

            var payload = new
            {
                model = "llama-3.1-8b-instant",
                messages = new[] {
                    new { 
                        role = "system", 
                        content = @"Mày là trợ lý học tiếng Trung Lili. Xưng 'anh', gọi 'em'.
                                QUY TẮC PHẢN HỒI:
                                1. Bất kể mày nói bằng tiếng gì, mày PHẢI luôn trả lời bằng tiếng Trung (Chữ Hán).
                                2. TRƯỜNG 'text': Bắt buộc là CHỮ HÁN. 
                                3. TRƯỜNG 'pinyin': Là phiên âm.
                                4. TRƯỜNG 'translation': Là nghĩa tiếng Việt.
                                Cấm trả về văn bản thuần, chỉ trả về JSON."
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
            _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);
            
            var payload = new {
                model = "llama-3.1-8b-instant",
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