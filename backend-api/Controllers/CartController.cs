using System;
using backend_api.Models.DTOs.Cart;
using backend_api.Services;
using Microsoft.AspNetCore.Mvc;

namespace backend_api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CartController : ControllerBase
{
    public ICartService _cartService;

    public CartController(ICartService cartService)
    {
        _cartService = cartService;
    }

    [HttpGet("{userId}")]
    public async Task<ActionResult<CartDto>> GetCart(string userId)
    {
        var cart = await _cartService.GetOrCreateCart(userId);
        return Ok(cart);
    }


    [HttpPost("{userId}/items")]
    public async Task<ActionResult> AddItemToCart(string userId, [FromQuery] int productId, [FromQuery] int quantity)
    {
        await _cartService.AddItem(userId, productId, quantity);
        return Ok();
    }

    [HttpDelete("{userId}/items/{productId}")]
    public async Task<ActionResult> RemoveItem(string userId, int productId)
    {
        await _cartService.RemoveItem(userId, productId);
        return Ok();
    }

}
