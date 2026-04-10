using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Server.Migrations
{
    /// <inheritdoc />
    public partial class UpdateSubTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "AnalysisData",
                table: "Subtitles",
                newName: "Translation");

            migrationBuilder.AddColumn<string>(
                name: "Pinyin",
                table: "Subtitles",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Tokens",
                table: "Subtitles",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Pinyin",
                table: "Subtitles");

            migrationBuilder.DropColumn(
                name: "Tokens",
                table: "Subtitles");

            migrationBuilder.RenameColumn(
                name: "Translation",
                table: "Subtitles",
                newName: "AnalysisData");
        }
    }
}
