// Kitap modeli

namespace BookSwap.API.Models;

public class Book
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Author { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Condition { get; set; } = string.Empty; // Yeni, İyi, Orta, Yıpranmış
    public string? Description { get; set; }
    public string Status { get; set; } = "Aktif"; // Aktif, Takaslandı
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Foreign key
    public int UserId { get; set; }
    public User User { get; set; } = null!;
}
