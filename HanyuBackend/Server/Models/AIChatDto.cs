public class ChatRequest
{
    public int ScenarioId { get; set; }
    public string Message { get; set; }
    public List<ChatMessage> History { get; set; }
}

public class ChatMessage
{
    public string Role { get; set; } // "user" hoặc "assistant"
    public string Content { get; set; }
}