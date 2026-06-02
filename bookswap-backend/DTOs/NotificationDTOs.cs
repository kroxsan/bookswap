// Bildirim DTO'ları — Hafta 7

namespace BookSwap.API.DTOs;

public class NotificationResponseDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public int? OfferId { get; set; }
    public bool IsRead { get; set; }
    public DateTime CreatedAt { get; set; }
}
