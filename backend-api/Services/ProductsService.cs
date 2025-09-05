using Microsoft.AspNetCore.Mvc;
using System;
using Microsoft.EntityFrameworkCore;
using backend_api.Models;

namespace backend_api.Services;

public interface IProductsService
{
    public Task<IEnumerable<ProductDto>> GetProducts(string? search, decimal? minPrice, decimal? maxPrice, string? type);
    public Task<ProductDto> GetProductById(int id);
    public Task AddProduct(Product product);
    public Task UpdateProduct(int id, Product product);
    public Task DeleteProduct(int id);
    public Task<List<ProductDto>> GetBestProductsByRatings(int nbrProduct);
}


public class ProductsService : IProductsService
{
    private readonly AppDbContext _context;

    public ProductsService(AppDbContext context)
    {
        _context = context;
    }


    public async Task<IEnumerable<ProductDto>> GetProducts(string? search, decimal? minPrice, decimal? maxPrice, string? type)
    {
        var query = _context.Products.Include(p => p.Ratings).AsQueryable();
        if (!string.IsNullOrEmpty(search))
            query = query.Where(p => p.Name.ToLower().Contains(search.ToLower()));

        if (minPrice.HasValue)
            query = query.Where(p => p.Price >= minPrice.Value);

        if (maxPrice.HasValue)
            query = query.Where(p => p.Price <= maxPrice.Value);

        if (!string.IsNullOrWhiteSpace(type))
            query = query.Where(p => p.Type == type);

        var products = await query.ToListAsync();

        return products.Select(p => new ProductDto
        {
            Id = p.Id,
            Name = p.Name,
            SellerId = p.SellerId,
            Price = p.Price,
            Type = p.Type,
            Description = p.Description,
            ImageUrl = p.ImageUrl,
            Stock = p.Stock,
            AverageRating = p.Ratings.Any() ? p.Ratings.Average(r => r.Rating) : 0,
            TotalRatings = p.Ratings.Count
        }).ToList();
    }

    public async Task<ProductDto> GetProductById(int id)
    {
        var product = await _context.Products.Include(p => p.Ratings).FirstOrDefaultAsync(p => p.Id == id);
        if (product is null)
            throw new Exception("Product doesn't exists");
        return new ProductDto
        {
            Id = id,
            Name = product.Name,
            SellerId = product.SellerId,
            Price = product.Price,
            Type = product.Type,
            Description = product.Description,
            ImageUrl = product.ImageUrl,
            Stock = product.Stock,
            AverageRating = product.Ratings.Any() ? product.Ratings.Average(r => r.Rating) : 0,
            TotalRatings = product.Ratings.Count
        };
    }

    public async Task AddProduct(Product product)
    {
        _context.Products.Add(product);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateProduct(int id, Product product)
    {
        if (id != product.Id) throw new Exception("There aren't product with this id");

        _context.Entry(product).State = EntityState.Modified;
        await _context.SaveChangesAsync();
    }

    public async Task DeleteProduct(int id)
    {
        var product = await _context.Products.FindAsync(id);
        if (product == null)
            throw new Exception("Product not found");
        _context.Products.Remove(product);
        await _context.SaveChangesAsync();
    }

    public async Task<List<ProductDto>> GetBestProductsByRatings(int nbrProduct)
    {
        return await _context.Products.Select(p =>
        new ProductDto
        {
            Id = p.Id,
            Name = p.Name,
            SellerId = p.SellerId,
            Price = p.Price,
            Type = p.Type,
            Description = p.Description,
            ImageUrl = p.ImageUrl,
            Stock = p.Stock,
            AverageRating = p.Ratings.Any() ? p.Ratings.Average(r => r.Rating) : 0,
            TotalRatings = p.Ratings.Count(),
        })
        .OrderByDescending(p => p.AverageRating)
        .ThenByDescending(p => p.TotalRatings)
        .Take(nbrProduct)
        .ToListAsync();

    }
}
