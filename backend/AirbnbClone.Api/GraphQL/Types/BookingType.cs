using AirbnbClone.Api.Models;
using HotChocolate.Types;

namespace AirbnbClone.Api.GraphQL.Types;

public class BookingType : ObjectType<Booking>
{
    protected override void Configure(IObjectTypeDescriptor<Booking> descriptor)
    {
        descriptor.Description("Represents a reservation booking for an Airbnb listing.");

        descriptor.Field(b => b.Id).Type<NonNullType<IdType>>();
        descriptor.Field(b => b.CheckIn).Type<NonNullType<DateTimeType>>();
        descriptor.Field(b => b.CheckOut).Type<NonNullType<DateTimeType>>();
        descriptor.Field(b => b.TotalPrice).Type<NonNullType<DecimalType>>();
        descriptor.Field(b => b.GuestCount).Type<NonNullType<IntType>>();
        descriptor.Field(b => b.Status).Type<NonNullType<StringType>>();

        descriptor.Field(b => b.Listing).Type<ListingType>();
        descriptor.Field(b => b.User).Type<UserType>();
    }
}
