using System.ComponentModel.DataAnnotations;

namespace AirbnbClone.Api.GraphQL.Common;

public record ListingImageInput(
    [Required] string Url,
    string? PublicId,
    bool IsCover = false,
    int DisplayOrder = 0
);

public record CreateListingInput(
    [Required][MaxLength(200)] string Title,
    [Required][MaxLength(4000)] string Description,
    [Required] string Category,
    [Required] string PropertyType,
    [Required] string City,
    [Required] string Country,
    [Required] string Address,
    double Latitude,
    double Longitude,
    [Range(1, 100000)] decimal PricePerNight,
    decimal CleaningFee,
    [Range(1, 50)] int MaxGuests,
    [Range(1, 20)] int Bedrooms,
    [Range(1, 30)] int Beds,
    [Range(1, 20)] int Bathrooms,
    List<ListingImageInput>? Images
);
