using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Server.Models
{
    public class UserProgress
    {
        [Key]
        public int UserProId { get; set; }

        [Required]
        public int UserID { get; set; } // PHẢI LÀ INT để khớp với bảng User

        public int RoadmapStepId { get; set; }
        
        [ForeignKey("RoadmapStepId")]
        public virtual RoadmapStep RoadmapStep { get; set; }

        // Thêm cái này để EF Core hiểu đây là khóa ngoại trỏ sang bảng User
        [ForeignKey("UserID")]
        public virtual User User { get; set; } 

        public bool IsCompleted { get; set; } = true;
        public DateTime CompletedAt { get; set; } = DateTime.Now;
    }
}