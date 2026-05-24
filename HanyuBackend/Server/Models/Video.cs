using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Http;

namespace Server.Models
{
    public class Video
    {
        [Key]
        public int VideoId { get; set; } 

        [Required]
        public string Title { get; set; }

        public string VideoType { get; set; } 

        public string? UrlOrPath { get; set; }

        [NotMapped]
        public IFormFile? File { get; set; } 

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public int? UserID { get; set; } 

        [ForeignKey("UserID")]
        public virtual User? User { get; set; }
        
        public virtual ICollection<Subtitle> Subtitles { get; set; } = new List<Subtitle>();    
    }
}