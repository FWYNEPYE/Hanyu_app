using System;
using System.ComponentModel.DataAnnotations;

namespace Server.Models
{
   public class Minigame
    {
        [Key]
        [StringLength(50)]
        public string GameId { get; set; }

        [Required]
        [StringLength(100)]
        public string Name { get; set; }

        [StringLength(500)]
        public string Description { get; set; } 

        [StringLength(20)]
        public string Status { get; set; } = "Active";

        [StringLength(20)]
        public string Difficulty { get; set; }

        public int BasePoint { get; set; } = 10;
        public int TimeLimit { get; set; } = 60; 
        public int MinQuestions { get; set; } = 5; 

        public DateTime LastUpdated { get; set; } = DateTime.UtcNow;
    }
}