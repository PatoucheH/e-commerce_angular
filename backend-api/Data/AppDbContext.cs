using System.Security.Cryptography;
using Microsoft.EntityFrameworkCore;
using backend_api.Models;
using Microsoft.AspNetCore.Components.Server.ProtectedBrowserStorage;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;

public class AppDbContext : IdentityDbContext<ApplicationUser, IdentityRole, string>
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Product> Products { get; set; }
    public DbSet<Order> Orders { get; set; }
    public DbSet<OrderItems> OrderItems { get; set; }
    public DbSet<CartItem> CartItems { get; set; }
    public DbSet<Cart> Carts { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<OrderItems>()
            .HasOne(oi => oi.Order)
            .WithMany(o => o.Items)
            .HasForeignKey(o => o.OrderId);

        modelBuilder.Entity<OrderItems>()
            .HasOne(oi => oi.Product)
            .WithMany()
            .HasForeignKey(o => o.ProductId);

        modelBuilder.Entity<Order>()
            .HasOne<ApplicationUser>()
            .WithMany(u => u.Orders)
            .HasForeignKey(o => o.UserId);

        modelBuilder.Entity<Product>().HasData(
            new Product { Id = 1, Name = "T-shirt", Type = "T-shirt", Price = 19.99m, Stock = 50, ImageUrl = "logo/logo_name.jpg" },
            new Product { Id = 2, Name = "Jean", Type = "Pantalon", Price = 50m, Stock = 50, ImageUrl = "logo/logo_name.jpg" },
            new Product { Id = 3, Name = "Basket", Type = "Chaussures", Price = 79.99m, Stock = 50, ImageUrl = "logo/logo_name.jpg" }
        );
    }


}