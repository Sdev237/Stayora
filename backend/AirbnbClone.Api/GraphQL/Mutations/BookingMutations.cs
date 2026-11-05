using System.Security.Claims;
using AirbnbClone.Api.Data;
using AirbnbClone.Api.GraphQL.Common;
using AirbnbClone.Api.Models;
using AirbnbClone.Api.Services;
using HotChocolate.Authorization;
using Microsoft.EntityFrameworkCore;

namespace AirbnbClone.Api.GraphQL.Mutations;

public partial class Mutation
{
    [Authorize]
    public async Task<BookingPayload> CreateBookingAsync(
        CreateBookingInput input,
        ClaimsPrincipal claimsPrincipal,
        AppDbContext context,
        [Service] IStripeService stripeService)
    {
        var userIdStr = claimsPrincipal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var userId))
        {
            throw new GraphQLException(ErrorBuilder.New().SetMessage("Unauthorized").SetCode("UNAUTHORIZED").Build());
        }

        var checkIn = input.CheckIn.Date;
        var checkOut = input.CheckOut.Date;

        if (checkOut <= checkIn)
        {
            throw new GraphQLException(ErrorBuilder.New().SetMessage("Check-out date must be after check-in date.").SetCode("INVALID_DATES").Build());
        }

        var listing = await context.Listings.FirstOrDefaultAsync(l => l.Id == input.ListingId);
        if (listing == null)
        {
            throw new GraphQLException(ErrorBuilder.New().SetMessage("Listing not found.").SetCode("NOT_FOUND").Build());
        }

        // Prevent owners from booking their own listing
        if (listing.HostId == userId)
        {
            throw new GraphQLException(ErrorBuilder.New()
                .SetMessage("Vous êtes le propriétaire de ce logement. Vous ne pouvez pas réserver votre propre annonce.")
                .SetCode("OWN_LISTING_BOOKING_FORBIDDEN")
                .Build());
        }

        // Require Guest account for bookings
        var userRole = claimsPrincipal.FindFirst(ClaimTypes.Role)?.Value;
        if (string.Equals(userRole, UserRole.Host, StringComparison.OrdinalIgnoreCase))
        {
            throw new GraphQLException(ErrorBuilder.New()
                .SetMessage("Les réservations doivent être effectuées avec un compte Voyageur. Veuillez utiliser un compte Voyageur pour réserver.")
                .SetCode("HOST_CANNOT_BOOK")
                .Build());
        }

        if (input.GuestCount > listing.MaxGuests)
        {
            throw new GraphQLException(ErrorBuilder.New().SetMessage($"Maximum capacity exceeded ({listing.MaxGuests} guests).").SetCode("CAPACITY_EXCEEDED").Build());
        }

        var hasConflict = await context.Bookings.AnyAsync(b =>
            b.ListingId == input.ListingId &&
            b.Status == "Confirmed" &&
            checkIn < b.CheckOut.Date &&
            checkOut > b.CheckIn.Date);

        if (hasConflict)
        {
            throw new GraphQLException(ErrorBuilder.New().SetMessage("These dates are already booked. Please choose other dates.").SetCode("DATES_UNAVAILABLE").Build());
        }

        var nights = (int)(checkOut - checkIn).TotalDays;
        var stayTotal = nights * listing.PricePerNight;
        var serviceFee = Math.Round(stayTotal * 0.14m, 2);
        var totalPrice = stayTotal + listing.CleaningFee + serviceFee;

        var booking = new Booking
        {
            Id = Guid.NewGuid(),
            ListingId = listing.Id,
            UserId = userId,
            CheckIn = checkIn,
            CheckOut = checkOut,
            GuestCount = input.GuestCount,
            TotalPrice = totalPrice,
            Status = "Pending",
            CreatedAt = DateTime.UtcNow
        };

        var paymentResult = await stripeService.CreatePaymentIntentAsync(totalPrice, "cad", booking.Id);
        if (!paymentResult.Success)
        {
            throw new GraphQLException(ErrorBuilder.New().SetMessage(paymentResult.Error ?? "Payment initialization failed.").SetCode("PAYMENT_INIT_FAILED").Build());
        }

        booking.StripePaymentIntentId = paymentResult.PaymentIntentId;

        context.Bookings.Add(booking);
        await context.SaveChangesAsync();

        return new BookingPayload(booking, paymentResult.ClientSecret, paymentResult.PaymentIntentId);
    }

    [Authorize]
    public async Task<Booking> ConfirmBookingAsync(
        Guid bookingId,
        ClaimsPrincipal claimsPrincipal,
        AppDbContext context,
        [Service] HotChocolate.Subscriptions.ITopicEventSender eventSender)
    {
        var userIdStr = claimsPrincipal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var userId))
        {
            throw new GraphQLException(ErrorBuilder.New().SetMessage("Unauthorized").SetCode("UNAUTHORIZED").Build());
        }

        var booking = await context.Bookings
            .Include(b => b.Listing)
            .Include(b => b.User)
            .FirstOrDefaultAsync(b => b.Id == bookingId);

        if (booking == null)
        {
            throw new GraphQLException(ErrorBuilder.New().SetMessage("Booking not found.").SetCode("NOT_FOUND").Build());
        }

        if (booking.Listing == null || booking.Listing.HostId != userId)
        {
            throw new GraphQLException(ErrorBuilder.New()
                .SetMessage("Seul le propriétaire de ce logement peut confirmer cette réservation.")
                .SetCode("FORBIDDEN_NOT_HOST")
                .Build());
        }

        booking.Status = "Confirmed";
        await context.SaveChangesAsync();

        // Broadcast real-time status change to traveler and host
        await eventSender.SendAsync($"BookingUpdated_{booking.Id}", booking);
        await eventSender.SendAsync($"HostBookings_{booking.Listing.HostId}", booking);

        return booking;
    }

    [Authorize]
    public async Task<Booking> RejectBookingAsync(
        Guid bookingId,
        ClaimsPrincipal claimsPrincipal,
        AppDbContext context,
        [Service] HotChocolate.Subscriptions.ITopicEventSender eventSender)
    {
        var userIdStr = claimsPrincipal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var userId))
        {
            throw new GraphQLException(ErrorBuilder.New().SetMessage("Unauthorized").SetCode("UNAUTHORIZED").Build());
        }

        var booking = await context.Bookings
            .Include(b => b.Listing)
            .Include(b => b.User)
            .FirstOrDefaultAsync(b => b.Id == bookingId);

        if (booking == null)
        {
            throw new GraphQLException(ErrorBuilder.New().SetMessage("Booking not found.").SetCode("NOT_FOUND").Build());
        }

        if (booking.Listing == null || booking.Listing.HostId != userId)
        {
            throw new GraphQLException(ErrorBuilder.New()
                .SetMessage("Seul le propriétaire de ce logement peut refuser cette réservation.")
                .SetCode("FORBIDDEN_NOT_HOST")
                .Build());
        }

        booking.Status = "Cancelled";
        await context.SaveChangesAsync();

        await eventSender.SendAsync($"BookingUpdated_{booking.Id}", booking);
        await eventSender.SendAsync($"HostBookings_{booking.Listing.HostId}", booking);

        return booking;
    }
}
