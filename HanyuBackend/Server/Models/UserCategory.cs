using System.ComponentModel.DataAnnotations.Schema;

namespace Server.Models
{
    public class UserCategory
    {
        //ng sở hữu
        public int UserID { get; set; }
        
        // Sở hữu bộ từ nào
        public string CategoryID { get; set; }
        public int SavedVersion { get; set; }//version lúc lưu 

        public DateTime PurchasedAt { get; set; } = DateTime.UtcNow;


        [ForeignKey("UserID")]
        public virtual User User { get; set; }

        [ForeignKey("CategoryID")]
        public virtual Category Category { get; set; }
    }
}