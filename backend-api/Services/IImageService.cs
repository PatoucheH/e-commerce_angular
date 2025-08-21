namespace backend_api.Services
{
    public interface IImageService
    {
        Task<string> UploadImages(IFormFile file, string folder);
    }

    public class ImageService : IImageService
    {
        private readonly IWebHostEnvironment _env;

        public ImageService(IWebHostEnvironment env)
        {
            _env = env;
        }

        public async Task<string> UploadImages(IFormFile file, string folder)
        {
            if(file is null || file.Length == 0)
                throw new ArgumentNullException("File is empty");

            var extension = Path.GetExtension(file.FileName);
            var allowedExtension = new[] { ".jpg", ".jpeg", ".png", ".gif" };
            if (!allowedExtension.Contains(extension.ToLower()))
                throw new ArgumentException("File extension is not allowed");

            var fileName = $"{Guid.NewGuid()}{extension}";

            var savePath = Path.Combine(_env.WebRootPath, "Images", folder, fileName);

            var directory = Path.GetDirectoryName(savePath)!;
            if (!Directory.Exists(directory))
                Directory.CreateDirectory(directory);

            using(var stream = new FileStream(savePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var relativePath = $"/Images/{folder}/{fileName}";
            return relativePath;
        }

    }
}
