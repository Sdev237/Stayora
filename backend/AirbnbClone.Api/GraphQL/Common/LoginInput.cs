using System.ComponentModel.DataAnnotations;

namespace AirbnbClone.Api.GraphQL.Common;

public record LoginInput(
    [Required][EmailAddress] string Email,
    [Required] string Password
);
