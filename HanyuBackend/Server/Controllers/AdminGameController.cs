using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Server.Models;
using Server.Data;

[Route("api/[controller]")]
[ApiController]
public class MinigameController : ControllerBase
{
    private readonly AppDbContext _context;
    public MinigameController(AppDbContext context) => _context = context;


    [HttpGet("settings")]
    public async Task<ActionResult<IEnumerable<Minigame>>> GetGameSettings()
    {
        return await _context.Minigames.OrderBy(g => g.Name).ToListAsync();
    }

    [HttpPut("settings/{id}/status")]
    public async Task<IActionResult> UpdateStatus(string id, [FromBody] string newStatus)
    {
        var game = await _context.Minigames.FindAsync(id);
        if (game == null) return NotFound();

        game.Status = newStatus;
        game.LastUpdated = DateTime.Now;

        await _context.SaveChangesAsync();
        return Ok(new { message = "Cập nhật trạng thái thành công !" });
    }


    [HttpPost("save-result")]
    public async Task<IActionResult> SaveResult([FromBody] GameLog log)
    {
        if (log == null) return BadRequest();

        log.PlayedAt = DateTime.Now;
        _context.GameLogs.Add(log);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Thành tích đã được ghi nhận!" });
    }

    [HttpGet("leaderboard/{gameId}")]
    public async Task<IActionResult> GetLeaderboard(string gameId)
    {
        var leaderboard = await _context.GameLogs
            .Where(l => l.GameId == gameId)
            .Include(l => l.User)
            .OrderByDescending(l => l.Score)
            .Take(10)
            .Select(l => new {
                UserName = l.User.Username,
                Score = l.Score,
                PlayedAt = l.PlayedAt
            })
            .ToListAsync();

        return Ok(leaderboard);
    }

    // Cập nhật cấu hình game hiện có
    [HttpPut("settings/{id}")]
    public async Task<IActionResult> UpdateGame(string id, [FromBody] Minigame updatedGame)
    {
        var game = await _context.Minigames.FindAsync(id);
        if (game == null) return NotFound();

        // Gán các giá trị mới từ Frontend gửi lên
        game.Name = updatedGame.Name;
        game.Description = updatedGame.Description; // Khớp với trường Description trong C#
        game.Difficulty = updatedGame.Difficulty;
        game.BasePoint = updatedGame.BasePoint;
        game.TimeLimit = updatedGame.TimeLimit;
        game.MinQuestions = updatedGame.MinQuestions;
        game.LastUpdated = DateTime.Now;

        await _context.SaveChangesAsync();
        return Ok(new { message = "Cấu hình đã được cập nhật thành công!" });
    }

    // Thêm định dạng game hoàn toàn mới
    [HttpPost("settings")]
    public async Task<IActionResult> CreateGame([FromBody] Minigame newGame)
    {
        if (await _context.Minigames.AnyAsync(g => g.GameId == newGame.GameId))
            return BadRequest("Mã Game ID này đã tồn tại rồi!");

        newGame.LastUpdated = DateTime.Now;
        _context.Minigames.Add(newGame);
        await _context.SaveChangesAsync();
        
        return CreatedAtAction(nameof(GetGameSettings), new { id = newGame.GameId }, newGame);
    }

    [HttpGet("global-leaderboard")]
public async Task<IActionResult> GetGlobalLeaderboard([FromQuery] string filter = "all")
{
    var query = _context.GameLogs.AsQueryable();
    
    // Logic tính tổng điểm theo User
    var leaderboard = await query
        .Include(l => l.User)
        .GroupBy(l => l.UserID)
        .Select(g => new
        {
            UserName = g.First().User.Username,
            TotalPoints = g.Sum(x => x.Score),
            Streak = 5, 
            UserId = g.Key
        })
        .OrderByDescending(x => x.TotalPoints)
        .Take(20) // Lấy top 20
        .ToListAsync();

    return Ok(leaderboard);
}

}