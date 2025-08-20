namespace backend_api.Models;

public class OrderItems
{
    public int Id { get; set; }
    public int OrderId { get; set; }
    public int ProductId { get; set; }
    public int Quantity { get; set; }
    public decimal UnitaryPrice { get; set; }

    public required Order Order { get; set; }
    public required Product Product { get; set; }
}