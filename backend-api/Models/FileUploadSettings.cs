namespace backend_api.Models
{
    public class FileUploadSettings
    {
        public int MaxSizeInMB { get; set; }
        public string[] AllowedImagesPath { get; set; } = Array.Empty<string>();
        public string ProductImagePath { get; set; } = string.Empty;

    }
}
