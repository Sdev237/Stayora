namespace AirbnbClone.Api.Services;

public class ImageUploadResult
{
    public string Url { get; set; } = string.Empty;
    public string PublicId { get; set; } = string.Empty;
    public bool Success { get; set; }
    public string? Error { get; set; }
}

public interface ICloudinaryService
{
    Task<ImageUploadResult> UploadImageAsync(Stream fileStream, string fileName, string folder = "airbnb-listings");
    Task<bool> DeleteImageAsync(string publicId);
}
