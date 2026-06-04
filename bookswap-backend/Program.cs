// BookSwap - Kampüs İkinci El Kitap Takas Platformu
// Program.cs — Hafta 8: Reviews tablosu + status migration

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

// CORS - Android emülatörden ve gerçek cihazdan gelen isteklere izin ver
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// Hem localhost hem de dış IP üzerinden dinle
builder.WebHost.UseUrls("http://0.0.0.0:5000");

var app = builder.Build();

// Veritabanını otomatik oluştur / güncelle
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

    // Veritabanı yoksa sıfırdan oluştur
    db.Database.EnsureCreated();

    // Books tablosu yoksa elle oluştur
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

    // Offers tablosu yoksa oluştur
    db.Database.ExecuteSqlRaw(@"
        IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Offers')
        BEGIN
            CREATE TABLE Offers (
                Id INT IDENTITY(1,1) PRIMARY KEY,
                SenderId INT NOT NULL,
                ReceiverId INT NOT NULL,
                RequestedBookId INT NOT NULL,
                OfferedBookId INT NOT NULL,
                Status NVARCHAR(50) NOT NULL DEFAULT 'Bekliyor',
                CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
                CONSTRAINT FK_Offers_Sender FOREIGN KEY (SenderId)
                    REFERENCES Users(Id),
                CONSTRAINT FK_Offers_Receiver FOREIGN KEY (ReceiverId)
                    REFERENCES Users(Id),
                CONSTRAINT FK_Offers_RequestedBook FOREIGN KEY (RequestedBookId)
                    REFERENCES Books(Id),
                CONSTRAINT FK_Offers_OfferedBook FOREIGN KEY (OfferedBookId)
                    REFERENCES Books(Id)
            )
        END
    ");

    // Hafta 7 — Notifications tablosu
    db.Database.ExecuteSqlRaw(@"
        IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Notifications')
        BEGIN
            CREATE TABLE Notifications (
                Id INT IDENTITY(1,1) PRIMARY KEY,
                UserId INT NOT NULL,
                Title NVARCHAR(200) NOT NULL,
                Message NVARCHAR(500) NOT NULL,
                Type NVARCHAR(50) NOT NULL,
                OfferId INT NULL,
                IsRead BIT NOT NULL DEFAULT 0,
                CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
                CONSTRAINT FK_Notifications_Users FOREIGN KEY (UserId)
                    REFERENCES Users(Id) ON DELETE CASCADE
            )
        END
    ");

    // Hafta 8 — Reviews tablosu
    db.Database.ExecuteSqlRaw(@"
        IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Reviews')
        BEGIN
            CREATE TABLE Reviews (
                Id INT IDENTITY(1,1) PRIMARY KEY,
                ReviewerId INT NOT NULL,
                ReviewedUserId INT NOT NULL,
                OfferId INT NOT NULL,
                Rating INT NOT NULL,
                Comment NVARCHAR(500) NULL,
                CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
                CONSTRAINT FK_Reviews_Reviewer FOREIGN KEY (ReviewerId)
                    REFERENCES Users(Id),
                CONSTRAINT FK_Reviews_ReviewedUser FOREIGN KEY (ReviewedUserId)
                    REFERENCES Users(Id),
                CONSTRAINT FK_Reviews_Offer FOREIGN KEY (OfferId)
                    REFERENCES Offers(Id),
                CONSTRAINT UQ_Reviews_ReviewerOffer UNIQUE (ReviewerId, OfferId)
            )
        END
    ");

    // Hafta 8 — Eski status string'lerini kısa forma migrate et
    // "Kabul Edildi" -> "Kabul" | "Reddedildi" -> "Red"
    db.Database.ExecuteSqlRaw(@"
        UPDATE Offers SET Status = 'Kabul' WHERE Status = 'Kabul Edildi';
        UPDATE Offers SET Status = 'Red'   WHERE Status = 'Reddedildi';
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
    version = "0.8.0",
    status = "running",
    hafta = 8
});

app.Run();
