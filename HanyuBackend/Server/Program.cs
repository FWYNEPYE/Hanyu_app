using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.EntityFrameworkCore;
using System.Text;
using Server.Data;
using Server.Services;
using Newtonsoft.Json;

var builder = WebApplication.CreateBuilder(args);

// --- 1. CẤU HÌNH AUTHENTICATION (JWT) ---
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        // Lưu ý: Chuỗi Key này nên để trong appsettings.json khi deploy thật
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"] ?? "Chuoi_Bi_Mat_Cuc_Ky_Dai_Va_Ba_Dao_Cua_Anh_Hehehehehe_Hehehehehehe_Hehehehehehehe_Hehehehehehehe")), 
        ValidateIssuer = false,
        ValidateAudience = false,
        ClockSkew = TimeSpan.Zero
    };
});

// --- 2. CẤU HÌNH CONTROLLERS & JSON ---
// builder.Services.AddControllers()
//     .AddJsonOptions(options =>
//     {
//         // Tránh lỗi vòng lặp vô tận khi trả về dữ liệu có quan hệ n-n
//         options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;   
//         options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
//     });

builder.Services.AddControllers()
    .AddNewtonsoftJson(options =>
    {
        // Fix lỗi vòng lặp Video -> Subtitles -> Video
        options.SerializerSettings.ReferenceLoopHandling = ReferenceLoopHandling.Ignore;
        // Cho phép trả về null cho các cột chưa có dữ liệu dịch
        options.SerializerSettings.NullValueHandling = NullValueHandling.Include;
        // Đảm bảo Frontend nhận được camelCase (videoId thay vì VideoId)
        options.SerializerSettings.ContractResolver = new Newtonsoft.Json.Serialization.CamelCasePropertyNamesContractResolver();
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// --- 3. KẾT NỐI DATABASE ---
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// --- 4. ĐĂNG KÝ DEPENDENCY INJECTION (CHỖ SẾP BỊ LỖI LÀ Ở ĐÂY) ---

// Đăng ký Service cấu hình hệ thống (Dòng này cực kỳ quan trọng để fix lỗi 500)
builder.Services.AddScoped<ISystemConfigService, SystemConfigService>();

// Đăng ký GroqService tích hợp HttpClient
builder.Services.AddHttpClient<GroqService>();

// Nếu sếp có dùng AI Service hay Dictionary Service khác thì đăng ký thêm ở đây:
// builder.Services.AddScoped<IDictionaryService, DictionaryService>();


// --- 5. CẤU HÌNH CORS & ROUTING ---
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        policy => policy.AllowAnyOrigin()
                        .AllowAnyMethod()
                        .AllowAnyHeader());
});

builder.Services.AddRouting(options => options.LowercaseUrls = true);

var app = builder.Build();
var cultureInfo = new System.Globalization.CultureInfo("en-US");
System.Globalization.CultureInfo.DefaultThreadCurrentCulture = cultureInfo;
System.Globalization.CultureInfo.DefaultThreadCurrentUICulture = cultureInfo;


// --- 6. CẤU HÌNH MIDDLEWARE (THỨ TỰ RẤT QUAN TRỌNG) ---

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Hanyu API V1");
        c.RoutePrefix = "swagger"; 
    });
}

app.UseRouting();
app.UseCors("AllowAll");

app.UseAuthentication(); 
app.UseAuthorization(); 

app.UseStaticFiles();
app.MapControllers();

app.Run();