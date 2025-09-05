using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend_api.Services;
using backend_api.Models;

namespace backend_api;

[ApiController]
[Microsoft.AspNetCore.Mvc.Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly IProductsService _productsService;

    public ProductsController(IProductsService productsService)
    {
        _productsService = productsService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ProductDto>>> GetProducts([FromQuery] string? search, [FromQuery] decimal? minPrice, [FromQuery] decimal? maxPrice, [FromQuery] string? type)
    {
        var products = await _productsService.GetProducts(search, minPrice, maxPrice, type);
        Console.WriteLine(products);
        return Ok(products);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Product>> GetProduct(int id)
    {
        var product = await _productsService.GetProductById(id);
        return Ok(product);
    }


    [HttpPost]
    public async Task<ActionResult> PostProduct(Product product)
    {
        await _productsService.AddProduct(product);
        return CreatedAtAction(nameof(GetProduct), new { id = product.Id }, product);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult> UpdateProduct(int id, Product product)
    {
        await _productsService.UpdateProduct(id, product);
        return Ok();
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteProduct(int id)
    {
        await _productsService.DeleteProduct(id);
        return Ok();
    }

    [HttpGet("top-rated")]
    public async Task<IActionResult> GetTopRated([FromQuery] int count = 3)
    {
        var products = await _productsService.GetBestProductsByRatings(count);
        return Ok(products);
    }


}