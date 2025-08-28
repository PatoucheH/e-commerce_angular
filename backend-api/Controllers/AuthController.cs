using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.Authorization; // AJOUT IMPORTANT
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using backend_api.Models;
using backend_api.Models.DTOs.Auth;

namespace backend_api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly SignInManager<ApplicationUser> _signInManager;
    private readonly IConfiguration _configuration;

    public AuthController(UserManager<ApplicationUser> userManager, SignInManager<ApplicationUser> signInManager, IConfiguration configuration)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _configuration = configuration;
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

        if (result.Succeeded) return Ok(new { message = "User successfully created ! " });

        return BadRequest(result.Errors);
    }

    [HttpPost("login")]
    public async Task<ActionResult> Login(LoginDto model)
    {
        var user = await _userManager.FindByEmailAsync(model.Email);
        if (user is null) return Unauthorized(new { message = "Email or password incorrect ! " });

        var result = await _signInManager.CheckPasswordSignInAsync(user, model.Password, false);

        if (result.Succeeded)
        {
            var token = await GenerateJwtToken(user);
            return Ok(new
            {
                token = token,
                user = new
                {
                    id = user.Id,
                    email = user.Email,
                    firstName = user.FirstName,
                    lastName = user.LastName,
                }
            });
        }
        return Unauthorized(new { message = "Email or password incorrect ! " });
    }

    [HttpPost("logout")]
    public async Task<ActionResult> Logout()
    {
        await _signInManager.SignOutAsync();
        return Ok(new { message = "Deconnected " });
    }

    [HttpPut("profile")]
    [Authorize] // Attribut d'autorisation
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDto request)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        
        if (string.IsNullOrEmpty(userId))
            return Unauthorized(new { message = "Token invalide" });
            
        var user = await _userManager.FindByIdAsync(userId);
        
        if (user == null)
            return NotFound(new { message = "Utilisateur non trouvé" });

        user.FirstName = request.FirstName;
        user.LastName = request.LastName;
        user.Email = request.Email;
        user.UserName = request.Email;

        var result = await _userManager.UpdateAsync(user);
        
        if (result.Succeeded)
        {
            return Ok(new 
            {
                id = user.Id,
                email = user.Email,
                firstName = user.FirstName,
                lastName = user.LastName
            });
        }

        return BadRequest(new { message = "Erreur lors de la mise à jour" });
    }

    [HttpPut("change-password")]
    [Authorize] // Attribut d'autorisation
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto request)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        
        if (string.IsNullOrEmpty(userId))
            return Unauthorized(new { message = "Token invalide" });
            
        var user = await _userManager.FindByIdAsync(userId);
        
        if (user == null)
            return NotFound(new { message = "Utilisateur non trouvé" });

        var result = await _userManager.ChangePasswordAsync(user, request.CurrentPassword, request.NewPassword);
        
        if (result.Succeeded)
        {
            return Ok(new { message = "Mot de passe modifié avec succès" });
        }

        return BadRequest(new { message = "Mot de passe actuel incorrect" });
    }

    private async Task<string> GenerateJwtToken(ApplicationUser user)
    {
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id),
            new Claim(ClaimTypes.Email, user.Email!),
            new Claim(ClaimTypes.Name, user.UserName!),
            new Claim("firstName", user.FirstName),
            new Claim("lastName", user.LastName)
        };

        var roles = await _userManager.GetRolesAsync(user);
        foreach (var role in roles)
            claims.Add(new Claim(ClaimTypes.Role, role));

        var secretKey = Environment.GetEnvironmentVariable("JWT_SECRET") ?? "Your-super-secret_key_very_long123";
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var token = new JwtSecurityToken(
            issuer: "http://localhost:5147",
            audience: "https://localhost:4200",
            claims: claims,
            expires: DateTime.Now.AddDays(30),
            signingCredentials: creds
        );
        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}