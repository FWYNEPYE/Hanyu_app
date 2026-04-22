using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Server.Models
{
    public class UserPuzzleCompletion
    {
        [Key]
        public int UPuzzleId { get; set; }

        public int UserID { get; set; }

        public int PuzzleID { get; set; }

        public DateTime CompletedAt { get; set; } = DateTime.Now;

        [ForeignKey("UserID")]
        public virtual User User { get; set; }

        [ForeignKey("PuzzleID")]
        public virtual SentencePuzzle SentencePuzzle { get; set; }
    }
}