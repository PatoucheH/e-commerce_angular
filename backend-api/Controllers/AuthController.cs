using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using backend_api.Models;
using backend_api.Models.DTOs.Auth;

namespace backend_api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly SignInManager<ApplicationUser> _signInManager;

    public AuthController(
        UserManager<ApplicationUser> userManager,
        SignInManager<ApplicationUser> signInManager)
    {
        _userManager = userManager;
        _signInManager = signInManager;
    }

    [HttpPost("register")]
    public async Task<ActionResult> Register(RegisterDto model)
    {
        var user = new ApplicationUser
        {
            UserName = model.Email,
            Email = model.Email,
            FirstName = model.FirstName,
            LastName = model.LastName,
        };

        var result = await _userManager.CreateAsync(user, model.Password);

        if (result.Succeeded)
            return Ok(new { success = true, message = "User successfully created!" });

        return BadRequest(new { success = false, errors = result.Errors });
    }

    [HttpPost("login")]
    public async Task<ActionResult> Login(LoginDto model)
    {
        var user = await _userManager.FindByEmailAsync(model.Email);
        if (user is null)
            return Unauthorized(new { success = false, message = "Email or password incorrect!" });

        var result = await _signInManager.PasswordSignInAsync(
            user,
            model.Password,
            isPersistent: true, // Cookie persistant (reste après fermeture navigateur)
            lockoutOnFailure: false);

        if (result.Succeeded)
        {
            return Ok(new
            {
                success = true,
                message = "Login successful",
                user = new
                {
                    id = user.Id,
                    email = user.Email,
                    firstName = user.FirstName,
                    lastName = user.LastName,
                }
            });
        }

        return Unauthorized(new { success = false, message = "Email or password incorrect!" });
    }

    [HttpPost("logout")]
    public async Task<ActionResult> Logout()
    {
        await _signInManager.SignOutAsync();
        return Ok(new { success = true, message = "Successfully logged out" });
    }

    [HttpGet("user")]
    [Authorize]
    public async Task<IActionResult> GetCurrentUser()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (string.IsNullOrEmpty(userId))
            return Unauthorized(new { success = false, message = "Not authenticated" });

        var user = await _userManager.FindByIdAsync(userId);

        if (user == null)
            return Unauthorized(new { success = false, message = "User not found" });

        var roles = await _userManager.GetRolesAsync(user);

        return Ok(new
        {
            success = true,
            isAuthenticated = true,
            user = new
            {
                id = user.Id,
                email = user.Email,
                firstName = user.FirstName,
                lastName = user.LastName,
                roles = roles
            }
        });
    }

    [HttpPut("profile")]
    [Authorize]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDto request)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (string.IsNullOrEmpty(userId))
            return Unauthorized(new { success = false, message = "Token invalide" });

        var user = await _userManager.FindByIdAsync(userId);

        if (user == null)
            return NotFound(new { success = false, message = "Utilisateur non trouvé" });

        user.FirstName = request.FirstName;
        user.LastName = request.LastName;
        user.Email = request.Email;
        user.UserName = request.Email;

        var result = await _userManager.UpdateAsync(user);

        if (result.Succeeded)
        {
            return Ok(new
            {
                success = true,
                user = new
                {
                    id = user.Id,
                    email = user.Email,
                    firstName = user.FirstName,
                    lastName = user.LastName
                }
            });
        }

        return BadRequest(new { success = false, message = "Erreur lors de la mise à jour", errors = result.Errors });
    }

    [HttpPut("change-password")]
    [Authorize]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto request)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (string.IsNullOrEmpty(userId))
            return Unauthorized(new { success = false, message = "Token invalide" });

        var user = await _userManager.FindByIdAsync(userId);

        if (user == null)
            return NotFound(new { success = false, message = "Utilisateur non trouvé" });

        var result = await _userManager.ChangePasswordAsync(user, request.CurrentPassword, request.NewPassword);

        if (result.Succeeded)
        {
            return Ok(new { success = true, message = "Mot de passe modifié avec succès" });
        }

        return BadRequest(new { success = false, message = "Mot de passe actuel incorrect", errors = result.Errors });
    }

    // Endpoint utile pour vérifier le statut d'authentification côté Angular
    [HttpGet("check-auth")]
    public async Task<IActionResult> CheckAuth()
    {
        if (User.Identity?.IsAuthenticated == true)
        {
            return await GetCurrentUser();
        }

        return Ok(new { success = true, isAuthenticated = false });
    }
}