using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Server.Migrations
{
    /// <inheritdoc />
    public partial class AddExamToRoadmapStep : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ExamId",
                table: "RoadmapSteps",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_RoadmapSteps_ExamId",
                table: "RoadmapSteps",
                column: "ExamId");

            migrationBuilder.AddForeignKey(
                name: "FK_RoadmapSteps_Exams_ExamId",
                table: "RoadmapSteps",
                column: "ExamId",
                principalTable: "Exams",
                principalColumn: "ExamId",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_RoadmapSteps_Exams_ExamId",
                table: "RoadmapSteps");

            migrationBuilder.DropIndex(
                name: "IX_RoadmapSteps_ExamId",
                table: "RoadmapSteps");

            migrationBuilder.DropColumn(
                name: "ExamId",
                table: "RoadmapSteps");
        }
    }
}
