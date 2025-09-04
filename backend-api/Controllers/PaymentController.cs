using backend_api.Models.DTOs.Order;
using backend_api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Stripe;
using Stripe.Checkout;

namespace backend_api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PaymentController : ControllerBase
    {
        private readonly IConfiguration _config;
        private readonly AppDbContext _context;

        public PaymentController(IConfiguration config, AppDbContext context)
        {
            _config = config;
            _context = context;
        }

        [HttpGet("stripe-public-key")]
        public IActionResult GetStripePublicKey()
        {
            var publicKey = _config["STRIPE_PUBLISHABLE_KEY"];
            if (string.IsNullOrEmpty(publicKey))
                return BadRequest("Stripe public key not set");
            return Ok(new { key = publicKey });
        }

        [HttpPost("create-checkout-session")]
        public async Task<ActionResult> CreateCheckoutSession([FromBody] OrderDto orderDto)
        {
            if (orderDto?.Items == null || !orderDto.Items.Any())
                return BadRequest("No items in cart");

            if (string.IsNullOrEmpty(orderDto.UserId))
                return BadRequest("User ID is required");

            StripeConfiguration.ApiKey = _config["STRIPE_SECRET_KEY"];
            var domain = "http://localhost:4200";

            // 1️⃣ Créer la commande en base (Pending)
            var order = new Order
            {
                UserId = orderDto.UserId,
                CreatedAt = DateTime.UtcNow,
                Total = orderDto.Items.Sum(i => i.UnitPrice * i.Quantity),
                Status = OrderStatus.Pending,
                ShippingAddress = orderDto.ShippingAddress,
                Items = orderDto.Items.Select(i => new OrderItems
                {
                    ProductId = i.ProductId,
                    ProductName = i.ProductName,
                    Quantity = i.Quantity,
                    UnitPrice = i.UnitPrice
                }).ToList()
            };

            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            // 2️⃣ Créer la session Stripe
            var options = new SessionCreateOptions
            {
                PaymentMethodTypes = new List<string> { "card" },
                LineItems = order.Items.Select(item => new SessionLineItemOptions
                {
                    PriceData = new SessionLineItemPriceDataOptions
                    {
                        UnitAmount = (long)(item.UnitPrice * 100),
                        Currency = "eur",
                        ProductData = new SessionLineItemPriceDataProductDataOptions
                        {
                            Name = item.ProductName
                        }
                    },
                    Quantity = item.Quantity
                }).ToList(),
                Mode = "payment",
                SuccessUrl = domain + "/account",
                CancelUrl = domain + "/cart",
                Metadata = new Dictionary<string, string>
                {
                    ["orderId"] = order.Id.ToString()
                }
            };

            var service = new SessionService();
            var session = service.Create(options);

            Console.WriteLine($"✅ Stripe session created. OrderId={order.Id}, SessionId={session.Id}");

            return Ok(new { sessionId = session.Id });
        }
    }
}
