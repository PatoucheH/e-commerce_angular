using backend_api.Models;
using backend_api.Models.DTOs;
using backend_api.Models.DTOs.Order;
using backend_api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace backend_api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class OrderController : ControllerBase
    {
        private readonly IOrderService _orderService;

        public OrderController(IOrderService orderService)
        {
            _orderService = orderService;
        }

        [HttpPost]
        public async Task<ActionResult> CreateOrder([FromBody] CreateOrderDto request)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(new { message = "Token invalide" });

            var order = await _orderService.CreateOrderFromCart(userId, request.ShippingAddress);
            return Ok(order);
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<OrderDto>>> GetUserOrders()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(new { message = "Token invalide" });

            var orders = await _orderService.GetUserOrders(userId);
            return Ok(orders);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult> GetOrderById(int id)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(new { message = "Token invalide" });

            var order = await _orderService.GetOrderById(id);

            if (order != null && order.UserId != userId)
                return Forbid("Accès non autorisé à cette commande");

            return Ok(order);
        }

        [HttpPost("{orderId}/status")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> ChangeStatus(int orderId, [FromBody] OrderStatus newStatus)
        {
            await _orderService.UpdateOrderByStatus(orderId, newStatus);
            return Ok(new { message = "Statut de la commande mis à jour" });
        }
    }
}