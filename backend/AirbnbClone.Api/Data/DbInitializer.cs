using AirbnbClone.Api.Models;
using AirbnbClone.Api.Services;
using Microsoft.EntityFrameworkCore;

namespace AirbnbClone.Api.Data;

public static class DbInitializer
{
    public static async Task InitializeAsync(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();
        var contextFactory = scope.ServiceProvider.GetRequiredService<IDbContextFactory<AppDbContext>>();
        await using var context = await contextFactory.CreateDbContextAsync();
        var authService = scope.ServiceProvider.GetRequiredService<IAuthService>();
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<AppDbContext>>();

        // Ensure database is created
        await context.Database.EnsureCreatedAsync();

        if (await context.Users.AnyAsync())
        {
            logger.LogInformation("Database already seeded.");
            return;
        }

        logger.LogInformation("Seeding initial data...");

        // 1. Create Default Users
        var hostUser = new User
        {
            Id = Guid.Parse("11111111-1111-1111-1111-111111111111"),
            Name = "Sophie Dubois",
            Email = "host@airbnb.com",
            PasswordHash = authService.HashPassword("Airbnb123!"),
            Role = UserRole.Host,
            AvatarUrl = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
            Bio = "Superhôte passionnée d'architecture et de design intérieur depuis 8 ans.",
            CreatedAt = DateTime.UtcNow.AddMonths(-12)
        };

        var guestUser = new User
        {
            Id = Guid.Parse("22222222-2222-2222-2222-222222222222"),
            Name = "Alexandre Martin",
            Email = "guest@airbnb.com",
            PasswordHash = authService.HashPassword("Airbnb123!"),
            Role = UserRole.Guest,
            AvatarUrl = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
            Bio = "Voyageur curieux en quête d'expériences uniques à travers le monde.",
            CreatedAt = DateTime.UtcNow.AddMonths(-6)
        };

        context.Users.AddRange(hostUser, guestUser);
        await context.SaveChangesAsync();

        // 2. Create Realistic Listings
        var listings = new List<Listing>
        {
            new Listing
            {
                Id = Guid.NewGuid(),
                Title = "Villa Égée avec Piscine à Débordement & Coucher de Soleil",
                Description = "Suspendue sur la falaise d'Oia avec vue panoramique sur la caldeira de Santorin. Terrasse privée taillée dans la roche blanche, piscine à débordement chauffée et service de conciergerie inclus.",
                Category = "Amazing pools",
                PropertyType = "Villa de luxe",
                City = "Santorin",
                Country = "Grèce",
                Address = "Caldera Cliff Walk, Oia",
                Latitude = 36.4618,
                Longitude = 25.3753,
                PricePerNight = 480m,
                CleaningFee = 60m,
                MaxGuests = 4,
                Bedrooms = 2,
                Beds = 2,
                Bathrooms = 2,
                Rating = 4.96,
                ReviewCount = 128,
                IsFeatured = true,
                HostId = hostUser.Id,
                CreatedAt = DateTime.UtcNow.AddDays(-60),
                Images = new List<ListingImage>
                {
                    new() { Url = "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=80", IsCover = true, DisplayOrder = 0 },
                    new() { Url = "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80", IsCover = false, DisplayOrder = 1 },
                    new() { Url = "https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?auto=format&fit=crop&w=1200&q=80", IsCover = false, DisplayOrder = 2 }
                }
            },
            new Listing
            {
                Id = Guid.NewGuid(),
                Title = "Chalet Alpin Contemporain au Pied du Mont-Blanc",
                Description = "Chalet d'architecte mêlant vieux bois et baies vitrées monumentales face au massif. Espace spa nordique avec sauna en cèdre et jacuzzi extérieur chauffé après-ski.",
                Category = "Cabins",
                PropertyType = "Chalet entier",
                City = "Chamonix-Mont-Blanc",
                Country = "France",
                Address = "Route des Pècles, Chamonix",
                Latitude = 45.9237,
                Longitude = 6.8694,
                PricePerNight = 390m,
                CleaningFee = 80m,
                MaxGuests = 8,
                Bedrooms = 4,
                Beds = 5,
                Bathrooms = 3,
                Rating = 4.98,
                ReviewCount = 89,
                IsFeatured = true,
                HostId = hostUser.Id,
                CreatedAt = DateTime.UtcNow.AddDays(-55),
                Images = new List<ListingImage>
                {
                    new() { Url = "https://images.unsplash.com/photo-1542718610-a1d656d1884c?auto=format&fit=crop&w=1200&q=80", IsCover = true, DisplayOrder = 0 },
                    new() { Url = "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1200&q=80", IsCover = false, DisplayOrder = 1 },
                    new() { Url = "https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=1200&q=80", IsCover = false, DisplayOrder = 2 }
                }
            },
            new Listing
            {
                Id = Guid.NewGuid(),
                Title = "Penthouse Verrière avec Vue Panoramique sur Manhattan",
                Description = "Loft d'exception au 34ème étage dans le quartier vibrant de Soho. Plafonds de 5 mètres, immense terrasse végétalisée et salon de dégustation privé.",
                Category = "Iconic cities",
                PropertyType = "Penthouse",
                City = "New York",
                Country = "États-Unis",
                Address = "Mercer Street, SoHo",
                Latitude = 40.7233,
                Longitude = -73.9992,
                PricePerNight = 650m,
                CleaningFee = 120m,
                MaxGuests = 4,
                Bedrooms = 2,
                Beds = 2,
                Bathrooms = 2,
                Rating = 4.92,
                ReviewCount = 210,
                IsFeatured = true,
                HostId = hostUser.Id,
                CreatedAt = DateTime.UtcNow.AddDays(-45),
                Images = new List<ListingImage>
                {
                    new() { Url = "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80", IsCover = true, DisplayOrder = 0 },
                    new() { Url = "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80", IsCover = false, DisplayOrder = 1 },
                    new() { Url = "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80", IsCover = false, DisplayOrder = 2 }
                }
            },
            new Listing
            {
                Id = Guid.NewGuid(),
                Title = "Villa Bambou Écologique nichée dans la Forêt d'Ubud",
                Description = "Structure architecturale courbée en bambou noir surplombant la rivière Ayung. Bassin naturel en pierre de lave, douche extérieure et chants d'oiseaux tropicaux.",
                Category = "Tropical",
                PropertyType = "Villa bioclimatique",
                City = "Bali",
                Country = "Indonésie",
                Address = "Banjar Dinas, Ubud",
                Latitude = -8.5069,
                Longitude = 115.2625,
                PricePerNight = 275m,
                CleaningFee = 40m,
                MaxGuests = 4,
                Bedrooms = 2,
                Beds = 2,
                Bathrooms = 2,
                Rating = 4.95,
                ReviewCount = 312,
                IsFeatured = true,
                HostId = hostUser.Id,
                CreatedAt = DateTime.UtcNow.AddDays(-40),
                Images = new List<ListingImage>
                {
                    new() { Url = "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80", IsCover = true, DisplayOrder = 0 },
                    new() { Url = "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80", IsCover = false, DisplayOrder = 1 },
                    new() { Url = "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80", IsCover = false, DisplayOrder = 2 }
                }
            },
            new Listing
            {
                Id = Guid.NewGuid(),
                Title = "Manoir Historique & Vignoble Privé en Toscane",
                Description = "Domaine du XVIIe siècle au sommet des collines du Val d'Orcia. Piscine en travertin, dégustation de Chianti privé et dîners sous les cyprès centenaires.",
                Category = "Mansions",
                PropertyType = "Manoir historique",
                City = "Sienne",
                Country = "Italie",
                Address = "Strada Provinciale del Chianti",
                Latitude = 43.3188,
                Longitude = 11.3308,
                PricePerNight = 720m,
                CleaningFee = 150m,
                MaxGuests = 12,
                Bedrooms = 6,
                Beds = 8,
                Bathrooms = 5,
                Rating = 4.99,
                ReviewCount = 74,
                IsFeatured = true,
                HostId = hostUser.Id,
                CreatedAt = DateTime.UtcNow.AddDays(-35),
                Images = new List<ListingImage>
                {
                    new() { Url = "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80", IsCover = true, DisplayOrder = 0 },
                    new() { Url = "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80", IsCover = false, DisplayOrder = 1 },
                    new() { Url = "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80", IsCover = false, DisplayOrder = 2 }
                }
            },
            new Listing
            {
                Id = Guid.NewGuid(),
                Title = "Maison de Pêcheur Face à la Mer Turquoise",
                Description = "Accès direct les pieds dans l'eau cristalline des Baléares. Barque traditionnelle à disposition, solarium en teck et couchers de soleil inoubliables.",
                Category = "Beachfront",
                PropertyType = "Maison de plage",
                City = "Formentera",
                Country = "Espagne",
                Address = "Playa de Migjorn",
                Latitude = 38.6942,
                Longitude = 1.4589,
                PricePerNight = 340m,
                CleaningFee = 50m,
                MaxGuests = 5,
                Bedrooms = 2,
                Beds = 3,
                Bathrooms = 1,
                Rating = 4.88,
                ReviewCount = 95,
                IsFeatured = true,
                HostId = hostUser.Id,
                CreatedAt = DateTime.UtcNow.AddDays(-30),
                Images = new List<ListingImage>
                {
                    new() { Url = "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=1200&q=80", IsCover = true, DisplayOrder = 0 },
                    new() { Url = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80", IsCover = false, DisplayOrder = 1 },
                    new() { Url = "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80", IsCover = false, DisplayOrder = 2 }
                }
            },
            new Listing
            {
                Id = Guid.NewGuid(),
                Title = "Cabane en Verre Boréale au Bord du Fjord",
                Description = "Observez les aurores boréales directement depuis votre lit chauffé sous un dôme panoramique à 360°. Poêle à bois, ponton privé et kayak de mer.",
                Category = "Lakefront",
                PropertyType = "Écolodge vitré",
                City = "Tromsø",
                Country = "Norvège",
                Address = "Kvaløya Fjord Road",
                Latitude = 69.6492,
                Longitude = 18.9553,
                PricePerNight = 410m,
                CleaningFee = 70m,
                MaxGuests = 2,
                Bedrooms = 1,
                Beds = 1,
                Bathrooms = 1,
                Rating = 4.97,
                ReviewCount = 142,
                IsFeatured = true,
                HostId = hostUser.Id,
                CreatedAt = DateTime.UtcNow.AddDays(-25),
                Images = new List<ListingImage>
                {
                    new() { Url = "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1200&q=80", IsCover = true, DisplayOrder = 0 },
                    new() { Url = "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80", IsCover = false, DisplayOrder = 1 }
                }
            },
            new Listing
            {
                Id = Guid.NewGuid(),
                Title = "Appartement Haussmannien avec Balcon face à la Tour Eiffel",
                Description = "Moulures d'époque, parquet en point de Hongrie et cheminée en marbre. À 5 minutes à pied du Champ de Mars, au cœur du 7ème arrondissement.",
                Category = "Iconic cities",
                PropertyType = "Appartement de prestige",
                City = "Paris",
                Country = "France",
                Address = "Avenue de La Bourdonnais, 7e",
                Latitude = 48.8566,
                Longitude = 2.3522,
                PricePerNight = 430m,
                CleaningFee = 75m,
                MaxGuests = 4,
                Bedrooms = 2,
                Beds = 2,
                Bathrooms = 1,
                Rating = 4.93,
                ReviewCount = 185,
                IsFeatured = true,
                HostId = hostUser.Id,
                CreatedAt = DateTime.UtcNow.AddDays(-20),
                Images = new List<ListingImage>
                {
                    new() { Url = "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80", IsCover = true, DisplayOrder = 0 },
                    new() { Url = "https://images.unsplash.com/photo-1550581190-9c1c48d21d6c?auto=format&fit=crop&w=1200&q=80", IsCover = false, DisplayOrder = 1 }
                }
            }
        };

        context.Listings.AddRange(listings);
        await context.SaveChangesAsync();

        // 3. Add reviews
        var reviews = new List<Review>
        {
            new Review
            {
                Id = Guid.NewGuid(),
                ListingId = listings[0].Id,
                UserId = guestUser.Id,
                Rating = 5,
                Comment = "Séjour absolument magique ! La vue sur la caldeira au coucher du soleil depuis la piscine dépasse tout ce qu'on peut imaginer. Sophie est une hôte exceptionnelle.",
                CreatedAt = DateTime.UtcNow.AddDays(-15)
            },
            new Review
            {
                Id = Guid.NewGuid(),
                ListingId = listings[1].Id,
                UserId = guestUser.Id,
                Rating = 5,
                Comment = "Le chalet est encore plus grandiose en vrai. Le spa après une journée de ski au soleil était parfait. Nous reviendrons sans hésiter !",
                CreatedAt = DateTime.UtcNow.AddDays(-8)
            }
        };

        context.Reviews.AddRange(reviews);
        await context.SaveChangesAsync();

        logger.LogInformation("Database seeded successfully with {Count} listings.", listings.Count);
    }
}
