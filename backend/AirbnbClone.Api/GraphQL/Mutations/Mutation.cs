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
    public async Task<AuthPayload> RegisterAsync(
        RegisterInput input,
        AppDbContext context,
        [Service] IAuthService authService)
    {
        var normalizedEmail = input.Email.Trim().ToLowerInvariant();

        var existingUser = await context.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Email.ToLower() == normalizedEmail);

        if (existingUser != null)
        {
            throw new GraphQLException(
                ErrorBuilder.New()
                    .SetMessage("An account with this email address already exists.")
                    .SetCode("EMAIL_ALREADY_EXISTS")
                    .Build());
        }

        var role = (input.Role?.Equals(UserRole.Host, StringComparison.OrdinalIgnoreCase) ?? false)
            ? UserRole.Host
            : UserRole.Guest;

        var user = new User
        {
            Id = Guid.NewGuid(),
            Name = input.Name.Trim(),
            Email = normalizedEmail,
            PasswordHash = authService.HashPassword(input.Password),
            Role = role,
            AvatarUrl = input.AvatarUrl ?? $"https://api.dicebear.com/7.x/avataaars/svg?seed={Uri.EscapeDataString(input.Name)}",
            Bio = input.Bio,
            CreatedAt = DateTime.UtcNow
        };

        context.Users.Add(user);
        await context.SaveChangesAsync();

        var token = authService.GenerateJwtToken(user);
        var expiresAt = DateTime.UtcNow.AddDays(7);

        return new AuthPayload(token, user, expiresAt);
    }

    public async Task<AuthPayload> LoginAsync(
        LoginInput input,
        AppDbContext context,
        [Service] IAuthService authService)
    {
        var normalizedEmail = input.Email.Trim().ToLowerInvariant();

        var user = await context.Users
            .FirstOrDefaultAsync(u => u.Email.ToLower() == normalizedEmail);

        if (user == null || !authService.VerifyPassword(input.Password, user.PasswordHash))
        {
            throw new GraphQLException(
                ErrorBuilder.New()
                    .SetMessage("Invalid email or password.")
                    .SetCode("INVALID_CREDENTIALS")
                    .Build());
        }

        var token = authService.GenerateJwtToken(user);
        var expiresAt = DateTime.UtcNow.AddDays(7);

        return new AuthPayload(token, user, expiresAt);
    }

    [Authorize]
    public async Task<AuthPayload> SwitchToHostRoleAsync(
        ClaimsPrincipal claimsPrincipal,
        AppDbContext context,
        [Service] IAuthService authService)
    {
        var userIdStr = claimsPrincipal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var userId))
        {
            throw new GraphQLException(ErrorBuilder.New().SetMessage("Unauthorized").SetCode("UNAUTHORIZED").Build());
        }

        var user = await context.Users.FirstOrDefaultAsync(u => u.Id == userId);
        if (user == null)
        {
            throw new GraphQLException(ErrorBuilder.New().SetMessage("User not found.").SetCode("NOT_FOUND").Build());
        }

        user.Role = UserRole.Host;
        user.UpdatedAt = DateTime.UtcNow;
        await context.SaveChangesAsync();

        var token = authService.GenerateJwtToken(user);
        return new AuthPayload(token, user, DateTime.UtcNow.AddDays(7));
    }

    [Authorize(Roles = new[] { UserRole.Host, UserRole.Admin })]
    public async Task<Listing> CreateListingAsync(
        CreateListingInput input,
        ClaimsPrincipal claimsPrincipal,
        AppDbContext context,
        [Service] IRedisCacheService cacheService)
    {
        var userIdStr = claimsPrincipal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var userId))
        {
            throw new GraphQLException(ErrorBuilder.New().SetMessage("Unauthorized").SetCode("UNAUTHORIZED").Build());
        }

        var host = await context.Users.FirstOrDefaultAsync(u => u.Id == userId);
        if (host == null)
        {
            throw new GraphQLException(ErrorBuilder.New().SetMessage("Host user not found.").SetCode("NOT_FOUND").Build());
        }

        var listing = new Listing
        {
            Id = Guid.NewGuid(),
            Title = input.Title.Trim(),
            Description = input.Description.Trim(),
            Category = input.Category,
            PropertyType = input.PropertyType,
            City = input.City.Trim(),
            Country = input.Country.Trim(),
            Address = input.Address.Trim(),
            Latitude = input.Latitude,
            Longitude = input.Longitude,
            PricePerNight = input.PricePerNight,
            CleaningFee = input.CleaningFee,
            MaxGuests = input.MaxGuests,
            Bedrooms = input.Bedrooms,
            Beds = input.Beds,
            Bathrooms = input.Bathrooms,
            HostId = host.Id,
            CreatedAt = DateTime.UtcNow
        };

        if (input.Images != null && input.Images.Count > 0)
        {
            var order = 0;
            foreach (var img in input.Images)
            {
                listing.Images.Add(new ListingImage
                {
                    Id = Guid.NewGuid(),
                    Url = img.Url,
                    PublicId = img.PublicId,
                    IsCover = img.IsCover || order == 0,
                    DisplayOrder = img.DisplayOrder != 0 ? img.DisplayOrder : order++
                });
            }
        }
        else
        {
            // Default cover photo if none provided
            listing.Images.Add(new ListingImage
            {
                Id = Guid.NewGuid(),
                Url = "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
                IsCover = true,
                DisplayOrder = 0
            });
        }

        context.Listings.Add(listing);
        await context.SaveChangesAsync();

        // Invalidate listing cache
        await cacheService.RemoveAsync("all_listings");

        return listing;
    }
}
