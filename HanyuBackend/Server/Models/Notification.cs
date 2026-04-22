using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema; // Thêm cái này để dùng [ForeignKey]

namespace Server.Models
{
    public class Notification
    {
        [Key]
        public int NotiId { get; set; }

        public int UserID { get; set; }

        [ForeignKey("UserID")]
        public virtual User? User { get; set; } // Liên kết trực tiếp với bảng User

        public string Type { get; set; } = string.Empty; 
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public string? RelatedId { get; set; }
        public bool IsRead { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }
}