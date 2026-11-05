using System.Security.Claims;
using AirbnbClone.Api.Data;
using AirbnbClone.Api.Models;
using HotChocolate.Authorization;
using Microsoft.EntityFrameworkCore;

namespace AirbnbClone.Api.GraphQL.Queries;

public class Query
{
    [UseProjection]
    [UseFiltering]
    [UseSorting]
    public IQueryable<Listing> GetListings(AppDbContext context)
    {
        return context.Listings.AsNoTracking();
    }

    [UseProjection]
    [UseFiltering]
    [UseSorting]
    public IQueryable<Listing> SearchListings(
        AppDbContext context,
        string? location = null,
        DateTime? checkIn = null,
        DateTime? checkOut = null,
        decimal? minPrice = null,
        decimal? maxPrice = null,
        int? guests = null,
        string? category = null,
        int? bedrooms = null,
        int? beds = null,
        int? bathrooms = null,
        List<string>? propertyTypes = null)
    {
        var query = context.Listings.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(location))
        {
            var loc = location.Trim().ToLower();
            query = query.Where(l => l.City.ToLower().Contains(loc) ||
                                     l.Country.ToLower().Contains(loc) ||
                                     l.Title.ToLower().Contains(loc) ||
                                     l.Address.ToLower().Contains(loc));
        }

        if (!string.IsNullOrWhiteSpace(category) && !category.Equals("all", StringComparison.OrdinalIgnoreCase))
        {
            query = query.Where(l => l.Category == category);
        }

        if (minPrice.HasValue)
        {
            query = query.Where(l => l.PricePerNight >= minPrice.Value);
        }

        if (maxPrice.HasValue)
        {
            query = query.Where(l => l.PricePerNight <= maxPrice.Value);
        }

        if (guests.HasValue && guests.Value > 0)
        {
            query = query.Where(l => l.MaxGuests >= guests.Value);
        }

        if (bedrooms.HasValue && bedrooms.Value > 0)
        {
            query = query.Where(l => l.Bedrooms >= bedrooms.Value);
        }

        if (beds.HasValue && beds.Value > 0)
        {
            query = query.Where(l => l.Beds >= beds.Value);
        }

        if (bathrooms.HasValue && bathrooms.Value > 0)
        {
            query = query.Where(l => l.Bathrooms >= bathrooms.Value);
        }

        if (propertyTypes != null && propertyTypes.Count > 0)
        {
            query = query.Where(l => propertyTypes.Contains(l.PropertyType));
        }

        if (checkIn.HasValue && checkOut.HasValue)
        {
            var inDate = checkIn.Value.Date;
            var outDate = checkOut.Value.Date;

            query = query.Where(l => !l.Bookings.Any(b =>
                b.Status == "Confirmed" &&
                inDate < b.CheckOut.Date &&
                outDate > b.CheckIn.Date));
        }

        return query;
    }

    public async Task<Listing?> GetListingByIdAsync(
        Guid id,
        AppDbContext context)
    {
        return await context.Listings
            .Include(l => l.Images)
            .Include(l => l.Host)
            .Include(l => l.Reviews)
                .ThenInclude(r => r.User)
            .AsNoTracking()
            .FirstOrDefaultAsync(l => l.Id == id);
    }

    [Authorize]
    public async Task<User?> GetMeAsync(
        ClaimsPrincipal claimsPrincipal,
        AppDbContext context)
    {
        var userIdStr = claimsPrincipal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var userId))
        {
            return null;
        }

        return await context.Users
            .Include(u => u.HostedListings)
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == userId);
    }

    [Authorize(Roles = new[] { UserRole.Admin })]
    [UseProjection]
    [UseFiltering]
    [UseSorting]
    public IQueryable<User> GetUsers(AppDbContext context)
    {
        return context.Users.AsNoTracking();
    }

    public async Task<List<AirbnbClone.Api.GraphQL.Common.BookedDateRange>> GetListingBookedDatesAsync(
        Guid listingId,
        AppDbContext context)
    {
        return await context.Bookings
            .Where(b => b.ListingId == listingId && b.Status == "Confirmed")
            .Select(b => new AirbnbClone.Api.GraphQL.Common.BookedDateRange(b.CheckIn, b.CheckOut))
            .ToListAsync();
    }

    [Authorize]
    [UseProjection]
    [UseFiltering]
    [UseSorting]
    public IQueryable<Booking> GetMyBookings(
        ClaimsPrincipal claimsPrincipal,
        AppDbContext context)
    {
        var userIdStr = claimsPrincipal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var userId))
        {
            return Enumerable.Empty<Booking>().AsQueryable();
        }

        return context.Bookings
            .Where(b => b.UserId == userId)
            .Include(b => b.Listing)
                .ThenInclude(l => l!.Images)
            .OrderByDescending(b => b.CreatedAt)
            .AsNoTracking();
    }

    [Authorize]
    [UseProjection]
    [UseFiltering]
    [UseSorting]
    public IQueryable<Booking> GetHostReservations(
        ClaimsPrincipal claimsPrincipal,
        AppDbContext context)
    {
        var userIdStr = claimsPrincipal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var userId))
        {
            return Enumerable.Empty<Booking>().AsQueryable();
        }

        return context.Bookings
            .Where(b => b.Listing != null && b.Listing.HostId == userId)
            .Include(b => b.Listing)
                .ThenInclude(l => l!.Images)
            .Include(b => b.User)
            .OrderByDescending(b => b.CreatedAt)
            .AsNoTracking();
    }
}
