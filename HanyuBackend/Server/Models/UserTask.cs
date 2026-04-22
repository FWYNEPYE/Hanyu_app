using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Server.Models
{
    public class UserTask
    {
        [Key]
        public int TaskId { get; set; }

        // Khóa ngoại nối với bảng User
        public int UserID { get; set; }
        
        [ForeignKey("UserID")]
        public virtual User? User { get; set; }

        [Required]
        public string TaskName { get; set; } = string.Empty; // Tên nhiệm vụ (vd: "Học 10 phút")

        public string Description { get; set; } = string.Empty; // Mô tả thêm

        public int Points { get; set; } // Số điểm nhận được

        public string Type { get; set; } = "DAILY"; // DAILY, STREAK, ACHIEVEMENT...

        public bool IsCompleted { get; set; } = false;

        public DateTime TargetDate { get; set; } = DateTime.Today; // Ngày của nhiệm vụ

        public DateTime? CompletedAt { get; set; } // Lưu lại lúc sếp bấm nhận điểm
    }
}