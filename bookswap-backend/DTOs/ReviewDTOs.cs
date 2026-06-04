// Puanlama ve yorum DTO'ları — Hafta 8

namespace BookSwap.API.DTOs;

public class CreateReviewDto
{
    public int OfferId { get; set; }
    public int ReviewedUserId { get; set; }
    public int Rating { get; set; }
    public string? Comment { get; set; }
}

public class ReviewResponseDto
{
    public int Id { get; set; }
    public int ReviewerId { get; set; }
    public string ReviewerName { get; set; } = string.Empty;
    public int ReviewedUserId { get; set; }
    public int OfferId { get; set; }
    public int Rating { get; set; }
    public string? Comment { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class UserRatingDto
{
    public int UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public double AverageRating { get; set; }
    public int TotalReviews { get; set; }
    public List<ReviewResponseDto> Reviews { get; set; } = new();
}
