using AirbnbClone.Api.Models;
using HotChocolate.Types;

namespace AirbnbClone.Api.GraphQL.Types;

public class UserType : ObjectType<User>
{
    protected override void Configure(IObjectTypeDescriptor<User> descriptor)
    {
        descriptor.Description("Represents an Airbnb user (Guest or Host).");

        descriptor.Field(u => u.Id).Type<NonNullType<IdType>>();
        descriptor.Field(u => u.Name).Type<NonNullType<StringType>>();
        descriptor.Field(u => u.Email).Type<NonNullType<StringType>>();
        descriptor.Field(u => u.Role).Type<NonNullType<StringType>>();
        descriptor.Field(u => u.AvatarUrl).Type<StringType>();
        descriptor.Field(u => u.Bio).Type<StringType>();
        descriptor.Field(u => u.CreatedAt).Type<NonNullType<DateTimeType>>();

        // CRITICAL: Prevent PasswordHash from ever being exposed via GraphQL
        descriptor.Ignore(u => u.PasswordHash);

        descriptor.Field(u => u.HostedListings).Type<ListType<ListingType>>();
    }
}
