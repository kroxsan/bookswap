// Bildirim modeli — Hafta 7
// Teklif gönderildiğinde, kabul/red edildiğinde otomatik oluşturulur

namespace BookSwap.API.Models;

public class Notification
{
    public int Id { get; set; }

    // Bildirimi alacak kullanıcı
    public int UserId { get; set; }
    public User User { get; set; } = null!;

    // Bildirim başlığı ve içeriği
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;

    // TeklifAlindi, TeklifKabul, TeklifRed
    public string Type { get; set; } = string.Empty;

    // İlgili teklif (opsiyonel)
    public int? OfferId { get; set; }

    // Okundu mu?
    public bool IsRead { get; set; } = false;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
