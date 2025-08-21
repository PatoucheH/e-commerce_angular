using backend_api.Models;
using backend_api.Models.DTOs;
using backend_api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend_api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
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
            var userId = User?.Identity?.Name;
            if (userId is null)
                return NotFound("User not found");
            var order = await _orderService.CreateOrderFromCart(userId, request.ShippingAddress);
            return Ok(order);
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<OrderDto>>> GetUserOrders()
        {
            var userId = User?.Identity?.Name;
            if (userId is null)
                return NotFound("User not found");
            var orders = await _orderService.GetUserOrders(userId);
            return Ok(orders); 
        }

        [HttpGet("{id}")]
        public async Task<ActionResult> GetOrderById(int orderId)
        {
            var order = await _orderService.GetOrderById(orderId);
            return Ok(order);
        }


        [HttpPost("{orderId}/status")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> ChangeStatus(int orderId, OrderStatus newStatus)
        {
            await _orderService.UpdateOrderByStatus(orderId, newStatus);
            return Ok();
        }
    }
}
