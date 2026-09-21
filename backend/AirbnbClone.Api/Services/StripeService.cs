using Stripe;

namespace AirbnbClone.Api.Services;

public class StripeService : IStripeService
{
    private readonly ILogger<StripeService> _logger;
    private readonly string? _apiKey;

    public StripeService(IConfiguration configuration, ILogger<StripeService> logger)
    {
        _logger = logger;
        _apiKey = configuration["Stripe:SecretKey"];
        if (!string.IsNullOrEmpty(_apiKey) && !_apiKey.StartsWith("sk_test_placeholder"))
        {
            StripeConfiguration.ApiKey = _apiKey;
        }
        else
        {
            _logger.LogWarning("Stripe Secret Key not configured. Stripe service operating in mock simulator mode.");
        }
    }

    public async Task<StripePaymentResult> CreatePaymentIntentAsync(decimal amount, string currency, Guid bookingId)
    {
        // Stripe expects amount in lowest denomination (cents)
        var amountInCents = (long)Math.Round(amount * 100);

        if (string.IsNullOrEmpty(_apiKey) || _apiKey.StartsWith("sk_test_placeholder"))
        {
            var mockId = $"pi_mock_{Guid.NewGuid():N}";
            return new StripePaymentResult
            {
                Success = true,
                PaymentIntentId = mockId,
                ClientSecret = $"{mockId}_secret_{Guid.NewGuid():N}"
            };
        }

        try
        {
            var options = new PaymentIntentCreateOptions
            {
                Amount = amountInCents,
                Currency = currency.ToLowerInvariant(),
                PaymentMethodTypes = new List<string> { "card" },
                Metadata = new Dictionary<string, string>
                {
                    { "bookingId", bookingId.ToString() }
                }
            };

            var service = new PaymentIntentService();
            var paymentIntent = await service.CreateAsync(options);

            return new StripePaymentResult
            {
                Success = true,
                PaymentIntentId = paymentIntent.Id,
                ClientSecret = paymentIntent.ClientSecret
            };
        }
        catch (StripeException ex)
        {
            _logger.LogError(ex, "Stripe exception creating payment intent for booking {BookingId}", bookingId);
            return new StripePaymentResult
            {
                Success = false,
                Error = ex.Message
            };
        }
    }
}
