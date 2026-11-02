namespace AirbnbClone.Api.Services;

public class StripePaymentResult
{
    public string ClientSecret { get; set; } = string.Empty;
    public string PaymentIntentId { get; set; } = string.Empty;
    public bool Success { get; set; }
    public string? Error { get; set; }
}

public interface IStripeService
{
    Task<StripePaymentResult> CreatePaymentIntentAsync(decimal amount, string currency, Guid bookingId);
}
