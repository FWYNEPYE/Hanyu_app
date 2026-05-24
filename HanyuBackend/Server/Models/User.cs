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

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;


        // --- CÁC TRƯỜNG  STREAK ---
        
        public int CurrentStreak { get; set; } = 0; // Chuỗi hiện tại
        
        public int LongestStreak { get; set; } = 0; // Kỷ lục chuỗi
        
        public DateTime? LastStudyDate { get; set; } // Ngày cuối cùng học đủ 10p

        // --- CÁC TRƯỜNG MỚI ĐỂ MỞ RỘNG ---
        public int Points { get; set; } = 0; // Dùng để đi chợ và dùng AI
        public int TotalExp { get; set; } = 0; // Tổng kinh nghiệm tích lũy
        public string? Rank { get; set; } = "Tân thủ"; // Danh hiệu
        public int AvailableAIUsage { get; set; } = 5; // Số lượt dùng AI miễn phí trong ngày
        public string Role { get; set; } = "user";
        public bool IsActive { get; set; } = true;
       public string? AvatarUrl { get; set; }
       public bool IsLocked { get; set; } = false;
        public virtual ICollection<DailyProgress> DailyProgresses { get; set; }
        public virtual ICollection<ChatHistory> ChatHistories { get; set; } = new List<ChatHistory>();
        public virtual ICollection<Category> Categories { get; set; } = new List<Category>();
        public virtual ICollection<Notification> Notifications { get; set; } = new List<Notification>();


    }
}