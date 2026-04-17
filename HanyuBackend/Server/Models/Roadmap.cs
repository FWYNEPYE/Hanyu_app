using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Server.Models;

namespace System.Models
{
    public class Roadmap
    {
        [Key]
        public int RoadId { get; set; }
        [Required]
        public string Title { get; set; } // VD: HSK 1, Giao tiếp cơ bản
        public string Description { get; set; }
        public string Slug { get; set; } // VD: hsk-1
        public string ImageUrl { get; set; }
        
        public bool IsExamStep { get; set; } = false; // Đánh dấu bài thi thử
        public int? ExamId { get; set; } // Nếu là bài thi thì trỏ đến Id của bài thi đó

        // Liên kết 1-N: Một lộ trình có nhiều bài học
        public virtual ICollection<RoadmapStep> Steps { get; set; }
    }
}