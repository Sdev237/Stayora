using AirbnbClone.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace AirbnbClone.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Listing> Listings => Set<Listing>();
    public DbSet<ListingImage> ListingImages => Set<ListingImage>();
    public DbSet<Review> Reviews => Set<Review>();
    public DbSet<Booking> Bookings => Set<Booking>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User configuration
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasIndex(u => u.Email).IsUnique();
        });

        // Listing configuration
        modelBuilder.Entity<Listing>(entity =>
        {
            entity.HasOne(l => l.Host)
                  .WithMany(u => u.HostedListings)
                  .HasForeignKey(l => l.HostId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasMany(l => l.Images)
                  .WithOne(img => img.Listing)
                  .HasForeignKey(img => img.ListingId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasMany(l => l.Reviews)
                  .WithOne(r => r.Listing)
                  .HasForeignKey(r => r.ListingId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasMany(l => l.Bookings)
                  .WithOne(b => b.Listing)
                  .HasForeignKey(b => b.ListingId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // Review configuration
        modelBuilder.Entity<Review>(entity =>
        {
            entity.HasOne(r => r.User)
                  .WithMany(u => u.Reviews)
                  .HasForeignKey(r => r.UserId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // Booking configuration
        modelBuilder.Entity<Booking>(entity =>
        {
            entity.HasOne(b => b.User)
                  .WithMany(u => u.Bookings)
                  .HasForeignKey(b => b.UserId)
                  .OnDelete(DeleteBehavior.Restrict);
        });
    }
}
