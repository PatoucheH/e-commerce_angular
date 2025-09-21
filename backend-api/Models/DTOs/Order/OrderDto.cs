namespace backend_api.Models.DTOs.Order
{
    public class OrderDto
    {
        public int Id { get; set; }
        public required string UserId { get; set; }
        public DateTime CreatedAt { get; set; }
        public decimal TotalPrice { get; set; }
        public OrderStatus Status { get; set; } 
        public required string ShippingAddress { get; set; }
        public List<OrderItemDto> ItemList { get; set; } = new();

    }
}
