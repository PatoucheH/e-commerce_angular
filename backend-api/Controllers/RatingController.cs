using backend_api.Models.DTOs.Product;
using backend_api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend_api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class RatingController :ControllerBase
    {
        private readonly IRatingService _ratingService;

        public RatingController(IRatingService ratingService)
        {
            _ratingService = ratingService;
        }

        [HttpPost]
        public async Task<ActionResult> AddOrUpdateRating([FromBody] CreateRatingDto request)
        {
            try
            {
                var userId = User.Identity?.Name;
                if (userId is null)
                    return Unauthorized("User not authenticated");
                await _ratingService.AddOrUpdateRating(userId, request.ProductId, request.Rating, request.Comment);
                return Ok(new { message = "Rating added/updated successfully !" });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("product/{productId}")]
        public async Task<ActionResult<IEnumerable<RatingDto>>> GetProductRatings(int productId)
        {
            try
            {
                var ratings = await _ratingService.GetProductRatings(productId);
                return Ok(ratings);
            }
            catch(Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("user/{productId}")]
        public async Task<ActionResult<RatingDto>> GetUserRating(int productId)
        {
            try
            {
                var userid = User.Identity?.Name;
                if (userid is null)
                    return Unauthorized("User not authenticated");
                var rating = await _ratingService.GetUserRating(userid, productId);
                if (rating is null)
                    return NotFound("No rating foudn for this user and product");

                return Ok(rating);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpDelete("{productId}")]
        public async Task<ActionResult> DeleteRating(int productId)
        {
            try
            {
                var userId = User.Identity?.Name;
                if (userId is null)
                    return Unauthorized("User not authenticated");
                await _ratingService.DeleteRating(userId, productId);
                return Ok(new { message = "Rating deleted successfullty ! " });
            }
            catch(Exception ex)
            {
                return BadRequest(ex.Message);
            }
        } 
    }
}
