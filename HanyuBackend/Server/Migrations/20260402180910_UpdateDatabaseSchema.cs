using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Server.Migrations
{
    /// <inheritdoc />
    public partial class UpdateDatabaseSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ChatHistory_Users_UserID",
                table: "ChatHistory");

            migrationBuilder.DropPrimaryKey(
                name: "PK_ChatHistory",
                table: "ChatHistory");

            migrationBuilder.RenameTable(
                name: "ChatHistory",
                newName: "ChatHistories");

            migrationBuilder.RenameIndex(
                name: "IX_ChatHistory_UserID",
                table: "ChatHistories",
                newName: "IX_ChatHistories_UserID");

            migrationBuilder.AddPrimaryKey(
                name: "PK_ChatHistories",
                table: "ChatHistories",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_ChatHistories_Users_UserID",
                table: "ChatHistories",
                column: "UserID",
                principalTable: "Users",
                principalColumn: "UserID",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ChatHistories_Users_UserID",
                table: "ChatHistories");

            migrationBuilder.DropPrimaryKey(
                name: "PK_ChatHistories",
                table: "ChatHistories");

            migrationBuilder.RenameTable(
                name: "ChatHistories",
                newName: "ChatHistory");

            migrationBuilder.RenameIndex(
                name: "IX_ChatHistories_UserID",
                table: "ChatHistory",
                newName: "IX_ChatHistory_UserID");

            migrationBuilder.AddPrimaryKey(
                name: "PK_ChatHistory",
                table: "ChatHistory",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_ChatHistory_Users_UserID",
                table: "ChatHistory",
                column: "UserID",
                principalTable: "Users",
                principalColumn: "UserID",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
