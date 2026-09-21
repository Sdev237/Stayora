using AirbnbClone.Api.Data;
using AirbnbClone.Api.Models;
using HotChocolate.Subscriptions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Stripe;

namespace AirbnbClone.Api.Controllers;

[ApiController]
[Route("api/webhooks/stripe")]
public class StripeWebhookController : ControllerBase
{
    private readonly IDbContextFactory<AppDbContext> _dbContextFactory;
    private readonly ITopicEventSender _eventSender;
    private readonly IConfiguration _configuration;
    private readonly ILogger<StripeWebhookController> _logger;

    public StripeWebhookController(
        IDbContextFactory<AppDbContext> dbContextFactory,
        ITopicEventSender eventSender,
        IConfiguration configuration,
        ILogger<StripeWebhookController> logger)
    {
        _dbContextFactory = dbContextFactory;
        _eventSender = eventSender;
        _configuration = configuration;
        _logger = logger;
    }

    [HttpPost]
    public async Task<IActionResult> HandleWebhook()
    {
        var json = await new StreamReader(HttpContext.Request.Body).ReadToEndAsync();
        var webhookSecret = _configuration["Stripe:WebhookSecret"];

        string eventType = string.Empty;
        string paymentIntentId = string.Empty;
        var metadata = new Dictionary<string, string>();

        try
        {
            if (!string.IsNullOrEmpty(webhookSecret) && !webhookSecret.StartsWith("whsec_placeholder"))
            {
                var signature = Request.Headers["Stripe-Signature"];
                var stripeEvent = EventUtility.ConstructEvent(json, signature, webhookSecret);
                eventType = stripeEvent.Type;
                if (stripeEvent.Data.Object is PaymentIntent pi)
                {
                    paymentIntentId = pi.Id;
                    metadata = pi.Metadata ?? new Dictionary<string, string>();
                }
            }
            else
            {
                using var doc = System.Text.Json.JsonDocument.Parse(json);
                var root = doc.RootElement;
                if (root.TryGetProperty("type", out var typeProp))
                {
                    eventType = typeProp.GetString() ?? "";
                }
                if (root.TryGetProperty("data", out var dataProp) &&
                    dataProp.TryGetProperty("object", out var objProp))
                {
                    if (objProp.TryGetProperty("id", out var idProp))
                    {
                        paymentIntentId = idProp.GetString() ?? "";
                    }
                    if (objProp.TryGetProperty("metadata", out var metaProp) && metaProp.ValueKind == System.Text.Json.JsonValueKind.Object)
                    {
                        foreach (var prop in metaProp.EnumerateObject())
                        {
                            metadata[prop.Name] = prop.Value.GetString() ?? "";
                        }
                    }
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Stripe webhook signature verification failed.");
            return BadRequest(new { error = "Webhook verification failed." });
        }

        if (eventType == "payment_intent.succeeded")
        {
            await ProcessConfirmedPayment(paymentIntentId, metadata);
        }

        return Ok(new { received = true });
    }

    private async Task ProcessConfirmedPayment(string paymentIntentId, Dictionary<string, string>? metadata)
    {
        await using var context = await _dbContextFactory.CreateDbContextAsync();

        Booking? booking = null;

        if (metadata != null && metadata.TryGetValue("bookingId", out var bookingIdStr) && Guid.TryParse(bookingIdStr, out var bookingId))
        {
            booking = await context.Bookings
                .Include(b => b.Listing)
                .Include(b => b.User)
                .FirstOrDefaultAsync(b => b.Id == bookingId);
        }

        if (booking == null)
        {
            booking = await context.Bookings
                .Include(b => b.Listing)
                .Include(b => b.User)
                .FirstOrDefaultAsync(b => b.StripePaymentIntentId == paymentIntentId);
        }

        if (booking != null)
        {
            // Payment pre-authorized: status remains Pending until host explicitly accepts and confirms
            booking.Status = "Pending";
            await context.SaveChangesAsync();

            _logger.LogInformation("Booking {BookingId} payment pre-authorized. Awaiting host confirmation.", booking.Id);

            // Publish GraphQL subscription events for real-time subscribers
            await _eventSender.SendAsync($"BookingUpdated_{booking.Id}", booking);
            if (booking.Listing != null)
            {
                await _eventSender.SendAsync($"HostBookings_{booking.Listing.HostId}", booking);
            }
        }
        else
        {
            _logger.LogWarning("No booking found corresponding to Stripe payment intent {PaymentIntentId}.", paymentIntentId);
        }
    }
}
