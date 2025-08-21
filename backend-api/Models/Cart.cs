using System;
using System.ComponentModel.DataAnnotations.Schema;
using System.Security.Cryptography.X509Certificates;


namespace backend_api.Models;
public class Cart
{
	public int Id { get; set; } 
	public required string UserId { get; set; }
	public ICollection<CartItem> ItemList { get; set; } = new List<CartItem>();
    [NotMapped]
    public decimal TotalPrice => ItemList?.Sum(item => item.Quantity * item.UnitPrice) ?? 0;
}