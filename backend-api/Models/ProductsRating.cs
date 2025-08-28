using System.ComponentModel.DataAnnotations;

namespace backend_api.Models
{
    public class ProductsRatings
    {
        public int Id { get; set; }
        public required string UserId { get; set; }
        public int ProductId { get; set; }
        [Range(1, 5)]
        public int Rating { get; set; }
        public string? Comment { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public required ApplicationUser User { get; set; }
        public required Product Product { get; set; }
    }
}
