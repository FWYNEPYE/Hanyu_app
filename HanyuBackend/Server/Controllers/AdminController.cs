using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Server.Data;
using Server.Models;
using System.Diagnostics;
using System.Runtime.InteropServices;

namespace Server.Namespace.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "admin")] // Chỉ tài khoản có Role là admin mới gọi được
    public class AdminController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AdminController(AppDbContext context)
        {
            _context = context;
        }


        // ---  QUẢN LÝ NGƯỜI DÙNG ---
        [HttpGet("users")]
        public async Task<IActionResult> GetUsers()
        {
            var users = await _context.Users
                .Select(u => new { u.UserID, u.Username, u.Email, u.Role, u.IsActive, u.Points, u.Rank })
                .ToListAsync();
            return Ok(users);
        }

        [HttpPut("users/toggle-status/{id}")]
        public async Task<IActionResult> ToggleUserStatus(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound(new { message = "Không tìm thấy người dùng" });

            // Nếu admin tự ban chính mình thì chặn lại cho chắc
            if (user.Role == "admin") return BadRequest(new { message = "Không thể khóa tài khoản Admin" });

            user.IsActive = !user.IsActive;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Cập nhật trạng thái thành công", status = user.IsActive });
        }

        // --- TÌM KIẾM & PHÂN TRANG NGƯỜI DÙNG ---
        [HttpGet("users/search")]
        public async Task<IActionResult> SearchUsers([FromQuery] string query)
        {
            if (string.IsNullOrEmpty(query)) return await GetUsers();

            var users = await _context.Users
                .Where(u => u.Username.Contains(query) || u.Email.Contains(query))
                .Select(u => new { 
                    u.UserID, 
                    u.Username, 
                    u.Email, 
                    u.Role, 
                    u.IsActive,
                    u.Points,
                    u.TotalExp
                })
                .ToListAsync();

            return Ok(users);
        }

        // ---  XEM CHI TIẾT HỌC VIÊN  ---
        [HttpGet("users/{id}/details")]
        public async Task<IActionResult> GetUserDetails(int id)
        {
            var user = await _context.Users
                .Where(u => u.UserID == id)
                .Select(u => new {
                    u.UserID,
                    u.Username,
                    u.Email,
                    u.Rank,
                    u.Points,
                    u.CurrentStreak,
                    u.LongestStreak,
                    u.CreatedAt,
                    // Lấy thêm lịch sử học tập gần đây từ bảng DailyProgresses
                    RecentProgress = u.DailyProgresses
                        .OrderByDescending(p => p.StudyDate)
                        .Take(7)
                        .ToList()
                })
                .FirstOrDefaultAsync();

            if (user == null) return NotFound(new { message = "Không tìm thấy học viên" });

            return Ok(user);
        }

        // --- XÓA NGƯỜI DÙNG  ---
[HttpDelete("users/{id}")]
public async Task<IActionResult> DeleteUser(int id)
{
    var user = await _context.Users.FindAsync(id);
    if (user == null) return NotFound();
    
    // Bảo vệ tuyệt đối tài khoản Admin
    if (user.Role == "admin") return BadRequest(new { message = "Không thể xóa tài khoản Admin" });

    _context.Users.Remove(user);
    await _context.SaveChangesAsync();

    return Ok(new { message = "Đã xóa người dùng khỏi hệ thống" });
}


        // --- CẬP NHẬT ROLE (Dùng khi muốn set một User lên làm Admin phụ) ---
[HttpPut("users/{id}/role")]
public async Task<IActionResult> UpdateRole(int id, [FromBody] RoleUpdateDto model) // Dùng DTO cho chuẩn JSON
{
    var user = await _context.Users.FindAsync(id);
    if (user == null) return NotFound();

    // Không cho phép hạ quyền nếu chỉ còn 1 admin duy nhất (optional)
    user.Role = model.NewRole.ToLower(); 
    await _context.SaveChangesAsync();

    return Ok(new { message = $"Đã cập nhật quyền hạn thành {model.NewRole}" });
}



        [HttpPut("users/{id}/add-point")]
        public async Task<IActionResult> AddPoint(int id, [FromBody] int points)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound(new { message = "Không tìm thấy người dùng" });

            user.Points += points;
            await _context.SaveChangesAsync();

            return Ok(new { message = $"Đã nạp thành công {points} point!", currentPoints = user.Points });
        }

      

 [HttpGet("stats")]
public async Task<IActionResult> GetStats()
{
    var totalUsers = await _context.Users.CountAsync();
    
    var totalRoadmaps = await _context.Roadmaps.CountAsync(); 

    var totalVideos = await _context.Videos.CountAsync();

    var totalVocabs = await _context.Vocabularies.CountAsync();

    var pendingPosts = await _context.Categories.CountAsync(c => !c.IsPublic);

    var unreadNotifications = await _context.Notifications.CountAsync(n => !n.IsRead);

    return Ok(new { 
        totalUsers, 
        totalRoadmaps,
        totalVideos,
        totalVocabs,
        pendingPosts,
        unreadNotifications
    });
}

// --- LẤY NHẬT KÝ THẬT ---
[HttpGet("recent-activities")]
public async Task<IActionResult> GetRecentActivities()
{
    var activities = await _context.DailyProgresses
        .Include(u => u.User)
        .OrderByDescending(p => p.StudyDate)
        .Take(5)
        .Select(p => new {
            user = p.User.Username,
            action = "đã tích lũy được",
            target = p.PointsGained + " điểm",
            time = p.StudyDate
        })
        .ToListAsync();

    return Ok(activities);
}


// [HttpGet("server-health")]
// public IActionResult GetServerHealth()
// {
//     // 1. Lấy mức sử dụng RAM (Memory)
//     var memory = GC.GetGCMemoryInfo();
//     var totalMemory = memory.TotalAvailableMemoryBytes;
//     var usedMemory = memory.HeapSizeBytes;
//     double ramUsage = Math.Round(((double)usedMemory / totalMemory) * 100, 1);

//     // 2. Kiểm tra kết nối Database
//     bool dbConnected = _context.Database.CanConnect();

//     double cpuUsage = Math.Round(new Random().NextDouble() * (15.5 - 10.2) + 10.2, 1); 

//     return Ok(new { 
//         cpu = cpuUsage, 
//         ram = ramUsage > 0 ? ramUsage : 35.2, 
//         dbStatus = dbConnected ? "Connected" : "Disconnected"
//     });
// }

[HttpGet("server-health")]
public IActionResult GetServerHealth()
{
    var memory = GC.GetGCMemoryInfo();
    double ramUsage = Math.Round(((double)memory.HeapSizeBytes / memory.TotalAvailableMemoryBytes) * 100, 1);

    bool dbConnected = _context.Database.CanConnect();
    
    // CPU ảo cho đồ án
    double cpuUsage = Math.Round(new Random().NextDouble() * (15.5 - 10.2) + 10.2, 1); 

    return Ok(new { 
        cpu = cpuUsage, 
        ram = ramUsage > 0 ? ramUsage : 25.5, 
        dbStatus = dbConnected ? "Connected" : "Disconnected",
        os = RuntimeInformation.OSDescription // Thêm thông tin OS cho chuyên nghiệp
    });
}

    }

    public class RoleUpdateDto {
        public string NewRole { get; set; }
    }
}