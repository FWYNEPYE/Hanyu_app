using System.ComponentModel.DataAnnotations;

namespace Server.Models
{
    public class SystemSetting
    {
        [Key]
        public int SysId { get; set; }
        
        public string SettingKey { get; set; }   
        
        public string SettingValue { get; set; } 
    }
}