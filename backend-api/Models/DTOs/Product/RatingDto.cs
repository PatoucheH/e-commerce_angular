namespace backend_api.Models.DTOs.Product
{
    public class RatingDto
    {
        public int Id { get; set; }
        public required string UserId { get; set; }
        public string? UserName { get; set; }
        public int ProductId { get; set; }
        public int Rating { get; set; }
        public string? Comment { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
