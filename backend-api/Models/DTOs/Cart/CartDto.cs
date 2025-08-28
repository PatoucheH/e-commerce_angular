namespace backend_api.Models.DTOs.Cart;
public class CartDto
{
    public int Id { get; set; }
    public required string UserId { get; set; }
    public List<CartItemDto> ItemList { get; set; } = new();
    public decimal TotalPrice { get; set; }
}
