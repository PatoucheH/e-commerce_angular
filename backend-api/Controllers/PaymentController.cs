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
            if (orderDto?.ItemList == null || !orderDto.ItemList.Any())
                return BadRequest("No items in cart");

            if (string.IsNullOrEmpty(orderDto.UserId))
                return BadRequest("User ID is required");

            StripeConfiguration.ApiKey = _config["STRIPE_SECRET_KEY"];
            var domain = "http://localhost:4200";

            // Créer la commande en base (Pending)
            var order = new Order
            {
                UserId = orderDto.UserId,
                CreatedAt = DateTime.UtcNow,
                Total = orderDto.ItemList.Sum(i => i.UnitPrice * i.Quantity),
                Status = OrderStatus.Pending,
                ShippingAddress = orderDto.ShippingAddress,
                Items = orderDto.ItemList.Select(i => new OrderItems
                {
                    ProductId = i.ProductId,
                    ProductName = i.ProductName,
                    Quantity = i.Quantity,
                    UnitPrice = i.UnitPrice
                }).ToList()
            };

            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            // Créer la session Stripe
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

            Console.WriteLine($"Stripe session created. OrderId={order.Id}, SessionId={session.Id}");

            return Ok(new { sessionId = session.Id });
        }

        [HttpPost("stripe-webhook")]
        public async Task<IActionResult> StripeWebhook()
        {
            Console.WriteLine($" DEBUT WEBHOOK");

            var json = await new StreamReader(HttpContext.Request.Body).ReadToEndAsync();

            try
            {
                var stripeEvent = EventUtility.ConstructEvent(
                    json,
                    Request.Headers["Stripe-Signature"],
                    _config["STRIPE_WEBHOOK_SECRET"]
                );

                Console.WriteLine($" Webhook reçu: {stripeEvent.Type}");

                if (stripeEvent.Type == "checkout.session.completed")
                {
                    Console.WriteLine($" Session completed reçue");

                    var session = stripeEvent.Data.Object as Session;
                    var orderIdStr = session?.Metadata?["orderId"];

                    Console.WriteLine($" OrderId extrait: {orderIdStr}");

                    if (int.TryParse(orderIdStr, out var orderId))
                    {
                        Console.WriteLine($" Traitement commande {orderId}");

                        // Étape 1: Mettre à jour la commande
                        var order = await _context.Orders.FindAsync(orderId);
                        if (order != null)
                        {
                            order.Status = OrderStatus.Confirmed;
                            order.UpdatedAt = DateTime.UtcNow;
                            order.StripeSessionId = session!.Id;
                            order.StripePaymentIntentId = session.PaymentIntentId;
                            await _context.SaveChangesAsync();
                            Console.WriteLine($" Commande {orderId} confirmée");

                            // Étape 2: Vider le panier (nouvelle transaction)
                            Console.WriteLine($" Début vidage panier pour {order.UserId}");

                            var cart = await _context.Carts
                                .Include(c => c.ItemList)
                                .FirstOrDefaultAsync(c => c.UserId == order.UserId);

                            if (cart != null && cart.ItemList.Any())
                            {
                                Console.WriteLine($" Suppression de {cart.ItemList.Count} items");
                                _context.CartItems.RemoveRange(cart.ItemList);
                                await _context.SaveChangesAsync();
                                Console.WriteLine($" Panier vidé");
                            }
                            else
                            {
                                Console.WriteLine($" Panier non trouvé ou vide");
                            }
                        }
                    }
                }

                Console.WriteLine($" FIN WEBHOOK");
                return Ok();
            }
            catch (Exception e)
            {
                Console.WriteLine($" ERREUR WEBHOOK: {e.Message}");
                return StatusCode(500, e.Message);
            }
        }
    }
}