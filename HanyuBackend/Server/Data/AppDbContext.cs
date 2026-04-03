using Microsoft.EntityFrameworkCore;
using Server.Models;

namespace Server.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        // Đăng ký các bảng (DbSet)
        public DbSet<User> Users { get; set; }
        public DbSet<DailyProgress> DailyProgresses { get; set; }
        public DbSet<Vocabulary> Vocabularies { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<Video> Videos { get; set; }
        public DbSet<ChatHistory> ChatHistories { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Cấu hình cho DailyProgress (Chống rác dữ liệu)
            modelBuilder.Entity<DailyProgress>()
                .HasIndex(p => new { p.UserID, p.StudyDate })
                .IsUnique();

            // Cấu hình cho ChatHistory (Quan hệ 1-N và Khóa ngoài)
            modelBuilder.Entity<ChatHistory>()
                .HasOne(c => c.User)
                .WithMany(u => u.ChatHistories)
                .HasForeignKey(c => c.UserID)
                .OnDelete(DeleteBehavior.Cascade); 
        }
    }
}