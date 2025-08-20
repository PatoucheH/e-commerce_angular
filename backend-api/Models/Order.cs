
namespace backend_api.Models;

public class Order
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public decimal Total { get; set; }
    public required string Status { get; set; }
    public string ShippingAddress { get; set; } = string.Empty;
    public virtual ICollection<OrderItems> Items { get; set; } = new List<OrderItems>();

}