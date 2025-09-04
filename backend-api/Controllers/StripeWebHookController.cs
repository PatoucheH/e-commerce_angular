using Microsoft.AspNetCore.Mvc;
using Stripe;
using Stripe.Checkout;
using backend_api.Models.DTOs.Order;

namespace backend_api.Controllers;


[ApiController]
[Route("api/[controller]")]
public class StripeWebhookController : ControllerBase
{
    private readonly IConfiguration _config;

    public StripeWebhookController(IConfiguration config)
    {
        _config = config;
    }

    [HttpPost]
    public async Task<IActionResult> Webhook()
    {
        var json = await new StreamReader(HttpContext.Request.Body).ReadToEndAsync();
        var stripeEvent = EventUtility.ConstructEvent(
            json,
            Request.Headers["Stripe-Signature"],
            _config["STRIPE_WEBHOOK_SECRET"]
        );

        if (stripeEvent.Type == "checkout.session.completed")
        {
            var session = stripeEvent.Data.Object as Session;

            // Créer la commande dans ta base ici
        }



        return Ok();
    }
}
