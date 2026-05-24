using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;


namespace Server.Models
{
    public class GameLog
    {
        [Key]
        public int LogId { get; set; }

        [Required]
        public int UserID { get; set; }

        [Required]
        [StringLength(50)]
        public string GameId { get; set; }

        [Required]
        public string CategoryID { get; set; }

        public int Score { get; set; } = 0;

        public int CorrectAnswers { get; set; } = 0;

        public int TotalQuestions { get; set; } = 0;

        public int CompletionTime { get; set; } // Tính bằng giây

        public DateTime PlayedAt { get; set; } = DateTime.UtcNow;

        // --- Navigation Properties (Mối quan hệ) ---

        [ForeignKey("UserID")]
        public virtual User User { get; set; }

        [ForeignKey("GameId")]
        public virtual Minigame Minigame { get; set; }

        [ForeignKey("CategoryID")]
        public virtual Category Category { get; set; }
    }
}