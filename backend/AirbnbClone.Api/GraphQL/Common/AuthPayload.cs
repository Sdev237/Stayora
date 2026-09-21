using AirbnbClone.Api.Models;

namespace AirbnbClone.Api.GraphQL.Common;

public record AuthPayload(
    string Token,
    User User,
    DateTime ExpiresAt
);
