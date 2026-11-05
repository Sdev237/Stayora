using System.ComponentModel.DataAnnotations;
using AirbnbClone.Api.Models;

namespace AirbnbClone.Api.GraphQL.Common;

public record CreateBookingInput(
    [Required] Guid ListingId,
    [Required] DateTime CheckIn,
    [Required] DateTime CheckOut,
    [Range(1, 50)] int GuestCount
);

public record BookingPayload(
    Booking Booking,
    string ClientSecret,
    string PaymentIntentId
);

public record BookedDateRange(
    DateTime CheckIn,
    DateTime CheckOut
);
