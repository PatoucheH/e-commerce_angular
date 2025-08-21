using backend_api.Models.DTOs;
using backend_api.Services;
using Microsoft.AspNetCore.Mvc;

namespace backend_api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UploadController :ControllerBase 
    {
        private readonly IImageService _imageService;

        public UploadController(IImageService imageService)
        {
            _imageService = imageService;
        }

        [HttpPost("product")]
        public async Task<ActionResult> UploadProductImage([FromForm] FileUploadDto dto)
        {
            try
            {
                if (dto.File is null || dto.File.Length == 0)
                    return BadRequest(new { error = "No file uploaded." });
                var path = await _imageService.UploadImages(dto.File, "Products");
                return Ok(new { Url = path });

            }
            catch(Exception ex)
            {
                return BadRequest(new { error = ex.Message});
            }
        }
    }
}
