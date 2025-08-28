namespace backend_api.Models
{
    public class CartItem
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public Product? product { get; set; }
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public int CartId { get; set; }
        public Cart? Cart  {get;set;}
    }
}
