using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Server.Data; 
using System;
using OfficeOpenXml;
using OfficeOpenXml.Style;

namespace Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AdminAnalyticsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AdminAnalyticsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("overview")]
        public async Task<IActionResult> GetOverview()
        {
            try
            {
                // Tổng học viên
                var totalUsers = await _context.Users.CountAsync();

                var totalLessons = await _context.UserProgresses
                    .CountAsync(up => up.IsCompleted);

                var totalAiChat = await _context.ChatHistories.CountAsync();
                var sevenDaysAgo = DateTime.UtcNow.AddDays(-7);
                var activeUsersCount = await _context.DailyProgresses
                    .Where(dp => dp.StudyDate >= sevenDaysAgo)
                    .Select(dp => dp.UserID)
                    .Distinct()
                    .CountAsync();

                double retentionRate = totalUsers > 0 
                    ? Math.Round((double)activeUsersCount / totalUsers * 100, 1) 
                    : 0;

                return Ok(new
                {
                    totalUsers,
                    totalLessons = $"{totalLessons / 1000.0:0.0}k", 
                    totalAiChat = $"{totalAiChat / 1000.0:0.0}k",
                    retentionRate = retentionRate + "%"
                });
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("user-growth")]
        public async Task<IActionResult> GetUserGrowth()
        {
            var startDate = DateTime.UtcNow.AddMonths(-11);
            startDate = new DateTime(startDate.Year, startDate.Month, 1);

            var growthData = await _context.Users
                .Where(u => u.CreatedAt >= startDate)
                .GroupBy(u => new { u.CreatedAt.Year, u.CreatedAt.Month })
                .Select(g => new
                {
                    Year = g.Key.Year,
                    Month = g.Key.Month,
                    Count = g.Count()
                })
                .ToListAsync();

            var result = Enumerable.Range(0, 12).Select(i =>
            {
                var targetDate = startDate.AddMonths(i);
                var data = growthData.FirstOrDefault(d => d.Year == targetDate.Year && d.Month == targetDate.Month);
                return new
                {
                    name = $"T{targetDate.Month}",
                    value = data?.Count ?? 0
                };
            });

            return Ok(result);
        }

        [HttpGet("rank-distribution")]
        public async Task<IActionResult> GetRankDistribution()
        {
            var total = await _context.Users.CountAsync();
            if (total == 0) return Ok(new List<object>());

            var ranks = await _context.Users
                .GroupBy(u => u.Rank)
                .Select(g => new
                {
                    label = g.Key ?? "Chưa có hạng",
                    count = g.Count()
                })
                .ToListAsync();

            var result = ranks.Select(r => new {
                label = r.label,
                percent = Math.Round((double)r.count / total * 100)
            });

            return Ok(result);
        }


        [HttpGet("export-report")]
public async Task<IActionResult> ExportExcel()
{
    // Thiết lập License cho EPPlus 
    ExcelPackage.LicenseContext = LicenseContext.NonCommercial;

    using (var package = new ExcelPackage())
    {
        var worksheet = package.Workbook.Worksheets.Add("Báo cáo Hanyu");

        // Định dạng Header
        worksheet.Cells["A1:D1"].Merge = true;
        worksheet.Cells["A1"].Value = "BÁO CÁO TỔNG QUAN HỆ THỐNG HANYU";
        worksheet.Cells["A1"].Style.Font.Bold = true;
        worksheet.Cells["A1"].Style.Font.Size = 16;
        worksheet.Cells["A1"].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;

        // Tiêu đề cột
        worksheet.Cells["A3"].Value = "STT";
        worksheet.Cells["B3"].Value = "Tên học viên";
        worksheet.Cells["C3"].Value = "Hạng (Rank)";
        worksheet.Cells["D3"].Value = "Ngày tham gia";

        using (var range = worksheet.Cells["A3:D3"])
        {
            range.Style.Font.Bold = true;
            range.Style.Fill.PatternType = ExcelFillStyle.Solid;
            range.Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.LightBlue);
        }

        var users = await _context.Users.OrderByDescending(u => u.CreatedAt).ToListAsync();
        int row = 4;
        for (int i = 0; i < users.Count; i++)
        {
            worksheet.Cells[row, 1].Value = i + 1;
            worksheet.Cells[row, 2].Value = users[i].Username;
            worksheet.Cells[row, 3].Value = users[i].Rank ?? "N/A";
            worksheet.Cells[row, 4].Value = users[i].CreatedAt.ToString("dd/MM/yyyy");
            row++;
        }

        worksheet.Cells.AutoFitColumns();

        //  Trả file về cho Browser
        var fileContents = package.GetAsByteArray();
        string fileName = $"BaoCao_Hanyu_{DateTime.UtcNow:yyyyMMdd}.xlsx";
        return File(fileContents, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
    }
}
    }
}