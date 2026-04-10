using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Server.Migrations
{
    /// <inheritdoc />
    public partial class UpdateVideoUserRelation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "UserID",
                table: "Videos",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Videos_UserID",
                table: "Videos",
                column: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_Videos_Users_UserID",
                table: "Videos",
                column: "UserID",
                principalTable: "Users",
                principalColumn: "UserID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Videos_Users_UserID",
                table: "Videos");

            migrationBuilder.DropIndex(
                name: "IX_Videos_UserID",
                table: "Videos");

            migrationBuilder.DropColumn(
                name: "UserID",
                table: "Videos");
        }
    }
}
