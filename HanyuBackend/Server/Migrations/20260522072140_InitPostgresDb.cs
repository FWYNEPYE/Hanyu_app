using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Server.Migrations
{
    /// <inheritdoc />
    public partial class InitPostgresDb : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Exams",
                columns: table => new
                {
                    ExamId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Title = table.Column<string>(type: "text", nullable: false),
                    TimeLimit = table.Column<int>(type: "integer", nullable: false),
                    MinScoreToPass = table.Column<int>(type: "integer", nullable: false),
                    PointReward = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Exams", x => x.ExamId);
                });

            migrationBuilder.CreateTable(
                name: "Minigames",
                columns: table => new
                {
                    GameId = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    Status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Difficulty = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    BasePoint = table.Column<int>(type: "integer", nullable: false),
                    TimeLimit = table.Column<int>(type: "integer", nullable: false),
                    MinQuestions = table.Column<int>(type: "integer", nullable: false),
                    LastUpdated = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Minigames", x => x.GameId);
                });

            migrationBuilder.CreateTable(
                name: "Roadmaps",
                columns: table => new
                {
                    RoadmapId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Title = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    Slug = table.Column<string>(type: "text", nullable: true),
                    ImageUrl = table.Column<string>(type: "text", nullable: true),
                    IsExamStep = table.Column<bool>(type: "boolean", nullable: false),
                    ExamId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Roadmaps", x => x.RoadmapId);
                });

            migrationBuilder.CreateTable(
                name: "SentencePuzzles",
                columns: table => new
                {
                    PuzzleId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    CorrectSentence = table.Column<string>(type: "text", nullable: false),
                    Pinyin = table.Column<string>(type: "text", nullable: false),
                    PointsReward = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SentencePuzzles", x => x.PuzzleId);
                });

            migrationBuilder.CreateTable(
                name: "SystemSettings",
                columns: table => new
                {
                    SysId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    SettingKey = table.Column<string>(type: "text", nullable: false),
                    SettingValue = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SystemSettings", x => x.SysId);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    UserID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Username = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    GoogleId = table.Column<string>(type: "text", nullable: true),
                    PasswordHash = table.Column<string>(type: "text", nullable: true),
                    Email = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CurrentStreak = table.Column<int>(type: "integer", nullable: false),
                    LongestStreak = table.Column<int>(type: "integer", nullable: false),
                    LastStudyDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Points = table.Column<int>(type: "integer", nullable: false),
                    TotalExp = table.Column<int>(type: "integer", nullable: false),
                    Rank = table.Column<string>(type: "text", nullable: true),
                    AvailableAIUsage = table.Column<int>(type: "integer", nullable: false),
                    Role = table.Column<string>(type: "text", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    AvatarUrl = table.Column<string>(type: "text", nullable: true),
                    IsLocked = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.UserID);
                });

            migrationBuilder.CreateTable(
                name: "Questions",
                columns: table => new
                {
                    QuestionId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ExamId = table.Column<int>(type: "integer", nullable: false),
                    Content = table.Column<string>(type: "text", nullable: false),
                    Pinyin = table.Column<string>(type: "text", nullable: true),
                    AudioUrl = table.Column<string>(type: "text", nullable: true),
                    ImageUrl = table.Column<string>(type: "text", nullable: true),
                    QuestionType = table.Column<int>(type: "integer", nullable: false),
                    OptionA = table.Column<string>(type: "text", nullable: true),
                    OptionB = table.Column<string>(type: "text", nullable: true),
                    OptionC = table.Column<string>(type: "text", nullable: true),
                    OptionD = table.Column<string>(type: "text", nullable: true),
                    CorrectAnswer = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Questions", x => x.QuestionId);
                    table.ForeignKey(
                        name: "FK_Questions_Exams_ExamId",
                        column: x => x.ExamId,
                        principalTable: "Exams",
                        principalColumn: "ExamId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Categories",
                columns: table => new
                {
                    CategoryID = table.Column<string>(type: "text", nullable: false),
                    CategoryName = table.Column<string>(type: "text", nullable: false),
                    CategoryType = table.Column<string>(type: "text", nullable: false),
                    IsPublic = table.Column<bool>(type: "boolean", nullable: false),
                    IsPending = table.Column<bool>(type: "boolean", nullable: false),
                    IsLocked = table.Column<bool>(type: "boolean", nullable: false),
                    Price = table.Column<int>(type: "integer", nullable: false),
                    Version = table.Column<int>(type: "integer", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ParentCategoryID = table.Column<string>(type: "text", nullable: true),
                    Description = table.Column<string>(type: "text", nullable: true),
                    IconName = table.Column<string>(type: "text", nullable: true),
                    ColorClass = table.Column<string>(type: "text", nullable: true),
                    LikesCount = table.Column<int>(type: "integer", nullable: false),
                    Tags = table.Column<string>(type: "text", nullable: true),
                    LastWordCount = table.Column<int>(type: "integer", nullable: false),
                    IsBonusAwarded = table.Column<bool>(type: "boolean", nullable: false),
                    UserID = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Categories", x => x.CategoryID);
                    table.ForeignKey(
                        name: "FK_Categories_Users_UserID",
                        column: x => x.UserID,
                        principalTable: "Users",
                        principalColumn: "UserID");
                });

            migrationBuilder.CreateTable(
                name: "ChatHistories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserID = table.Column<int>(type: "integer", nullable: false),
                    Role = table.Column<string>(type: "text", nullable: false),
                    SessionID = table.Column<string>(type: "text", nullable: false),
                    Content = table.Column<string>(type: "text", nullable: false),
                    Pinyin = table.Column<string>(type: "text", nullable: true),
                    Translation = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ChatHistories", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ChatHistories_Users_UserID",
                        column: x => x.UserID,
                        principalTable: "Users",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "DailyProgresses",
                columns: table => new
                {
                    ProgressId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserID = table.Column<int>(type: "integer", nullable: false),
                    StudyDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    TotalSeconds = table.Column<int>(type: "integer", nullable: false),
                    PointsGained = table.Column<int>(type: "integer", nullable: false),
                    ActionCount = table.Column<int>(type: "integer", nullable: false),
                    IsCompleted = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DailyProgresses", x => x.ProgressId);
                    table.ForeignKey(
                        name: "FK_DailyProgresses_Users_UserID",
                        column: x => x.UserID,
                        principalTable: "Users",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Messages",
                columns: table => new
                {
                    MessId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserID = table.Column<int>(type: "integer", nullable: false),
                    Content = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Messages", x => x.MessId);
                    table.ForeignKey(
                        name: "FK_Messages_Users_UserID",
                        column: x => x.UserID,
                        principalTable: "Users",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Notifications",
                columns: table => new
                {
                    NotiId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserID = table.Column<int>(type: "integer", nullable: false),
                    Type = table.Column<string>(type: "text", nullable: false),
                    Title = table.Column<string>(type: "text", nullable: false),
                    Content = table.Column<string>(type: "text", nullable: false),
                    RelatedId = table.Column<string>(type: "text", nullable: true),
                    IsRead = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Notifications", x => x.NotiId);
                    table.ForeignKey(
                        name: "FK_Notifications_Users_UserID",
                        column: x => x.UserID,
                        principalTable: "Users",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UserPuzzleCompletions",
                columns: table => new
                {
                    UPuzzleId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserID = table.Column<int>(type: "integer", nullable: false),
                    PuzzleID = table.Column<int>(type: "integer", nullable: false),
                    CompletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
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

            migrationBuilder.CreateTable(
                name: "UserTasks",
                columns: table => new
                {
                    TaskId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserID = table.Column<int>(type: "integer", nullable: false),
                    TaskName = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    Points = table.Column<int>(type: "integer", nullable: false),
                    Type = table.Column<string>(type: "text", nullable: false),
                    IsCompleted = table.Column<bool>(type: "boolean", nullable: false),
                    TargetDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CompletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserTasks", x => x.TaskId);
                    table.ForeignKey(
                        name: "FK_UserTasks_Users_UserID",
                        column: x => x.UserID,
                        principalTable: "Users",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Videos",
                columns: table => new
                {
                    VideoId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Title = table.Column<string>(type: "text", nullable: false),
                    VideoType = table.Column<string>(type: "text", nullable: false),
                    UrlOrPath = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UserID = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Videos", x => x.VideoId);
                    table.ForeignKey(
                        name: "FK_Videos_Users_UserID",
                        column: x => x.UserID,
                        principalTable: "Users",
                        principalColumn: "UserID");
                });

            migrationBuilder.CreateTable(
                name: "GameLogs",
                columns: table => new
                {
                    LogId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserID = table.Column<int>(type: "integer", nullable: false),
                    GameId = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    CategoryID = table.Column<string>(type: "text", nullable: false),
                    Score = table.Column<int>(type: "integer", nullable: false),
                    CorrectAnswers = table.Column<int>(type: "integer", nullable: false),
                    TotalQuestions = table.Column<int>(type: "integer", nullable: false),
                    CompletionTime = table.Column<int>(type: "integer", nullable: false),
                    PlayedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GameLogs", x => x.LogId);
                    table.ForeignKey(
                        name: "FK_GameLogs_Categories_CategoryID",
                        column: x => x.CategoryID,
                        principalTable: "Categories",
                        principalColumn: "CategoryID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_GameLogs_Minigames_GameId",
                        column: x => x.GameId,
                        principalTable: "Minigames",
                        principalColumn: "GameId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_GameLogs_Users_UserID",
                        column: x => x.UserID,
                        principalTable: "Users",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "RoadmapSteps",
                columns: table => new
                {
                    StepId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Title = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    Order = table.Column<int>(type: "integer", nullable: false),
                    ExamId = table.Column<int>(type: "integer", nullable: true),
                    CategoryID = table.Column<string>(type: "text", nullable: true),
                    RoadmapId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RoadmapSteps", x => x.StepId);
                    table.ForeignKey(
                        name: "FK_RoadmapSteps_Categories_CategoryID",
                        column: x => x.CategoryID,
                        principalTable: "Categories",
                        principalColumn: "CategoryID");
                    table.ForeignKey(
                        name: "FK_RoadmapSteps_Exams_ExamId",
                        column: x => x.ExamId,
                        principalTable: "Exams",
                        principalColumn: "ExamId",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_RoadmapSteps_Roadmaps_RoadmapId",
                        column: x => x.RoadmapId,
                        principalTable: "Roadmaps",
                        principalColumn: "RoadmapId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UserCategories",
                columns: table => new
                {
                    UserID = table.Column<int>(type: "integer", nullable: false),
                    CategoryID = table.Column<string>(type: "text", nullable: false),
                    SavedVersion = table.Column<int>(type: "integer", nullable: false),
                    PurchasedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserCategories", x => new { x.UserID, x.CategoryID });
                    table.ForeignKey(
                        name: "FK_UserCategories_Categories_CategoryID",
                        column: x => x.CategoryID,
                        principalTable: "Categories",
                        principalColumn: "CategoryID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserCategories_Users_UserID",
                        column: x => x.UserID,
                        principalTable: "Users",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Vocabularies",
                columns: table => new
                {
                    VocaId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Hanzi = table.Column<string>(type: "text", nullable: false),
                    Pinyin = table.Column<string>(type: "text", nullable: false),
                    Meaning = table.Column<string>(type: "text", nullable: false),
                    Type = table.Column<string>(type: "text", nullable: false),
                    Example = table.Column<string>(type: "text", nullable: true),
                    ExampleMeaning = table.Column<string>(type: "text", nullable: true),
                    Grammar = table.Column<string>(type: "text", nullable: true),
                    Radical = table.Column<string>(type: "text", nullable: true),
                    Note = table.Column<string>(type: "text", nullable: true),
                    StrokeUrl = table.Column<string>(type: "text", nullable: true),
                    Level = table.Column<int>(type: "integer", nullable: false),
                    CategoryID = table.Column<string>(type: "text", nullable: false),
                    AddedInVersion = table.Column<int>(type: "integer", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Vocabularies", x => x.VocaId);
                    table.ForeignKey(
                        name: "FK_Vocabularies_Categories_CategoryID",
                        column: x => x.CategoryID,
                        principalTable: "Categories",
                        principalColumn: "CategoryID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Subtitles",
                columns: table => new
                {
                    SubId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    VideoId = table.Column<int>(type: "integer", nullable: false),
                    StartTime = table.Column<double>(type: "double precision", nullable: false),
                    EndTime = table.Column<double>(type: "double precision", nullable: false),
                    Content = table.Column<string>(type: "text", nullable: false),
                    Pinyin = table.Column<string>(type: "text", nullable: true),
                    Translation = table.Column<string>(type: "text", nullable: true),
                    Tokens = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Subtitles", x => x.SubId);
                    table.ForeignKey(
                        name: "FK_Subtitles_Videos_VideoId",
                        column: x => x.VideoId,
                        principalTable: "Videos",
                        principalColumn: "VideoId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UserProgresses",
                columns: table => new
                {
                    UserProId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserID = table.Column<int>(type: "integer", nullable: false),
                    RoadmapStepId = table.Column<int>(type: "integer", nullable: false),
                    IsCompleted = table.Column<bool>(type: "boolean", nullable: false),
                    CompletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserProgresses", x => x.UserProId);
                    table.ForeignKey(
                        name: "FK_UserProgresses_RoadmapSteps_RoadmapStepId",
                        column: x => x.RoadmapStepId,
                        principalTable: "RoadmapSteps",
                        principalColumn: "StepId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserProgresses_Users_UserID",
                        column: x => x.UserID,
                        principalTable: "Users",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UserVocaProgresses",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserID = table.Column<int>(type: "integer", nullable: false),
                    VocaId = table.Column<int>(type: "integer", nullable: false),
                    CurrentLevel = table.Column<int>(type: "integer", nullable: false),
                    NextReview = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IsSaved = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserVocaProgresses", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserVocaProgresses_Users_UserID",
                        column: x => x.UserID,
                        principalTable: "Users",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserVocaProgresses_Vocabularies_VocaId",
                        column: x => x.VocaId,
                        principalTable: "Vocabularies",
                        principalColumn: "VocaId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Categories_UserID",
                table: "Categories",
                column: "UserID");

            migrationBuilder.CreateIndex(
                name: "IX_ChatHistories_UserID",
                table: "ChatHistories",
                column: "UserID");

            migrationBuilder.CreateIndex(
                name: "IX_DailyProgresses_UserID_StudyDate",
                table: "DailyProgresses",
                columns: new[] { "UserID", "StudyDate" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_GameLogs_CategoryID",
                table: "GameLogs",
                column: "CategoryID");

            migrationBuilder.CreateIndex(
                name: "IX_GameLogs_GameId",
                table: "GameLogs",
                column: "GameId");

            migrationBuilder.CreateIndex(
                name: "IX_GameLogs_UserID",
                table: "GameLogs",
                column: "UserID");

            migrationBuilder.CreateIndex(
                name: "IX_Messages_UserID",
                table: "Messages",
                column: "UserID");

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_UserID",
                table: "Notifications",
                column: "UserID");

            migrationBuilder.CreateIndex(
                name: "IX_Questions_ExamId",
                table: "Questions",
                column: "ExamId");

            migrationBuilder.CreateIndex(
                name: "IX_RoadmapSteps_CategoryID",
                table: "RoadmapSteps",
                column: "CategoryID");

            migrationBuilder.CreateIndex(
                name: "IX_RoadmapSteps_ExamId",
                table: "RoadmapSteps",
                column: "ExamId");

            migrationBuilder.CreateIndex(
                name: "IX_RoadmapSteps_RoadmapId",
                table: "RoadmapSteps",
                column: "RoadmapId");

            migrationBuilder.CreateIndex(
                name: "IX_Subtitles_VideoId",
                table: "Subtitles",
                column: "VideoId");

            migrationBuilder.CreateIndex(
                name: "IX_UserCategories_CategoryID",
                table: "UserCategories",
                column: "CategoryID");

            migrationBuilder.CreateIndex(
                name: "IX_UserProgresses_RoadmapStepId",
                table: "UserProgresses",
                column: "RoadmapStepId");

            migrationBuilder.CreateIndex(
                name: "IX_UserProgresses_UserID",
                table: "UserProgresses",
                column: "UserID");

            migrationBuilder.CreateIndex(
                name: "IX_UserPuzzleCompletions_PuzzleID",
                table: "UserPuzzleCompletions",
                column: "PuzzleID");

            migrationBuilder.CreateIndex(
                name: "IX_UserPuzzleCompletions_UserID",
                table: "UserPuzzleCompletions",
                column: "UserID");

            migrationBuilder.CreateIndex(
                name: "IX_UserTasks_UserID",
                table: "UserTasks",
                column: "UserID");

            migrationBuilder.CreateIndex(
                name: "IX_UserVocaProgresses_UserID",
                table: "UserVocaProgresses",
                column: "UserID");

            migrationBuilder.CreateIndex(
                name: "IX_UserVocaProgresses_VocaId",
                table: "UserVocaProgresses",
                column: "VocaId");

            migrationBuilder.CreateIndex(
                name: "IX_Videos_UserID",
                table: "Videos",
                column: "UserID");

            migrationBuilder.CreateIndex(
                name: "IX_Vocabularies_CategoryID",
                table: "Vocabularies",
                column: "CategoryID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ChatHistories");

            migrationBuilder.DropTable(
                name: "DailyProgresses");

            migrationBuilder.DropTable(
                name: "GameLogs");

            migrationBuilder.DropTable(
                name: "Messages");

            migrationBuilder.DropTable(
                name: "Notifications");

            migrationBuilder.DropTable(
                name: "Questions");

            migrationBuilder.DropTable(
                name: "Subtitles");

            migrationBuilder.DropTable(
                name: "SystemSettings");

            migrationBuilder.DropTable(
                name: "UserCategories");

            migrationBuilder.DropTable(
                name: "UserProgresses");

            migrationBuilder.DropTable(
                name: "UserPuzzleCompletions");

            migrationBuilder.DropTable(
                name: "UserTasks");

            migrationBuilder.DropTable(
                name: "UserVocaProgresses");

            migrationBuilder.DropTable(
                name: "Minigames");

            migrationBuilder.DropTable(
                name: "Videos");

            migrationBuilder.DropTable(
                name: "RoadmapSteps");

            migrationBuilder.DropTable(
                name: "SentencePuzzles");

            migrationBuilder.DropTable(
                name: "Vocabularies");

            migrationBuilder.DropTable(
                name: "Exams");

            migrationBuilder.DropTable(
                name: "Roadmaps");

            migrationBuilder.DropTable(
                name: "Categories");

            migrationBuilder.DropTable(
                name: "Users");
        }
    }
}
