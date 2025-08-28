using System.ComponentModel.DataAnnotations;

namespace backend_api.Models.DTOs.Product
{
    public class CreateRatingDto
    {
        public int ProductId { get; set; }
        [Range(1, 5)]
        public int Rating { get; set; }
        public string Comment { get; set; } = string.Empty;
    }
}
