using System.Security.Claims;
using AirbnbClone.Api.Models;

namespace AirbnbClone.Api.Services;

public interface IAuthService
{
    string HashPassword(string password);
    bool VerifyPassword(string password, string passwordHash);
    string GenerateJwtToken(User user);
    ClaimsPrincipal? GetPrincipalFromToken(string token);
}
