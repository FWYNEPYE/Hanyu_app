using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Server.Models
{
    public class Subtitle
    {
        [Key]
        public int SubId { get; set; }

        // Khóa ngoại liên kết tới bảng Videos
        public int VideoId { get; set; }

        public double StartTime { get; set; } 
        public double EndTime { get; set; }  
        
        [Required]
        public string Content { get; set; }   

       public string? Pinyin { get; set; }
    public string? Translation { get; set; } // Nghĩa tiếng Việt
    public string? Tokens { get; set; }
        
        [ForeignKey("VideoId")]
        public virtual Video? Video { get; set; }
    }
}