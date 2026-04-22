using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Server.Data;
using Server.Models;

namespace Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AdminConfigsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AdminConfigsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetSettings()
        {
            try
            {
                var settings = await _context.SystemSettings.ToListAsync();
                
                var configDict = settings.ToDictionary(s => s.SettingKey, s => s.SettingValue);
                
                return Ok(configDict);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Lỗi server: {ex.Message}");
            }
        }

        [HttpPost("update")]
        public async Task<IActionResult> UpdateSettings([FromBody] Dictionary<string, string> newSettings)
        {
            if (newSettings == null || newSettings.Count == 0)
                return BadRequest("Dữ liệu gửi lên không hợp lệ!");

            try
            {
                foreach (var item in newSettings)
                {
                    var setting = await _context.SystemSettings
                        .FirstOrDefaultAsync(s => s.SettingKey == item.Key);

                    if (setting != null)
                    {
                        setting.SettingValue = item.Value;
                    }
                    else
                    {
                        _context.SystemSettings.Add(new SystemSetting
                        {
                            SettingKey = item.Key,
                            SettingValue = item.Value
                        });
                    }
                }

                await _context.SaveChangesAsync();
                return Ok(new { message = "Cập nhật cấu hình thành công!" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Lỗi khi lưu dữ liệu: {ex.Message}");
            }
        }
    }
}