using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
namespace Server.Models
{
    public class Question
    {
        [Key]
        public int QuestionId { get; set; }
        public int ExamId { get; set; }
        public string Content { get; set; } // Nội dung câu hỏi
        public string OptionA { get; set; }
        public string OptionB { get; set; }
        public string OptionC { get; set; }
        public string OptionD { get; set; }
        public string CorrectAnswer { get; set; } // A, B, C hoặc D
        
        [ForeignKey("ExamId")]
        public virtual Exam Exam { get; set; }
    }
}