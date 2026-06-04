// Puanlama ve yorum modeli — Hafta 8
// Kabul edilmiş bir takas sonrası her iki taraf da birbirini puanlayabilir.

namespace BookSwap.API.Models;

public class Review
{
    public int Id { get; set; }

    // Puan veren kullanıcı
    public int ReviewerId { get; set; }
    public User Reviewer { get; set; } = null!;

    // Puan alan kullanıcı
    public int ReviewedUserId { get; set; }
    public User ReviewedUser { get; set; } = null!;

    // Hangi teklif üzerinden yapıldı (her teklif için en fazla 1 puan)
    public int OfferId { get; set; }
    public Offer Offer { get; set; } = null!;

    // 1-5 arası tam sayı puan
    public int Rating { get; set; }

    // İsteğe bağlı yorum metni
    public string? Comment { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
