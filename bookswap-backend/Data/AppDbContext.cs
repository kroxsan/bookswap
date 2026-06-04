// Veritabanı bağlamı — Hafta 8: Reviews tablosu eklendi

using BookSwap.API.Models;
using Microsoft.EntityFrameworkCore;

namespace BookSwap.API.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users { get; set; }
    public DbSet<Book> Books { get; set; }
    public DbSet<Offer> Offers { get; set; }
    public DbSet<Notification> Notifications { get; set; }
    public DbSet<Review> Reviews { get; set; }  // Hafta 8

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        modelBuilder.Entity<User>()
            .Property(u => u.Email)
            .IsRequired()
            .HasMaxLength(200);

        modelBuilder.Entity<User>()
            .Property(u => u.Name)
            .IsRequired()
            .HasMaxLength(100);

        modelBuilder.Entity<Book>()
            .HasOne(b => b.User)
            .WithMany()
            .HasForeignKey(b => b.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Book>()
            .Property(b => b.Title)
            .IsRequired()
            .HasMaxLength(200);

        modelBuilder.Entity<Book>()
            .Property(b => b.Author)
            .IsRequired()
            .HasMaxLength(200);

        modelBuilder.Entity<Offer>()
            .HasOne(o => o.Sender)
            .WithMany()
            .HasForeignKey(o => o.SenderId)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<Offer>()
            .HasOne(o => o.Receiver)
            .WithMany()
            .HasForeignKey(o => o.ReceiverId)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<Offer>()
            .HasOne(o => o.RequestedBook)
            .WithMany()
            .HasForeignKey(o => o.RequestedBookId)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<Offer>()
            .HasOne(o => o.OfferedBook)
            .WithMany()
            .HasForeignKey(o => o.OfferedBookId)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<Notification>()
            .HasOne(n => n.User)
            .WithMany()
            .HasForeignKey(n => n.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        // Review ilişkileri — Hafta 8
        modelBuilder.Entity<Review>()
            .HasOne(r => r.Reviewer)
            .WithMany()
            .HasForeignKey(r => r.ReviewerId)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<Review>()
            .HasOne(r => r.ReviewedUser)
            .WithMany()
            .HasForeignKey(r => r.ReviewedUserId)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<Review>()
            .HasOne(r => r.Offer)
            .WithMany()
            .HasForeignKey(r => r.OfferId)
            .OnDelete(DeleteBehavior.NoAction);

        // Aynı teklif için aynı kişi iki kez puan veremesin
        modelBuilder.Entity<Review>()
            .HasIndex(r => new { r.ReviewerId, r.OfferId })
            .IsUnique();
    }
}
