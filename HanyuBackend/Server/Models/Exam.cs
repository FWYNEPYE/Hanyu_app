using System.ComponentModel.DataAnnotations;
namespace Server.Models
{
    public class Exam
    {
        [Key]
        public int ExamId { get; set; }
        public string Title { get; set; } // Ví dụ: "Thi thử vượt cấp HSK 1"
        public int TimeLimit { get; set; }
        public int MinScoreToPass { get; set; } = 80; // Điểm tối thiểu để đỗ (ví dụ 80/100)
        public int PointReward { get; set; } = 100; // Thưởng bao nhiêu Point nếu đỗ
        public virtual ICollection<Question> Questions { get; set; } = new List<Question>();
    }
}