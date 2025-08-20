
namespace backend_api.Models;

public class Product
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public decimal Price { get; set; }
    public string? Type { get; set; }
    public string? Description { get; set; }
    public string? ImageUrl { get; set; }
    public int Stock { get; set; }
}