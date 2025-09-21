using backend_api.Models;
using backend_api.Models.DTOs;
using backend_api.Models.DTOs.Order;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;

namespace backend_api.Services
{
    public interface IOrderService
    {
        public Task<OrderDto> CreateOrderFromCart(string userId, string shippingAddress);
        public Task<IEnumerable<OrderDto>> GetUserOrders(string userId);
        public Task<OrderDto> GetOrderById(int orderId);
        public Task UpdateOrderByStatus(int orderId, OrderStatus newStatus);
        public Task<IEnumerable<OrderDto>> GetAllOrders();
        public Task<OrderStatisticsDto> GetOrderStatistics();
    }

    public class OrderService : IOrderService
    {
        private readonly AppDbContext _context;

        public OrderService(AppDbContext context)
        {
            _context = context;
        }
        public async Task<OrderDto> CreateOrderFromCart(string userId, string shippingAddress)
        {
            var cart = await _context.Carts.Include(c => c.ItemList).FirstOrDefaultAsync(c => c.UserId == userId);
            if (cart is null)
                throw new Exception("The cart doesn't exists");

            if (!cart.ItemList.Any())
                throw new Exception("Cart is empty");

            var order = new Order { UserId = userId, ShippingAddress = shippingAddress };

            foreach (var item in cart.ItemList)
            {
                var product = await _context.Products.FindAsync(item.ProductId);
                if (product == null)
                {
                    throw new Exception($"Le produit {item.ProductId} n'existe pas.");
                }

                order.Items.Add(new OrderItems
                {
                    ProductId = item.ProductId,
                    ProductName = product.Name,
                    Quantity = item.Quantity,
                    UnitPrice = item.UnitPrice,
                });
            }


            order.Total = cart.ItemList.Sum(item => item.Quantity * item.UnitPrice);

            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            _context.CartItems.RemoveRange(cart.ItemList);
            cart.ItemList.Clear();
            await _context.SaveChangesAsync();

            return new OrderDto
            {
                Id = order.Id,
                UserId = order.UserId,
                Status = order.Status,
                TotalPrice = order.Total,
                ShippingAddress = shippingAddress
            };
        }

        public async Task<IEnumerable<OrderDto>> GetUserOrders(string userId)
        {
            var orders = await _context.Orders.Where(o => o.UserId == userId).Include(o => o.Items).ToListAsync();

            var ordersDtos = orders.Select(order => new OrderDto
            {
                Id = order.Id,
                UserId = order.UserId,
                CreatedAt = order.CreatedAt,
                TotalPrice = order.Total,
                Status = order.Status,
                ShippingAddress = order.ShippingAddress,
                ItemList = order.Items.Select(item => new OrderItemDto
                {
                    Id = item.Id,
                    ProductId = item.ProductId,
                    ProductName = item.ProductName,
                    Quantity = item.Quantity,
                    UnitPrice = item.UnitPrice,
                }).ToList()
            }).ToList();
            return ordersDtos;
        }

        public async Task<OrderDto> GetOrderById(int orderId)
        {
            var order = await _context.Orders.Include(o => o.Items).FirstOrDefaultAsync(o => o.Id == orderId);
            if (order is null)
                throw new Exception("Order doesn't exists");

            return new OrderDto
            {
                Id = order.Id,
                UserId = order.UserId,
                TotalPrice = order.Total,
                Status = order.Status,
                ShippingAddress = order.ShippingAddress,
                ItemList = order.Items.Select(item => new OrderItemDto
                {
                    Id = item.Id,
                    ProductId = item.ProductId,
                    ProductName = item.ProductName,
                    Quantity = item.Quantity,
                    UnitPrice = item.UnitPrice,

                }).ToList(),
            };
        }
        public async Task UpdateOrderByStatus(int orderId, OrderStatus newStatus)
        {
            var order = await _context.Orders.FindAsync(orderId);
            if (order is null)
                throw new Exception("Order not found");
            order.Status = newStatus;
            await _context.SaveChangesAsync();
            Console.WriteLine($"Status successfully changed in {newStatus}");
        }
        public async Task<IEnumerable<OrderDto>> GetAllOrders()
        {
            var orders = await _context.Orders
                .Include(o => o.Items)
                .OrderByDescending(o => o.CreatedAt)
                .ToListAsync();

            return orders.Select(order => new OrderDto
            {
                Id = order.Id,
                UserId = order.UserId,
                TotalPrice = order.Total,
                Status = order.Status,
                ShippingAddress = order.ShippingAddress,
                CreatedAt = order.CreatedAt,
                ItemList = order.Items.Select(item => new OrderItemDto
                {
                    Id = item.Id,
                    ProductId = item.ProductId,
                    ProductName = item.ProductName,
                    Quantity = item.Quantity,
                    UnitPrice = item.UnitPrice,
                }).ToList()
            }).ToList();
        }

        public async Task<OrderStatisticsDto> GetOrderStatistics()
        {
            var orders = await _context.Orders.ToListAsync();

            return new OrderStatisticsDto
            {
                TotalOrders = orders.Count,
                PendingOrders = orders.Count(o => o.Status == OrderStatus.Pending),
                ConfirmedOrders = orders.Count(o => o.Status == OrderStatus.Confirmed),
                ShippedOrders = orders.Count(o => o.Status == OrderStatus.Shipped),
                DeliveredOrders = orders.Count(o => o.Status == OrderStatus.Delivered),
                TotalRevenue = orders.Sum(o => o.Total),
                AverageOrderValue = orders.Any() ? orders.Average(o => o.Total) : 0
            };
        }
    }
}
