namespace HanyuBackend.Models
{
    public class SubtitleDto
    {
        public List<TokenDto> Tokens { get; set; } = new();
        public string Pinyin { get; set; } = "";
        public string Vi { get; set; } = "";
    }

    public class TokenDto
    {
        public string Char { get; set; } = "";
        public string Pinyin { get; set; } = "";
        public string Mean { get; set; } = "";
        public string Type { get; set; } = "";
    }
}