using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;


namespace Server.Models
{
    public class UserVocaProgress
    {
        [Key]
        public int Id { get; set; }

        public int UserID { get; set; }
        [ForeignKey("UserID")]
        public virtual User User { get; set; }

        public int VocaId { get; set; }
        [ForeignKey("VocaId")]
        public virtual Vocabulary Vocabulary { get; set; }

        // Logic SRS cơ bản
        public int CurrentLevel { get; set; } = 1; // Cấp độ từ 1-5
        public DateTime NextReview { get; set; } = DateTime.Now.AddDays(1); // Mặc định mai ôn lại
        public bool IsSaved { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }
}