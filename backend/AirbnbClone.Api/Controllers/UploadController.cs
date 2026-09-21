using AirbnbClone.Api.Models;
using AirbnbClone.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AirbnbClone.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = $"{UserRole.Host},{UserRole.Admin}")]
public class UploadController : ControllerBase
{
    private readonly ICloudinaryService _cloudinaryService;
    private readonly ILogger<UploadController> _logger;

    public UploadController(ICloudinaryService cloudinaryService, ILogger<UploadController> logger)
    {
        _cloudinaryService = cloudinaryService;
        _logger = logger;
    }

    [HttpPost("images")]
    [RequestSizeLimit(50 * 1024 * 1024)] // 50MB
    public async Task<IActionResult> UploadImages([FromForm] List<IFormFile> files)
    {
        if (files == null || files.Count == 0)
        {
            return BadRequest(new { error = "No files provided for upload." });
        }

        var urls = new List<string>();
        var publicIds = new List<string>();

        foreach (var file in files)
        {
            if (file.Length == 0) continue;

            await using var stream = file.OpenReadStream();
            var uploadResult = await _cloudinaryService.UploadImageAsync(stream, file.FileName);

            if (uploadResult.Success)
            {
                urls.Add(uploadResult.Url);
                publicIds.Add(uploadResult.PublicId);
            }
            else
            {
                _logger.LogError("Failed to upload image {FileName}: {Error}", file.FileName, uploadResult.Error);
                return StatusCode(500, new { error = $"Upload failed for {file.FileName}: {uploadResult.Error}" });
            }
        }

        return Ok(new
        {
            urls,
            publicIds
        });
    }
}
