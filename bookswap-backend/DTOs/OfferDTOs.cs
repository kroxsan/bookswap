// Teklif işlemleri için veri transfer nesneleri

namespace BookSwap.API.DTOs;

// Teklif gönderirken istemciden gelecek veri
public class CreateOfferDto
{
    public int RequestedBookId { get; set; }   // İstenen kitap (ilan sahibinin kitabı)
    public int OfferedBookId { get; set; }      // Teklif edilen kitap (gönderenin kitabı)
}

// API'den dönecek teklif verisi
public class OfferResponseDto
{
    public int Id { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }

    public int SenderId { get; set; }
    public string SenderName { get; set; } = string.Empty;

    public int ReceiverId { get; set; }
    public string ReceiverName { get; set; } = string.Empty;

    public int RequestedBookId { get; set; }
    public string RequestedBookTitle { get; set; } = string.Empty;

    public int OfferedBookId { get; set; }
    public string OfferedBookTitle { get; set; } = string.Empty;
}
