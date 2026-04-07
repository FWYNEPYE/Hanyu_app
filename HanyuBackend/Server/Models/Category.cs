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

        // Thêm cái này: Nếu null thì là của hệ thống, có ID thì là của User đó
        public int? UserID { get; set; } 

        [ForeignKey("UserID")]
        public virtual User? User { get; set; }

        public virtual ICollection<Vocabulary> Vocabularies { get; set; } = new List<Vocabulary>();
    }
}