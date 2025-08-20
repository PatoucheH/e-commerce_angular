using Microsoft.AspNetCore.Identity;
using backend_api.Models;

namespace backend_api.Services;

public class RoleSeederService
{
    private readonly RoleManager<IdentityRole> _roleManager;
    private readonly UserManager<ApplicationUser> _userManager;

    public RoleSeederService(RoleManager<IdentityRole> roleManager, UserManager<ApplicationUser> usermanager)
    {
        _roleManager = roleManager;
        _userManager = usermanager;
    }

    public async Task SeedRolesAndAdminAsync()
    {
        string[] roles = { "Admin", "Seller", "Customer" };

        foreach (var role in roles)
        {
            if (!await _roleManager.RoleExistsAsync(role))
                await _roleManager.CreateAsync(new IdentityRole(role));
        }

        await CreateAdminUserAsync();
    }

    private async Task CreateAdminUserAsync()
    {
        var adminEmail = Environment.GetEnvironmentVariable("ADMIN_EMAIL") ?? "MyEmail@hotmail.com";
        var adminPassword = Environment.GetEnvironmentVariable("ADMIN_PASSWORD");
        if (adminPassword is null)
        {
            Console.WriteLine("The password is null");
            return;
        }

        var existingAdmin = await _userManager.FindByEmailAsync(adminEmail);
        if (existingAdmin is null)
        {
            var adminUser = new ApplicationUser
            {
                UserName = adminEmail,
                Email = adminEmail,
                EmailConfirmed = true,
                FirstName = "Hugo",
                LastName = "Me",
            };

            var result = await _userManager.CreateAsync(adminUser, adminPassword);
            if (result.Succeeded)
            {
                await _userManager.AddToRoleAsync(adminUser, "Admin");
                Console.WriteLine($"Admin created with email : {adminEmail}");
            }
            else
            {
                Console.WriteLine("Error while creating the admin");
                foreach (var error in result.Errors)
                    Console.WriteLine($"- {error.Description}");
            }
        }
    }
}