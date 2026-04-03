using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Server.Models
{
    public class GoogleLoginDto
        {
            public string Email { get; set; }
            public string Name { get; set; }
            public string GoogleId { get; set; }
            public string? PhotoUrl { get; set; }
        }
}