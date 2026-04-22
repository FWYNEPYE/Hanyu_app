using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Server.Migrations
{
    /// <inheritdoc />
    public partial class InitialPuzzleTracking : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "UserPuzzleCompletions",
                columns: table => new
                {
                    UPuzzleId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserID = table.Column<int>(type: "int", nullable: false),
                    PuzzleID = table.Column<int>(type: "int", nullable: false),
                    CompletedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserPuzzleCompletions", x => x.UPuzzleId);
                    table.ForeignKey(
                        name: "FK_UserPuzzleCompletions_SentencePuzzles_PuzzleID",
                        column: x => x.PuzzleID,
                        principalTable: "SentencePuzzles",
                        principalColumn: "PuzzleId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserPuzzleCompletions_Users_UserID",
                        column: x => x.UserID,
                        principalTable: "Users",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_UserPuzzleCompletions_PuzzleID",
                table: "UserPuzzleCompletions",
                column: "PuzzleID");

            migrationBuilder.CreateIndex(
                name: "IX_UserPuzzleCompletions_UserID",
                table: "UserPuzzleCompletions",
                column: "UserID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "UserPuzzleCompletions");
        }
    }
}
