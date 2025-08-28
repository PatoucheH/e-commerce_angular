namespace backend_api.Models;

public class Order
{
    public int Id { get; set; }
    public required string UserId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public decimal Total { get; set; }
    public OrderStatus Status { get; set; } = OrderStatus.Pending;
    public string ShippingAddress { get; set; } = string.Empty;
    public virtual List<OrderItems> Items { get; set; } = new List<OrderItems>();

}