using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Server.Migrations
{
    /// <inheritdoc />
    public partial class CreateDailyTableFinal : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
{
    migrationBuilder.CreateTable(
        name: "DailyProgresses",
        columns: table => new
        {
            // [Key] ProgressId
            ProgressId = table.Column<int>(type: "int", nullable: false)
                .Annotation("SqlServer:Identity", "1, 1"),

            // [Required] UserID
            UserID = table.Column<int>(type: "int", nullable: false),

            // [Required] StudyDate (Mặc định DateTime.Today sẽ do Code xử lý, DB để datetime2)
            StudyDate = table.Column<DateTime>(type: "datetime2", nullable: false),

            // TotalSeconds (Mặc định 0)
            TotalSeconds = table.Column<int>(type: "int", nullable: false, defaultValue: 0),

            // IsCompleted (Mặc định false)
            IsCompleted = table.Column<bool>(type: "bit", nullable: false, defaultValue: false)
        },
        constraints: table =>
        {
            table.PrimaryKey("PK_DailyProgresses", x => x.ProgressId);
            
            // [ForeignKey("UserID")]
            table.ForeignKey(
                name: "FK_DailyProgresses_Users_UserID",
                column: x => x.UserID,
                principalTable: "Users",
                principalColumn: "UserID",
                onDelete: ReferentialAction.Cascade); // Xóa User thì xóa luôn Progress
        });

    // Tạo Index để truy vấn nhanh theo User và chặn trùng lặp ngày học
    migrationBuilder.CreateIndex(
        name: "IX_DailyProgresses_UserID_StudyDate",
        table: "DailyProgresses",
        columns: new[] { "UserID", "StudyDate" },
        unique: true);
}

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {

        }
    }
}
