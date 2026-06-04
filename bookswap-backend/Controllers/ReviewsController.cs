// Puanlama ve yorum endpoint'leri — Hafta 8
//
// POST /api/reviews                      → puan ver
// GET  /api/reviews/user/{userId}        → kullanıcının aldığı puanlar + ortalama
// GET  /api/reviews/can-review/{offerId} → bu teklif için puan verebilir miyim?
//
// Status değerleri: "Bekliyor" | "Kabul" | "Red"

using BookSwap.API.Data;
using BookSwap.API.DTOs;
using BookSwap.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace BookSwap.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ReviewsController : ControllerBase
{
    private readonly AppDbContext _context;

    public ReviewsController(AppDbContext context)
    {
        _context = context;
    }

    // POST /api/reviews — puan ver
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateReviewDto dto)
    {
        var reviewerId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        if (dto.Rating < 1 || dto.Rating > 5)
            return BadRequest(new { message = "Puan 1 ile 5 arasında olmalıdır." });

        var offer = await _context.Offers.FirstOrDefaultAsync(o => o.Id == dto.OfferId);

        if (offer == null)
            return NotFound(new { message = "Teklif bulunamadı." });

        if (offer.Status != "Kabul")
            return BadRequest(new { message = "Sadece kabul edilmiş teklifler için puan verebilirsin." });

        bool isSender   = offer.SenderId   == reviewerId;
        bool isReceiver = offer.ReceiverId == reviewerId;

        if (!isSender && !isReceiver)
            return Forbid();

        bool reviewingReceiver = dto.ReviewedUserId == offer.ReceiverId;
        bool reviewingSender   = dto.ReviewedUserId == offer.SenderId;

        if (!reviewingReceiver && !reviewingSender)
            return BadRequest(new { message = "Sadece takas yaptığın kişiyi değerlendirebilirsin." });

        if (dto.ReviewedUserId == reviewerId)
            return BadRequest(new { message = "Kendini puanlayamazsın." });

        var alreadyReviewed = await _context.Reviews
            .AnyAsync(r => r.ReviewerId == reviewerId && r.OfferId == dto.OfferId);

        if (alreadyReviewed)
            return BadRequest(new { message = "Bu takas için zaten puan verdin." });

        var review = new Review
        {
            ReviewerId     = reviewerId,
            ReviewedUserId = dto.ReviewedUserId,
            OfferId        = dto.OfferId,
            Rating         = dto.Rating,
            Comment        = dto.Comment?.Trim()
        };

        _context.Reviews.Add(review);
        await _context.SaveChangesAsync();
        await _context.Entry(review).Reference(r => r.Reviewer).LoadAsync();

        return Ok(new ReviewResponseDto
        {
            Id             = review.Id,
            ReviewerId     = review.ReviewerId,
            ReviewerName   = review.Reviewer.Name,
            ReviewedUserId = review.ReviewedUserId,
            OfferId        = review.OfferId,
            Rating         = review.Rating,
            Comment        = review.Comment,
            CreatedAt      = review.CreatedAt
        });
    }

    // GET /api/reviews/user/{userId}
    [HttpGet("user/{userId}")]
    public async Task<IActionResult> GetUserReviews(int userId)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null)
            return NotFound(new { message = "Kullanıcı bulunamadı." });

        var reviews = await _context.Reviews
            .Include(r => r.Reviewer)
            .Where(r => r.ReviewedUserId == userId)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();

        var average = reviews.Count > 0
            ? Math.Round(reviews.Average(r => r.Rating), 1)
            : 0.0;

        return Ok(new UserRatingDto
        {
            UserId        = userId,
            UserName      = user.Name,
            AverageRating = average,
            TotalReviews  = reviews.Count,
            Reviews       = reviews.Select(r => new ReviewResponseDto
            {
                Id             = r.Id,
                ReviewerId     = r.ReviewerId,
                ReviewerName   = r.Reviewer.Name,
                ReviewedUserId = r.ReviewedUserId,
                OfferId        = r.OfferId,
                Rating         = r.Rating,
                Comment        = r.Comment,
                CreatedAt      = r.CreatedAt
            }).ToList()
        });
    }

    // GET /api/reviews/can-review/{offerId}
    [HttpGet("can-review/{offerId}")]
    public async Task<IActionResult> CanReview(int offerId)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var offer = await _context.Offers.FindAsync(offerId);

        if (offer == null || offer.Status != "Kabul")
            return Ok(new { canReview = false, targetUserId = (int?)null });

        bool isSender   = offer.SenderId   == userId;
        bool isReceiver = offer.ReceiverId == userId;

        if (!isSender && !isReceiver)
            return Ok(new { canReview = false, targetUserId = (int?)null });

        var alreadyReviewed = await _context.Reviews
            .AnyAsync(r => r.ReviewerId == userId && r.OfferId == offerId);

        if (alreadyReviewed)
            return Ok(new { canReview = false, targetUserId = (int?)null });

        var targetUserId = isSender ? offer.ReceiverId : offer.SenderId;

        return Ok(new { canReview = true, targetUserId });
    }
}
