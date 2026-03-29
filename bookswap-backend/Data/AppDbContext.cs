// BookSwap - Kampüs İkinci El Kitap Takas Platformu
// Data/AppDbContext.cs - Hafta 2: Veritabanı bağlamı

using BookSwap.API.Models;
using Microsoft.EntityFrameworkCore;

namespace BookSwap.API.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Email alanı benzersiz olmalı
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
    }
}
