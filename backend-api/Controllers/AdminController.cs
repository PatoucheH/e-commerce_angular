using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend_api.Models;

namespace backend_api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;

    public AdminController(UserManager<ApplicationUser> userManager)
    {
        _userManager = userManager;
    }

    [HttpGet("users")]
    public async Task<ActionResult> GetAllUsers()
    {
        var users = await _userManager.Users.Select(u => new
        {
            u.Id,
            u.Email,
            u.FirstName,
            u.LastName,
            u.CreatedAt,
            Roles = _userManager.GetRolesAsync(u).Result
        }).ToListAsync();

        return Ok(users);
    }

    [HttpPost("users/{userId}/promote-to-seller")]
    public async Task<ActionResult> PromoteToSeller(string userId)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user is null)
            return NotFound("User not find");

        var currentRoles = await _userManager.GetRolesAsync(user);
        if (currentRoles.Contains("Customer"))
            await _userManager.RemoveFromRoleAsync(user, "Customer");

        if (!currentRoles.Contains("Seller"))
            await _userManager.AddToRoleAsync(user, "Seller");

        return Ok(new { message = $"{user.Email} is now a seller" });
    }

    [HttpPost("users/{userId}/demote-to-cutomer")]
    public async Task<ActionResult> DemoteToCustomer(string userId)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user is null)
            return NotFound("User not found");

        var currentRoles = await _userManager.GetRolesAsync(user);

        if (currentRoles.Contains("Seller"))
            await _userManager.RemoveFromRoleAsync(user, "Seller");

        if (!currentRoles.Contains("Customer"))
            await _userManager.AddToRoleAsync(user, "Customer");

        return Ok(new { message = $"{user.Email} is now a customer" });
    }

    [HttpDelete("users/{userId}")]
    public async Task<ActionResult> DeleteUser(string userId)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user is null)
            return NotFound("User not found");

        var admins = await _userManager.GetUsersInRoleAsync("Admin");
        if (admins.Count == 1 && admins.Contains(user))
            return BadRequest("Impossible to delete the last admin");

        var result = await _userManager.DeleteAsync(user);
        if (result.Succeeded)
            return Ok(new { message = "User deleted " });

        return BadRequest(result.Errors);

    }


}