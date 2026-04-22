using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema; 

namespace Server.Models 
{
    public class ChatHistory
    {
        [Key]
        public int Id { get; set; }

        // Khai báo cột UserId để lưu ID thằng User
        public int UserID { get; set; }

        // Định nghĩa Khóa ngoài trỏ tới bảng User
        [ForeignKey("UserID")]
        public virtual User User { get; set; } = null!; 

        public string Role { get; set; } = string.Empty; 
        public string SessionID { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public string? Pinyin { get; set; }
        public string? Translation { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }
}