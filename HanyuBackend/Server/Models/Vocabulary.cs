using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace Server.Models
{
    public class Vocabulary
    {
        [Key]
       public int VocaId { get; set; } 
        public string Hanzi { get; set; } = string.Empty; 
        public string Pinyin { get; set; } = string.Empty;
        public string Meaning { get; set; } = string.Empty; 
        public string Type { get; set; } = string.Empty; 
        
        public string? Example { get; set; }     
        public string? ExampleMeaning { get; set; } 
        public string? Grammar { get; set; }     
        public string? Radical { get; set; }     
        public string? Note { get; set; }        
        public string? StrokeUrl { get; set; }   
        
        public int Level { get; set; } 
        public string CategoryID { get; set; } = string.Empty; 
        public int AddedInVersion { get; set; } = 1;

        [ForeignKey("CategoryID")]
        public virtual Category? Category { get; set; }
        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        
    }
}