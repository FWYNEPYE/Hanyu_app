using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
namespace Server.Models
{
    public class SentencePuzzle
    {
        [Key]
        public int PuzzleId { get; set; }
        public string CorrectSentence { get; set; } // Lưu dạng "我|在|学|汉语"
        public string Pinyin { get; set; }          // Lưu dạng "Wǒ|zài|xué|Hànyǔ"
        public int PointsReward { get; set; } = 10;  // Điểm thưởng khi giải xong
    }
}