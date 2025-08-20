using backend_api.Models;
using backend_api.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend_api.Services
{
    public class CartService(AppDbContext context)
    {
        private readonly AppDbContext _context = context;
        public async Task<Cart> GetOrCreateCart(int userId)
        {
            var cart = _context.Carts.Where(c => c.UserId == userId).FirstOrDefault();
            if(cart is null)
            {
                 cart = new Cart { UserId = userId };
                _context.Carts.Add(cart);
                await _context.SaveChangesAsync();
            }
            return cart;
        }

        public async Task AddItem(int userId, int productId, int quantity)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user is null)
                throw new Exception("User doesn't exists");

            if (quantity < 1)
                throw new Exception("Quantity muste be higher than one");
            var cart = await _context.Carts.Include(c => c.ItemList).FirstOrDefaultAsync(c => c.UserId == userId);
            if (cart is null)
            {
                cart = new Cart { UserId = userId };
                _context.Carts.Add(cart);
            }
            var product = await _context.Products.FindAsync(productId);
            if (product == null)
                throw new Exception("Product doesn't exist");

            if (product.Stock < quantity)
                throw new Exception("Not enough roducts in stock");

            var cartItem = cart.ItemList.FirstOrDefault(ci => ci.ProductId == productId);
            if (cartItem != null)
                cartItem.Quantity += quantity;
            else
                cartItem = new CartItem
                {
                    Cart = cart,
                    ProductId = productId,
                    Quantity = quantity,
                    UnitPrice = product.Price,
                };

            product.Stock -= quantity;
            await _context.SaveChangesAsync();
        }

        public async Task RemoveItem(int userId, int productId)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user is null)
                throw new Exception("User doesn't exists");

            var cart = await _context.Carts.Include(c => c.ItemList).FirstOrDefaultAsync(c => c.UserId == userId);
            if (cart is null)
                throw new Exception("There is no cart");

            var cartItem = (CartItem)cart.ItemList.Where(i => i.ProductId == productId);
            if (cartItem is null)
                throw new Exception("Product is not in the cart");
            else
                cart.ItemList.Remove(cartItem);



            await _context.SaveChangesAsync();
        }


    }
}
