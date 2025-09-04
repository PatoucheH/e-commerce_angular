using System.ComponentModel.DataAnnotations.Schema;

namespace backend_api.Models;

public class Product
{
    public int Id { get; set; }
    public required string SellerId { get; set; }
    public required string Name { get; set; }
    public decimal Price { get; set; }
    public string? Type { get; set; }
    public string? Description { get; set; }
    public string? ImageUrl { get; set; }
    public int Stock { get; set; }

    public virtual ICollection<ProductsRatings> Ratings { get; set; } = new List<ProductsRatings>();
    [NotMapped]
    public double AverageRatings => Ratings.Any() ? Ratings.Average(r => r.Rating) : 0;
    [NotMapped]
    public int TotalRatings => Ratings.Count;
}