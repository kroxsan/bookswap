// Takas teklifi modeli

namespace BookSwap.API.Models;

public class Offer
{
    public int Id { get; set; }

    // Teklifi gönderen kullanıcı
    public int SenderId { get; set; }
    public User Sender { get; set; } = null!;

    // Teklifi alan kullanıcı (ilan sahibi)
    public int ReceiverId { get; set; }
    public User Receiver { get; set; } = null!;

    // İstenen kitap (alıcının ilanı)
    public int RequestedBookId { get; set; }
    public Book RequestedBook { get; set; } = null!;

    // Teklif edilen kitap (gönderenin kitabı)
    public int OfferedBookId { get; set; }
    public Book OfferedBook { get; set; } = null!;

    // Bekliyor, Kabul Edildi, Reddedildi
    public string Status { get; set; } = "Bekliyor";

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
