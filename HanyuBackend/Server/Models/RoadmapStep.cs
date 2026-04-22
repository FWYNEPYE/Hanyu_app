using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Server.Models
{
    public class RoadmapStep
    {
        [Key]
        public int StepId { get; set; }
        [Required]
        public string Title { get; set; } 
        public string? Description { get; set; }
        public int Order { get; set; } 
        public int? ExamId { get; set; }
    
        [ForeignKey("ExamId")]
        public virtual Exam? Exam { get; set; }

        public string? CategoryID { get; set; } 

        [ForeignKey("CategoryID")]
        public virtual Category Category { get; set; }
        
        public int RoadmapId { get; set; }
        [ForeignKey("RoadmapId")]
        public virtual Roadmap Roadmap { get; set; }
    }
}