// BookSwap - Kampüs İkinci El Kitap Takas Platformu
// Program.cs - Hafta 4: Books tablosu eklendi

using BookSwap.API.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// MSSQL bağlantısı
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// JWT kimlik doğrulama
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!))
        };
    });

// CORS - Android emülatörden gelen isteklere izin ver (10.0.2.2)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

// Veritabanını otomatik oluştur / güncelle
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

    // Veritabanı yoksa sıfırdan oluştur
    db.Database.EnsureCreated();

    // Books tablosu yoksa elle oluştur (EnsureCreated mevcut DB'ye yeni tablo eklemez)
    db.Database.ExecuteSqlRaw(@"
        IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Books')
        BEGIN
            CREATE TABLE Books (
                Id INT IDENTITY(1,1) PRIMARY KEY,
                Title NVARCHAR(200) NOT NULL,
                Author NVARCHAR(200) NOT NULL,
                Category NVARCHAR(100) NOT NULL,
                Condition NVARCHAR(50) NOT NULL,
                Description NVARCHAR(MAX) NULL,
                Status NVARCHAR(50) NOT NULL DEFAULT 'Aktif',
                CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
                UserId INT NOT NULL,
                CONSTRAINT FK_Books_Users FOREIGN KEY (UserId)
                    REFERENCES Users(Id) ON DELETE CASCADE
            )
        END
    ");
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowAll");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.MapGet("/", () => new
{
    app = "BookSwap API",
    version = "0.4.0",
    status = "running",
    hafta = 4
});

app.Run();
