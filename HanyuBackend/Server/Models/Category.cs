using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Server.Models
{
    public class Category
    {
        [Key] 
        public string CategoryID { get; set; } = string.Empty; 

        public string CategoryName { get; set; } = string.Empty;
        
        // "system" là từ điển chung, "user" là bộ từ cá nhân
        public string CategoryType { get; set; } = "system"; 

  
        public bool IsPublic { get; set; } = false; 
        public bool IsPending { get; set; } = false; 
        public bool IsLocked { get; set; } = false;
        public int Price { get; set; } = 0; // Giá (point) 

        public int Version { get; set; } = 1;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        public string? ParentCategoryID { get; set; } 

        public string? Description { get; set; }

        public string? IconName { get; set; } 
        public string? ColorClass { get; set; }

        public int LikesCount { get; set; } = 0;    
        public string? Tags { get; set; } 
        public int LastWordCount { get; set; } = 0;
        public bool IsBonusAwarded { get; set; } = false;
        public int? UserID { get; set; } 

        [ForeignKey("UserID")]
        public virtual User? User { get; set; }

        public virtual ICollection<Vocabulary> Vocabularies { get; set; } = new List<Vocabulary>();
        public virtual ICollection<RoadmapStep> RoadmapSteps { get; set; } = new List<RoadmapStep>();
    }
}