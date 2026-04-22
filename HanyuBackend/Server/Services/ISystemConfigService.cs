using Microsoft.EntityFrameworkCore;
using Server.Data;

namespace Server.Services 
{
    public interface ISystemConfigService {
        Task<string> GetConfigAsync(string key);
    }

    public class SystemConfigService : ISystemConfigService {
        private readonly AppDbContext _context;
        public SystemConfigService(AppDbContext context) {
            _context = context;
        }

        public async Task<string> GetConfigAsync(string key) {
            var config = await _context.SystemSettings
                .FirstOrDefaultAsync(s => s.SettingKey == key);
            
            return config?.SettingValue ?? ""; 
        }
    }
}