using AirbnbClone.Api.Models;
using HotChocolate.Types;

namespace AirbnbClone.Api.GraphQL.Types;

public class ListingType : ObjectType<Listing>
{
    protected override void Configure(IObjectTypeDescriptor<Listing> descriptor)
    {
        descriptor.Description("Represents an Airbnb property listing.");

        descriptor.Field(l => l.Id).Type<NonNullType<IdType>>();
        descriptor.Field(l => l.Title).Type<NonNullType<StringType>>();
        descriptor.Field(l => l.Description).Type<NonNullType<StringType>>();
        descriptor.Field(l => l.PricePerNight).Type<NonNullType<DecimalType>>();
        descriptor.Field(l => l.CleaningFee).Type<NonNullType<DecimalType>>();

        descriptor.Field(l => l.Images).Type<ListType<ListingImageType>>();
        descriptor.Field(l => l.Host).Type<UserType>();
        descriptor.Field(l => l.Reviews).Type<ListType<ReviewType>>();
    }
}

public class ListingImageType : ObjectType<ListingImage>
{
    protected override void Configure(IObjectTypeDescriptor<ListingImage> descriptor)
    {
        descriptor.Description("Represents a photo associated with a listing.");
        descriptor.Field(i => i.Id).Type<NonNullType<IdType>>();
        descriptor.Field(i => i.Url).Type<NonNullType<StringType>>();
        descriptor.Field(i => i.IsCover).Type<NonNullType<BooleanType>>();
        descriptor.Field(i => i.DisplayOrder).Type<NonNullType<IntType>>();
    }
}

public class ReviewType : ObjectType<Review>
{
    protected override void Configure(IObjectTypeDescriptor<Review> descriptor)
    {
        descriptor.Description("Represents a guest review for a listing.");
        descriptor.Field(r => r.Id).Type<NonNullType<IdType>>();
        descriptor.Field(r => r.Rating).Type<NonNullType<IntType>>();
        descriptor.Field(r => r.Comment).Type<NonNullType<StringType>>();
        descriptor.Field(r => r.CreatedAt).Type<NonNullType<DateTimeType>>();
        descriptor.Field(r => r.User).Type<UserType>();
    }
}
