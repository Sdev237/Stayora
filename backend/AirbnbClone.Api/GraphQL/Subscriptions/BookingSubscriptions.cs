using AirbnbClone.Api.Models;
using HotChocolate.Execution;
using HotChocolate.Subscriptions;

namespace AirbnbClone.Api.GraphQL.Subscriptions;

public partial class Subscription
{
    [Subscribe]
    [Topic("BookingUpdated_{bookingId}")]
    public Booking OnBookingStatusChanged(
        [EventMessage] Booking booking,
        Guid bookingId) => booking;

    [Subscribe]
    [Topic("HostBookings_{hostId}")]
    public Booking OnHostBookingNotification(
        [EventMessage] Booking booking,
        Guid hostId) => booking;
}
