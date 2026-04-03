using System.ComponentModel.DataAnnotations;

namespace Server.Models
{
    public class User
    {
        [Key]
        public int UserID { get; set; }

        [Required]
        [StringLength(50)]
        public string Username { get; set; }

        public string? GoogleId { get; set; }

        public string? PasswordHash { get; set; } // Lưu mật khẩu đã mã hóa

        [StringLength(100)]
        public string Email { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.Now;


        // --- CÁC TRƯỜNG  STREAK ---
        
        public int CurrentStreak { get; set; } = 0; // Chuỗi hiện tại
        
        public int LongestStreak { get; set; } = 0; // Kỷ lục chuỗi
        
        public DateTime? LastStudyDate { get; set; } // Ngày cuối cùng học đủ 10p

       public string? AvatarUrl { get; set; }
        public virtual ICollection<DailyProgress> DailyProgresses { get; set; }
        public virtual ICollection<ChatHistory> ChatHistories { get; set; } = new List<ChatHistory>();
    }
}