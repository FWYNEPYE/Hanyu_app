using System.ComponentModel.DataAnnotations.Schema;

namespace Server.Models
{
    public class Vocabulary
    {
        public int Id { get; set; } 
        public string Hanzi { get; set; } = string.Empty; 
        public string Pinyin { get; set; } = string.Empty;
        public string Meaning { get; set; } = string.Empty; 
        public string Type { get; set; } = string.Empty;    
        public string Example { get; set; } = string.Empty; 
        public string Note { get; set; } = string.Empty;
        public int Level { get; set; }                     
        public string CategoryID { get; set; } = string.Empty; 

        [ForeignKey("CategoryID")]
        public virtual Category? Category { get; set; }
        public DateTime CreatedDate { get; set; } = DateTime.Now;
    }
}