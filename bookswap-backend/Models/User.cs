// Kullanıcı modeli — Hafta 9: SwapCount eklendi

namespace BookSwap.API.Models;

public class User
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public int SwapCount { get; set; } = 0;  // Hafta 9: tamamlanan takas sayısı
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
