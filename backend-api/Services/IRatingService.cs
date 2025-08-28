using backend_api.Models;
using backend_api.Models.DTOs.Product;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace backend_api.Services
{
    public interface IRatingService
    {
        Task AddOrUpdateRating(string userId, int productId, int rating, string comment);
        Task<IEnumerable<RatingDto>> GetProductRatings(int productId);
        Task<RatingDto?> GetUserRating(string userId, int productId);
        Task DeleteRating(string userId, int productId);
    }

    public class RatingService : IRatingService
    {
        private readonly AppDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;

        public RatingService(AppDbContext context, UserManager<ApplicationUser> userManager)
        {
            _userManager = userManager;
            _context = context;
        }
        public async Task AddOrUpdateRating(string userId, int productId, int rating, string comment)
        {
            if (rating < 1 || rating > 5)
                throw new ArgumentException("Rating must be between 1 and 5");
            var user = await _userManager.Users.FirstOrDefaultAsync(u => u.Id == userId);
            if (user is null)
                throw new Exception("User not found");
            
            var product = await _context.Products.Include(p => p.Ratings).FirstOrDefaultAsync(p => p.Id == productId);
            if (product is null)
                throw new Exception("Product not found");
            var rateOfUser = product.Ratings.FirstOrDefault(r => r.UserId == userId);
            if(rateOfUser is null)
            {
                product.Ratings.Add(new ProductsRatings
                {
                    UserId = userId,
                    ProductId = productId,
                    Rating = rating,
                    Comment = comment,
                    User = user,
                    Product = product,
                });
            }
            else
            {
                rateOfUser.Comment = comment;
                rateOfUser.Rating = rating;
            }
            await _context.SaveChangesAsync();
        }

        public async Task<IEnumerable<RatingDto>> GetProductRatings(int productId)
        {
            var ratings = await _context.Ratings.Include(r => r.User).Where(r => r.ProductId == productId).ToListAsync();
            return ratings.Select(r => new RatingDto
            {
                Id = r.Id,
                UserId = r.UserId,
                UserName = r.User.UserName,
                ProductId = productId,
                Rating = r.Rating,
                Comment = r.Comment,
                CreatedAt = r.CreatedAt,
            }).OrderByDescending(r => r.CreatedAt).ToList();
        }

        public async Task<RatingDto?> GetUserRating(string userId, int productId)
        {
            var rating = await _context.Ratings.Include(r => r.User).FirstOrDefaultAsync(r => r.UserId == userId && r.ProductId == productId);
            if (rating is null)
                return null;
            return new RatingDto
            {
                Id = rating.Id,
                UserId = rating.UserId,
                UserName = rating.User.UserName,
                ProductId = rating.ProductId,
                Rating = rating.Rating,
                Comment = rating.Comment,
                CreatedAt = rating.CreatedAt,
            };

        }

        public async Task DeleteRating(string userId, int productId)
        {
            var rating = await _context.Ratings.FirstOrDefaultAsync(r => r.UserId == userId && r.ProductId == productId);
            if (rating is null) 
                throw new Exception("Rating not found");
            _context.Ratings.Remove(rating);
            await _context.SaveChangesAsync();
        }
    }

}
