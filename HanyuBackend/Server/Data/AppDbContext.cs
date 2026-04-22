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
        public DbSet<Subtitle> Subtitles { get; set; }
        public DbSet<Roadmap> Roadmaps { get; set; }
        public DbSet<RoadmapStep> RoadmapSteps { get; set; }
        public DbSet<UserProgress> UserProgresses { get; set; }
        public DbSet<Exam> Exams { get; set; }
        public DbSet<Question> Questions { get; set; }
        public DbSet<UserCategory> UserCategories { get; set; }
        public DbSet<UserVocaProgress> UserVocaProgresses { get; set; }
        public DbSet<SentencePuzzle> SentencePuzzles { get; set; }
        public DbSet<Message> Messages { get; set; }
        public DbSet<UserPuzzleCompletion> UserPuzzleCompletions { get; set; }
        public DbSet<Notification> Notifications { get; set; }
        public DbSet<UserTask> UserTasks { get; set; }
        public DbSet<Minigame> Minigames {get; set;}
        public DbSet<GameLog> GameLogs {get; set;}
        public DbSet<SystemSetting> SystemSettings { get; set; }

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
            
            modelBuilder.Entity<UserCategory>()
                .HasKey(uc => new { uc.UserID, uc.CategoryID });

            modelBuilder.Entity<RoadmapStep>()
                .HasOne(s => s.Exam)
                .WithMany() 
                .HasForeignKey(s => s.ExamId)
                .OnDelete(DeleteBehavior.SetNull);
        }
    }
}