// Takas teklifi endpoint'leri — Hafta 8
//
// POST   /api/offers              - teklif gönder  (+bildirim)
// GET    /api/offers/incoming     - gelen teklifler
// GET    /api/offers/outgoing     - giden teklifler
// PUT    /api/offers/{id}/accept  - kabul et        (+bildirim)
// PUT    /api/offers/{id}/reject  - reddet           (+bildirim)
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
public class OffersController : ControllerBase
{
    private readonly AppDbContext _context;

    public OffersController(AppDbContext context)
    {
        _context = context;
    }

    // POST /api/offers — teklif gönder
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateOfferDto dto)
    {
        var senderId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var senderName = User.FindFirstValue(ClaimTypes.Name)!;

        var requestedBook = await _context.Books
            .Include(b => b.User)
            .FirstOrDefaultAsync(b => b.Id == dto.RequestedBookId);

        if (requestedBook == null)
            return NotFound(new { message = "İstenen kitap bulunamadı." });

        if (requestedBook.UserId == senderId)
            return BadRequest(new { message = "Kendi ilanına teklif gönderemezsin." });

        var offeredBook = await _context.Books
            .FirstOrDefaultAsync(b => b.Id == dto.OfferedBookId && b.UserId == senderId);
        if (offeredBook == null)
            return BadRequest(new { message = "Teklif ettiğin kitap sana ait değil veya bulunamadı." });

        var existing = await _context.Offers
            .FirstOrDefaultAsync(o =>
                o.SenderId == senderId &&
                o.RequestedBookId == dto.RequestedBookId &&
                o.Status == "Bekliyor");
        if (existing != null)
            return BadRequest(new { message = "Bu ilan için zaten bekleyen bir teklif var." });

        var offer = new Offer
        {
            SenderId        = senderId,
            ReceiverId      = requestedBook.UserId,
            RequestedBookId = dto.RequestedBookId,
            OfferedBookId   = dto.OfferedBookId
        };

        _context.Offers.Add(offer);

        var notification = new Notification
        {
            UserId  = requestedBook.UserId,
            Title   = "Yeni Takas Teklifi 🔄",
            Message = $"{senderName}, \"{requestedBook.Title}\" ilanın için takas teklifi gönderdi.",
            Type    = "TeklifAlindi",
            OfferId = 0
        };
        _context.Notifications.Add(notification);

        await _context.SaveChangesAsync();

        notification.OfferId = offer.Id;
        await _context.SaveChangesAsync();

        await _context.Entry(offer).Reference(o => o.Sender).LoadAsync();
        await _context.Entry(offer).Reference(o => o.Receiver).LoadAsync();
        await _context.Entry(offer).Reference(o => o.RequestedBook).LoadAsync();
        await _context.Entry(offer).Reference(o => o.OfferedBook).LoadAsync();

        return Ok(MapToDto(offer));
    }

    // GET /api/offers/incoming — bana gelen teklifler
    [HttpGet("incoming")]
    public async Task<IActionResult> GetIncoming()
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var offers = await _context.Offers
            .Include(o => o.Sender)
            .Include(o => o.Receiver)
            .Include(o => o.RequestedBook)
            .Include(o => o.OfferedBook)
            .Where(o => o.ReceiverId == userId)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync();

        return Ok(offers.Select(MapToDto));
    }

    // GET /api/offers/outgoing — benim gönderdiğim teklifler
    [HttpGet("outgoing")]
    public async Task<IActionResult> GetOutgoing()
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var offers = await _context.Offers
            .Include(o => o.Sender)
            .Include(o => o.Receiver)
            .Include(o => o.RequestedBook)
            .Include(o => o.OfferedBook)
            .Where(o => o.SenderId == userId)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync();

        return Ok(offers.Select(MapToDto));
    }

    // PUT /api/offers/{id}/accept — teklifi kabul et
    [HttpPut("{id}/accept")]
    public async Task<IActionResult> Accept(int id)
    {
        var userId   = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var userName = User.FindFirstValue(ClaimTypes.Name)!;

        var offer = await _context.Offers
            .Include(o => o.RequestedBook)
            .Include(o => o.OfferedBook)
            .FirstOrDefaultAsync(o => o.Id == id);

        if (offer == null) return NotFound(new { message = "Teklif bulunamadı." });
        if (offer.ReceiverId != userId) return Forbid();
        if (offer.Status != "Bekliyor")
            return BadRequest(new { message = "Bu teklif zaten yanıtlanmış." });

        offer.Status = "Kabul";

        _context.Notifications.Add(new Notification
        {
            UserId  = offer.SenderId,
            Title   = "Teklifin Kabul Edildi ✅",
            Message = $"{userName}, \"{offer.RequestedBook.Title}\" için teklifini kabul etti!",
            Type    = "TeklifKabul",
            OfferId = offer.Id
        });

        await _context.SaveChangesAsync();
        return Ok(new { message = "Teklif kabul edildi.", offerId = id });
    }

    // PUT /api/offers/{id}/reject — teklifi reddet
    [HttpPut("{id}/reject")]
    public async Task<IActionResult> Reject(int id)
    {
        var userId   = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var userName = User.FindFirstValue(ClaimTypes.Name)!;

        var offer = await _context.Offers
            .Include(o => o.RequestedBook)
            .FirstOrDefaultAsync(o => o.Id == id);

        if (offer == null) return NotFound(new { message = "Teklif bulunamadı." });
        if (offer.ReceiverId != userId) return Forbid();
        if (offer.Status != "Bekliyor")
            return BadRequest(new { message = "Bu teklif zaten yanıtlanmış." });

        offer.Status = "Red";

        _context.Notifications.Add(new Notification
        {
            UserId  = offer.SenderId,
            Title   = "Teklifin Reddedildi ❌",
            Message = $"{userName}, \"{offer.RequestedBook.Title}\" için teklifini reddetti.",
            Type    = "TeklifRed",
            OfferId = offer.Id
        });

        await _context.SaveChangesAsync();
        return Ok(new { message = "Teklif reddedildi.", offerId = id });
    }

    // yardımcı: Offer → OfferResponseDto
    private static OfferResponseDto MapToDto(Offer o) => new()
    {
        Id             = o.Id,
        Status         = o.Status,
        CreatedAt      = o.CreatedAt,
        SenderId       = o.SenderId,
        SenderName     = o.Sender.Name,
        ReceiverId     = o.ReceiverId,
        ReceiverName   = o.Receiver.Name,
        // RequestedBook = ilan sahibinin kitabı = frontend'de "targetBook"
        TargetBookId     = o.RequestedBookId,
        TargetBookTitle  = o.RequestedBook.Title,
        TargetBookAuthor = o.RequestedBook.Author,
        // OfferedBook = teklifi gönderenin kitabı
        OfferedBookId     = o.OfferedBookId,
        OfferedBookTitle  = o.OfferedBook.Title,
        OfferedBookAuthor = o.OfferedBook.Author,
    };
}
