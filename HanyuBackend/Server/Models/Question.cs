using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Server.Models
{
    public class Question
    {
        [Key]
        public int QuestionId { get; set; }
        public int ExamId { get; set; }

        // --- NỘI DUNG CÂU HỎI ---
        [Required]
        public string Content { get; set; } = string.Empty; 
        public string? Pinyin { get; set; }                
        public string? AudioUrl { get; set; }              
        public string? ImageUrl { get; set; }              

        public int QuestionType { get; set; } 


        public string? OptionA { get; set; }
        public string? OptionB { get; set; }
        public string? OptionC { get; set; }
        public string? OptionD { get; set; }
        
        [Required]
        public string CorrectAnswer { get; set; } = string.Empty; // A, B, C, True, False, hoặc "label" của ảnh

        [ForeignKey("ExamId")]
        public virtual Exam? Exam { get; set; }
    }
}