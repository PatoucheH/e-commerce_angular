using System;
using System.Security.Cryptography.X509Certificates;


namespace backend_api.Models;
public class Cart
{
	public int Id { get; set; } 
	public int UserId { get; set; }
	public ICollection<CartItem> ItemList { get; set; } = new List<CartItem>();

}
