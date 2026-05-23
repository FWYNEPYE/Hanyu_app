// using Microsoft.AspNetCore.Authentication.JwtBearer;
// using Microsoft.IdentityModel.Tokens;
// using Microsoft.EntityFrameworkCore;
// using System.Text;
// using Server.Data;
// using Server.Services;
// using Newtonsoft.Json;

// var builder = WebApplication.CreateBuilder(args);

// // --- 1. CẤU HÌNH AUTHENTICATION (JWT) ---
// builder.Services.AddAuthentication(options =>
// {
//     options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
//     options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
// })
// .AddJwtBearer(options =>
// {
//     options.TokenValidationParameters = new TokenValidationParameters
//     {
//         ValidateIssuerSigningKey = true,
//         // Lấy Key từ appsettings.json, nếu không có mới dùng chuỗi fallback an toàn
//         IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"] ?? "Chuoi_Bi_Mat_Cuc_Ky_Dai_Va_Ba_Dao_Cua_Anh_Hehehehehe_Hehehehehehe_Hehehehehehehe_Hehehehehehehe")), 
//         ValidateIssuer = false,
//         ValidateAudience = false,
//         ClockSkew = TimeSpan.Zero
//     };
// });

// // --- 2. CẤU HÌNH CONTROLLERS & JSON (NEWTONSOFT) ---
// builder.Services.AddControllers()
//     .AddNewtonsoftJson(options =>
//     {
//         // Fix lỗi vòng lặp Video -> Subtitles -> Video
//         options.SerializerSettings.ReferenceLoopHandling = ReferenceLoopHandling.Ignore;
//         // Cho phép trả về null cho các cột chưa có dữ liệu dịch
//         options.SerializerSettings.NullValueHandling = NullValueHandling.Include;
//         // Đảm bảo Frontend nhận được camelCase (videoId thay vì VideoId)
//         options.SerializerSettings.ContractResolver = new Newtonsoft.Json.Serialization.CamelCasePropertyNamesContractResolver();
//     });

// builder.Services.AddEndpointsApiExplorer();
// builder.Services.AddSwaggerGen();

// // --- 3. KẾT NỐI DATABASE ---
// builder.Services.AddDbContext<AppDbContext>(options =>
//     options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// // --- 4. ĐĂNG KÝ DEPENDENCY INJECTION ---
// builder.Services.AddScoped<ISystemConfigService, SystemConfigService>();
// builder.Services.AddHttpClient<GroqService>();

// // --- 5. CẤU HÌNH CORS (Đã bảo mật cho Production) ---
// builder.Services.AddCors(options =>
// {
//     // Dùng cho môi trường Local
//     options.AddPolicy("AllowDevelopment",
//         policy => policy.AllowAnyOrigin()
//                         .AllowAnyMethod()
//                         .AllowAnyHeader());

//     // Dùng khi đem đi Deploy thật (Chỉ cho phép ứng dụng React của bạn gọi tới)
//     options.AddPolicy("AllowProduction",
//         policy => policy.WithOrigins(builder.Configuration["AllowedOrigins"] ?? "https://your-react-app.vercel.app") 
//                         .AllowAnyMethod()
//                         .AllowAnyHeader()
//                         .AllowCredentials()); // Cần nếu sau này bạn dùng Cookie/Refresh Token
// });

// builder.Services.AddRouting(options => options.LowercaseUrls = true);

// var app = builder.Build();

// // Cấu hình Culture toàn cục
// var cultureInfo = new System.Globalization.CultureInfo("en-US");
// System.Globalization.CultureInfo.DefaultThreadCurrentCulture = cultureInfo;
// System.Globalization.CultureInfo.DefaultThreadCurrentUICulture = cultureInfo;

// // --- 6. CẤU HÌNH MIDDLEWARE (THỨ TỰ CHUẨN MICROSOFT) ---

// // 1. Phục vụ file tĩnh trước khi xử lý Routing/Auth để tối ưu hiệu năng
// app.UseStaticFiles();

// if (app.Environment.IsDevelopment())
// {
//     app.UseSwagger();
//     app.UseSwaggerUI(c =>
//     {
//         // Dùng đường dẫn tương đối để tránh lỗi hiển thị khi deploy qua proxy/sub-domain
//         c.SwaggerEndpoint("v1/swagger.json", "Hanyu API V1");
//         c.RoutePrefix = "swagger"; 
//     });
// }

// // 2. Định tuyến URL
// app.UseRouting();

// // 3. Áp dụng CORS dựa trên môi trường chạy
// if (app.Environment.IsDevelopment())
// {
//     app.UseCors("AllowDevelopment");
// }
// else
// {
//     app.UseCors("AllowProduction");
// }

// // 4. Bảo mật (Authentication PHẢI chạy trước Authorization)
// app.UseAuthentication(); 
// app.UseAuthorization(); 

// // 5. Áp dụng Controller endpoints cuối cùng
// app.MapControllers();

// app.Run();


using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.EntityFrameworkCore;
using System.Text;
using Server.Data;
using Server.Services;
using Newtonsoft.Json;

var builder = WebApplication.CreateBuilder(args);

// --- 1. CẤU HÌNH AUTHENTICATION (JWT) ---
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"] ?? "Chuoi_Bi_Mat_Cuc_Ky_Dai_Va_Ba_Dao_Cua_Anh_Hehehehehe_Hehehehehehe_Hehehehehehehe_Hehehehehehehe")),
            ValidateIssuer = false,
            ValidateAudience = false,
            ClockSkew = TimeSpan.Zero
        };
    });

// --- 2. CẤU HÌNH CONTROLLERS & JSON ---
builder.Services.AddControllers()
    .AddNewtonsoftJson(options =>
    {
        options.SerializerSettings.ReferenceLoopHandling = ReferenceLoopHandling.Ignore;
        options.SerializerSettings.NullValueHandling = NullValueHandling.Include;
        options.SerializerSettings.ContractResolver = new Newtonsoft.Json.Serialization.CamelCasePropertyNamesContractResolver();
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// --- 3. DATABASE ---
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// --- 4. SERVICES ---
builder.Services.AddScoped<ISystemConfigService, SystemConfigService>();
builder.Services.AddHttpClient<GroqService>();

// --- 5. CẤU HÌNH CORS (THOÁNG HƠN ĐỂ TRÁNH LỖI CẤU HÌNH) ---
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
        policy.AllowAnyOrigin()    // Chấp nhận mọi nguồn (Giải quyết triệt để CORS)
              .AllowAnyMethod()    // Chấp nhận mọi phương thức (GET, POST, PUT, DELETE)
              .AllowAnyHeader());  // Chấp nhận mọi header
});

builder.Services.AddRouting(options => options.LowercaseUrls = true);

var app = builder.Build();

// --- 6. MIDDLEWARE (THỨ TỰ QUAN TRỌNG) ---
app.UseStaticFiles();

// Bật Swagger
app.UseSwagger();
app.UseSwaggerUI(c => { c.SwaggerEndpoint("/swagger/v1/swagger.json", "Hanyu API V1"); });

app.UseRouting();

// Áp dụng CORS "AllowAll" cho mọi môi trường (Đơn giản hóa để không bị chặn)
app.UseCors("AllowAll");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();


// Thêm vào Program.cs trước dòng app.Run();
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    // Lệnh này đảm bảo tạo cơ sở dữ liệu và các bảng nếu chưa tồn tại
    dbContext.Database.EnsureCreated(); 
}

app.Run();