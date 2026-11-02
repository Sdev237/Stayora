using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AirbnbClone.Api.Models;

public class Listing
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [Required]
    [MaxLength(4000)]
    public string Description { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    public string Category { get; set; } = "Beachfront"; // Beachfront, Cabins, Iconic cities, Mansions, Amazing pools, Islands, Countryside, Lakefront, Camping, Tropical

    [Required]
    [MaxLength(50)]
    public string PropertyType { get; set; } = "Entire villa"; // Entire home, Apartment, Villa, Cabin, Room

    [Required]
    [MaxLength(100)]
    public string City { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string Country { get; set; } = string.Empty;

    [Required]
    [MaxLength(255)]
    public string Address { get; set; } = string.Empty;

    public double Latitude { get; set; }

    public double Longitude { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal PricePerNight { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal CleaningFee { get; set; } = 0;

    public int MaxGuests { get; set; } = 1;

    public int Bedrooms { get; set; } = 1;

    public int Beds { get; set; } = 1;

    public int Bathrooms { get; set; } = 1;

    public double Rating { get; set; } = 5.0;

    public int ReviewCount { get; set; } = 0;

    public bool IsFeatured { get; set; } = false;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }

    // Foreign Keys
    public Guid HostId { get; set; }
    public User? Host { get; set; }

    // Navigation properties
    public ICollection<ListingImage> Images { get; set; } = new List<ListingImage>();
    public ICollection<Review> Reviews { get; set; } = new List<Review>();
    public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
}
