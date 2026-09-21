using System.ComponentModel.DataAnnotations;

namespace AirbnbClone.Api.GraphQL.Common;

public record RegisterInput(
    [Required][MaxLength(100)] string Name,
    [Required][EmailAddress][MaxLength(150)] string Email,
    [Required][MinLength(6)] string Password,
    string? Role = "Guest",
    string? AvatarUrl = null,
    string? Bio = null
);
