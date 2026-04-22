using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Server.Models
{
    public class DailyProgress
    {
        [Key]
        public int ProgressId { get; set; }

        [Required]
        public int UserID { get; set; }

        [Required]
        public DateTime StudyDate { get; set; } = DateTime.Today;

        public int TotalSeconds { get; set; } = 0; 
        public int PointsGained { get; set; } = 0; // số điểm kiếm được trong ngày
        
        public int ActionCount { get; set; } = 0; // số hành đọng
        public bool IsCompleted { get; set; } = false; // ktra đạt mốc 10 phút 

       
        [ForeignKey("UserID")]
        public virtual User User { get; set; }
        
    }
}