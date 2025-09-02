using backend_api.Models;
using backend_api.Models.DTOs;
using backend_api.Models.DTOs.Cart;
using Microsoft.EntityFrameworkCore;

namespace backend_api.Services
{

    public interface ICartService
    {
        public Task<CartDto> GetOrCreateCart(string userId);
        public Task AddItem(string userId, string productName, int productId, int quantity);
        public Task RemoveItem(string userId, int productId);

    }

    public class CartService(AppDbContext context) : ICartService
    {
        private readonly AppDbContext _context = context;

        private CartDto MapToDto(Cart cart)
        {
            return new CartDto
            {
                Id = cart.Id,
                UserId = cart.UserId,
                ItemList = cart.ItemList.Select(item => new CartItemDto
                {
                    Id = item.Id,
                    ProductName = item.ProductName,
                    ProductId = item.ProductId,
                    Quantity = item.Quantity,
                    UnitPrice = item.UnitPrice
                }).ToList(),
                TotalPrice = cart.ItemList.Sum(item => item.Quantity * item.UnitPrice)
            };
        }

        public async Task<CartDto> GetOrCreateCart(string userId)
        {
            var cart = await _context.Carts.Include(c => c.ItemList).FirstOrDefaultAsync(c => c.UserId == userId);
            if (cart is null)
            {
                cart = new Cart { UserId = userId };
                _context.Carts.Add(cart);
                await _context.SaveChangesAsync();
            }
            return MapToDto(cart);
        }

        public async Task AddItem(string userId, string productName, int productId, int quantity)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user is null)
                throw new Exception("User doesn't exists");

            if (quantity < 1)
                throw new Exception("Quantity muste be at least one");
            var cart = await _context.Carts.Include(c => c.ItemList).FirstOrDefaultAsync(c => c.UserId == userId);
            if (cart is null)
            {
                cart = new Cart { UserId = userId };
                _context.Carts.Add(cart);
                await _context.SaveChangesAsync();
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
            {
                cartItem = new CartItem
                {
                    CartId = cart.Id,
                    ProductName = productName,
                    ProductId = productId,
                    Quantity = quantity,
                    UnitPrice = product.Price,
                };
                cart.ItemList.Add(cartItem);
            }

            product.Stock -= quantity;
            await _context.SaveChangesAsync();
        }

        public async Task RemoveItem(string userId, int productId)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user is null)
                throw new Exception("User doesn't exists");

            var product = await _context.Products.FindAsync(productId);
            if (product is null)
                throw new Exception("Product doens't exists");

            var cart = await _context.Carts.Include(c => c.ItemList).FirstOrDefaultAsync(c => c.UserId == userId);
            if (cart is null)
                throw new Exception("There is no cart");

            var cartItem = cart.ItemList.FirstOrDefault(i => i.ProductId == productId);
            if (cartItem is null)
                throw new Exception("Product is not in the cart");

            cart.ItemList.Remove(cartItem);
            product.Stock += cartItem.Quantity;

            await _context.SaveChangesAsync();
        }


    }
}
