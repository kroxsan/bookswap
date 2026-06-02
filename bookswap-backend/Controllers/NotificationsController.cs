// Bildirim endpoint'leri — Hafta 7
// GET    /api/notifications           → benim tüm bildirimlerim
// GET    /api/notifications/unread    → okunmamış bildirim sayısı
// PUT    /api/notifications/{id}/read → tek bildirimi okundu yap
// PUT    /api/notifications/read-all  → tüm bildirimleri okundu yap

using BookSwap.API.Data;
using BookSwap.API.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace BookSwap.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class NotificationsController : ControllerBase
{
    private readonly AppDbContext _context;

    public NotificationsController(AppDbContext context)
    {
        _context = context;
    }

    // GET /api/notifications — tüm bildirimler (en yeni önce)
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var notifications = await _context.Notifications
            .Where(n => n.UserId == userId)
            .OrderByDescending(n => n.CreatedAt)
            .Select(n => new NotificationResponseDto
            {
                Id        = n.Id,
                Title     = n.Title,
                Message   = n.Message,
                Type      = n.Type,
                OfferId   = n.OfferId,
                IsRead    = n.IsRead,
                CreatedAt = n.CreatedAt
            })
            .ToListAsync();

        return Ok(notifications);
    }

    // GET /api/notifications/unread — okunmamış bildirim sayısı
    [HttpGet("unread")]
    public async Task<IActionResult> GetUnreadCount()
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var count = await _context.Notifications
            .CountAsync(n => n.UserId == userId && !n.IsRead);

        return Ok(new { count });
    }

    // PUT /api/notifications/{id}/read — tek bildirimi okundu işaretle
    [HttpPut("{id}/read")]
    public async Task<IActionResult> MarkRead(int id)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var notification = await _context.Notifications
            .FirstOrDefaultAsync(n => n.Id == id && n.UserId == userId);

        if (notification == null)
            return NotFound(new { message = "Bildirim bulunamadı." });

        notification.IsRead = true;
        await _context.SaveChangesAsync();

        return Ok(new { message = "Bildirim okundu olarak işaretlendi." });
    }

    // PUT /api/notifications/read-all — tüm bildirimleri okundu yap
    [HttpPut("read-all")]
    public async Task<IActionResult> MarkAllRead()
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var unread = await _context.Notifications
            .Where(n => n.UserId == userId && !n.IsRead)
            .ToListAsync();

        unread.ForEach(n => n.IsRead = true);
        await _context.SaveChangesAsync();

        return Ok(new { message = $"{unread.Count} bildirim okundu olarak işaretlendi." });
    }
}
