using System.Text.Json;
using StackExchange.Redis;

namespace AirbnbClone.Api.Services;

public class RedisCacheService : IRedisCacheService
{
    private readonly ILogger<RedisCacheService> _logger;
    private readonly Lazy<IConnectionMultiplexer?> _lazyConnection;

    public RedisCacheService(IConfiguration configuration, ILogger<RedisCacheService> logger)
    {
        _logger = logger;
        var connectionString = configuration.GetConnectionString("Redis") ?? "localhost:6379";

        _lazyConnection = new Lazy<IConnectionMultiplexer?>(() =>
        {
            try
            {
                var options = ConfigurationOptions.Parse(connectionString);
                options.AbortOnConnectFail = false;
                options.ConnectTimeout = 2000;
                return ConnectionMultiplexer.Connect(options);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Unable to connect to Redis at {ConnectionString}. Operating in cache-bypass mode.", connectionString);
                return null;
            }
        });
    }

    public bool IsConnected => _lazyConnection.Value?.IsConnected ?? false;

    private IDatabase? GetDatabase()
    {
        try
        {
            var multiplexer = _lazyConnection.Value;
            if (multiplexer != null && multiplexer.IsConnected)
            {
                return multiplexer.GetDatabase();
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to get Redis database instance.");
        }
        return null;
    }

    public async Task<T?> GetAsync<T>(string key)
    {
        try
        {
            var db = GetDatabase();
            if (db == null) return default;

            var value = await db.StringGetAsync(key);
            if (!value.HasValue) return default;

            return JsonSerializer.Deserialize<T>(value!);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Error fetching key {Key} from Redis cache.", key);
            return default;
        }
    }

    public async Task SetAsync<T>(string key, T value, TimeSpan? expiry = null)
    {
        try
        {
            var db = GetDatabase();
            if (db == null) return;

            var serialized = JsonSerializer.Serialize(value);
            await db.StringSetAsync(key, serialized, expiry ?? TimeSpan.FromMinutes(10));
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Error storing key {Key} in Redis cache.", key);
        }
    }

    public async Task RemoveAsync(string key)
    {
        try
        {
            var db = GetDatabase();
            if (db == null) return;

            await db.KeyDeleteAsync(key);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Error deleting key {Key} from Redis cache.", key);
        }
    }
}
