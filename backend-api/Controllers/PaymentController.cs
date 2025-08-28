using backend_api.Models.DTOs.Order;
using Microsoft.AspNetCore.Mvc;
using Stripe;
using Stripe.Checkout;

namespace backend_api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PaymentController :ControllerBase
    {
        private readonly IConfiguration _config;

        public PaymentController(IConfiguration config)
        {
            _config = config;
        }


        [HttpPost("create-checkout-session")]
        public ActionResult CreateCheckoutSession([FromBody] OrderDto order)
        {
            var domain = "http://localhost:4200";
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
                Mode = "Payment",
                SuccessUrl = domain + "/success",
                CancelUrl = domain + "/cancel",
            };

            var service = new SessionService();
            Session session = service.Create(options);

            return Ok(new { sessionId = session.Id });
        }

    }
}
