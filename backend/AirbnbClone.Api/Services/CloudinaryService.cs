using CloudinaryDotNet;
using CloudinaryDotNet.Actions;

namespace AirbnbClone.Api.Services;

public class CloudinaryService : ICloudinaryService
{
    private readonly Cloudinary? _cloudinary;
    private readonly ILogger<CloudinaryService> _logger;

    public CloudinaryService(IConfiguration configuration, ILogger<CloudinaryService> logger)
    {
        _logger = logger;
        var cloudName = configuration["Cloudinary:CloudName"];
        var apiKey = configuration["Cloudinary:ApiKey"];
        var apiSecret = configuration["Cloudinary:ApiSecret"];

        if (!string.IsNullOrEmpty(cloudName) && !string.IsNullOrEmpty(apiKey) && !string.IsNullOrEmpty(apiSecret))
        {
            var account = new Account(cloudName, apiKey, apiSecret);
            _cloudinary = new Cloudinary(account);
            _cloudinary.Api.Secure = true;
        }
        else
        {
            _logger.LogWarning("Cloudinary credentials not configured. Media uploads will operate in stub mode.");
        }
    }

    public async Task<ImageUploadResult> UploadImageAsync(Stream fileStream, string fileName, string folder = "airbnb-listings")
    {
        if (_cloudinary == null)
        {
            // If Cloudinary credentials are not set, return a high-res placeholder image
            return new ImageUploadResult
            {
                Success = true,
                Url = "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
                PublicId = $"local_{Guid.NewGuid()}"
            };
        }

        try
        {
            var uploadParams = new ImageUploadParams
            {
                File = new FileDescription(fileName, fileStream),
                Folder = folder,
                Transformation = new Transformation().Quality("auto").FetchFormat("auto")
            };

            var uploadResult = await _cloudinary.UploadAsync(uploadParams);

            if (uploadResult.Error != null)
            {
                _logger.LogError("Cloudinary upload error: {Message}", uploadResult.Error.Message);
                return new ImageUploadResult
                {
                    Success = false,
                    Error = uploadResult.Error.Message
                };
            }

            return new ImageUploadResult
            {
                Success = true,
                Url = uploadResult.SecureUrl?.ToString() ?? uploadResult.Url?.ToString() ?? string.Empty,
                PublicId = uploadResult.PublicId
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Exception occurred during Cloudinary upload.");
            return new ImageUploadResult
            {
                Success = false,
                Error = ex.Message
            };
        }
    }

    public async Task<bool> DeleteImageAsync(string publicId)
    {
        if (_cloudinary == null || string.IsNullOrEmpty(publicId))
            return false;

        try
        {
            var deleteParams = new DeletionParams(publicId);
            var result = await _cloudinary.DestroyAsync(deleteParams);
            return result.Result == "ok";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Exception deleting image {PublicId} from Cloudinary.", publicId);
            return false;
        }
    }
}
