// Kitap ekleme, listeleme ve silme endpoint'leri

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
public class BooksController : ControllerBase
{
    private readonly AppDbContext _context;

    public BooksController(AppDbContext context)
    {
        _context = context;
    }

    // tüm aktif ilanlar
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var books = await _context.Books
            .Include(b => b.User)
            .Where(b => b.Status == "Aktif")
            .OrderByDescending(b => b.CreatedAt)
            .Select(b => new BookResponseDto
            {
                Id = b.Id,
                Title = b.Title,
                Author = b.Author,
                Category = b.Category,
                Condition = b.Condition,
                Description = b.Description,
                Status = b.Status,
                CreatedAt = b.CreatedAt,
                UserId = b.UserId,
                UserName = b.User.Name
            })
            .ToListAsync();

        return Ok(books);
    }

    // giriş yapan kullanıcının kendi ilanları
    [HttpGet("my")]
    public async Task<IActionResult> GetMyBooks()
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var books = await _context.Books
            .Include(b => b.User)
            .Where(b => b.UserId == userId)
            .OrderByDescending(b => b.CreatedAt)
            .Select(b => new BookResponseDto
            {
                Id = b.Id,
                Title = b.Title,
                Author = b.Author,
                Category = b.Category,
                Condition = b.Condition,
                Description = b.Description,
                Status = b.Status,
                CreatedAt = b.CreatedAt,
                UserId = b.UserId,
                UserName = b.User.Name
            })
            .ToListAsync();

        return Ok(books);
    }

    // tekil kitap detayı id ile
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var book = await _context.Books
            .Include(b => b.User)
            .Where(b => b.Id == id)
            .Select(b => new BookResponseDto
            {
                Id = b.Id,
                Title = b.Title,
                Author = b.Author,
                Category = b.Category,
                Condition = b.Condition,
                Description = b.Description,
                Status = b.Status,
                CreatedAt = b.CreatedAt,
                UserId = b.UserId,
                UserName = b.User.Name
            })
            .FirstOrDefaultAsync();

        if (book == null) return NotFound(new { message = "Kitap bulunamadı." });

        return Ok(book);
    }

    // yeni ilan ekle
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateBookDto dto)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var book = new Book
        {
            Title = dto.Title,
            Author = dto.Author,
            Category = dto.Category,
            Condition = dto.Condition,
            Description = dto.Description,
            UserId = userId
        };

        _context.Books.Add(book);
        await _context.SaveChangesAsync();

        await _context.Entry(book).Reference(b => b.User).LoadAsync();

        return Ok(new BookResponseDto
        {
            Id = book.Id,
            Title = book.Title,
            Author = book.Author,
            Category = book.Category,
            Condition = book.Condition,
            Description = book.Description,
            Status = book.Status,
            CreatedAt = book.CreatedAt,
            UserId = book.UserId,
            UserName = book.User.Name
        });
    }

    //  kendi ilanını sil id ile
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var book = await _context.Books.FindAsync(id);

        if (book == null) return NotFound(new { message = "Kitap bulunamadı." });
        if (book.UserId != userId) return Forbid();

        _context.Books.Remove(book);
        await _context.SaveChangesAsync();

        return Ok(new { message = "İlan silindi." });
    }
}
