// BookSwap - Kampüs İkinci El Kitap Takas Platformu
// Program.cs — Hafta 9: SwapCount kolonu + Takaslandı migration

using BookSwap.API.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

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

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

builder.WebHost.UseUrls("http://0.0.0.0:5000");

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

    db.Database.EnsureCreated();

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

    db.Database.ExecuteSqlRaw(@"
        UPDATE Offers SET Status = 'Kabul' WHERE Status = 'Kabul Edildi';
        UPDATE Offers SET Status = 'Red'   WHERE Status = 'Reddedildi';
    ");

    db.Database.ExecuteSqlRaw(@"
        IF NOT EXISTS (
            SELECT * FROM sys.columns
            WHERE object_id = OBJECT_ID('Users') AND name = 'SwapCount'
        )
        BEGIN
            ALTER TABLE Users ADD SwapCount INT NOT NULL DEFAULT 0
        END
    ");

    // Hafta 9: Dynamic SQL ile kolon adını runtime'da kontrol et
    db.Database.ExecuteSqlRaw(@"
        IF EXISTS (
            SELECT * FROM sys.columns
            WHERE object_id = OBJECT_ID('Offers') AND name = 'RequestedBookId'
        )
        BEGIN
            EXEC sp_executesql N'
                UPDATE Books SET Status = N''Takaslandı''
                WHERE Id IN (
                    SELECT RequestedBookId FROM Offers WHERE Status = N''Kabul''
                    UNION
                    SELECT OfferedBookId FROM Offers WHERE Status = N''Kabul''
                )
                AND Status = N''Aktif''
            '
        END
    ");

    // Hafta 9: SwapCount backfill
    db.Database.ExecuteSqlRaw(@"
        UPDATE Users SET SwapCount = (
            SELECT COUNT(*) FROM Offers
            WHERE Status = N'Kabul'
              AND (SenderId = Users.Id OR ReceiverId = Users.Id)
        )
        WHERE SwapCount = 0
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
    version = "0.9.0",
    status = "running",
    hafta = 9
});

app.Run();
