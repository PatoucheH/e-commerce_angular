using System.Security.Claims;
using backend_api.Models.DTOs.Cart;
using backend_api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace backend_api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize] // 🔐 Tous les endpoints nécessitent un utilisateur connecté
public class CartController : ControllerBase
{
    private readonly ICartService _cartService;

    public CartController(ICartService cartService)
    {
        _cartService = cartService;
    }

    // Récupérer le panier de l'utilisateur connecté
    [HttpGet]
    public async Task<ActionResult<CartDto>> GetCart()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
            return Unauthorized(new { success = false, message = "Not authenticated" });

        var cart = await _cartService.GetOrCreateCart(userId);
        return Ok(cart);
    }

    // Ajouter un produit au panier
    [HttpPost("items")]
    public async Task<ActionResult> AddItemToCart([FromQuery] string productName, [FromQuery] int productId, [FromQuery] int quantity)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
            return Unauthorized(new { success = false, message = "Not authenticated" });

        await _cartService.AddItem(userId, productName, productId, quantity);
        var updatedCart = await _cartService.GetOrCreateCart(userId);

        return Ok(updatedCart);
    }

    // Supprimer un produit du panier
    [HttpDelete("items/{productId}")]
    public async Task<ActionResult> RemoveItem(int productId)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
            return Unauthorized(new { success = false, message = "Not authenticated" });

        await _cartService.RemoveItem(userId, productId);
        var updatedCart = await _cartService.GetOrCreateCart(userId);

        return Ok(updatedCart);
    }
}
