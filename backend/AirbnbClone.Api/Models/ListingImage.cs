using System.ComponentModel.DataAnnotations;

namespace AirbnbClone.Api.Models;

public class ListingImage
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    [MaxLength(1000)]
    public string Url { get; set; } = string.Empty;

    public string? PublicId { get; set; } // Cloudinary asset public id

    [MaxLength(200)]
    public string? Caption { get; set; }

    public bool IsCover { get; set; } = false;

    public int DisplayOrder { get; set; } = 0;

    public Guid ListingId { get; set; }
    public Listing? Listing { get; set; }
}
