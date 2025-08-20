using Microsoft.EntityFrameworkCore;
using DotNetEnv;
using backend_api.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using backend_api.Services;
using Microsoft.AspNetCore.Identity.UI.Services;



namespace backend_api;

public class Program
{
    public static async Task Main(string[] args)
    {

        Env.Load();
        var builder = WebApplication.CreateBuilder(args);

        //Postgre copnnection

        var connectionString = $"Host={Environment.GetEnvironmentVariable("DB_HOST")};" +
                                $"Port={Environment.GetEnvironmentVariable("DB_PORT")};" +
                                $"Database={Environment.GetEnvironmentVariable("DB_NAME")};" +
                                $"Username={Environment.GetEnvironmentVariable("DB_USER")};" +
                                $"Password={Environment.GetEnvironmentVariable("DB_PASSWORD")}";

        builder.Services.AddDbContext<AppDbContext>(options =>
            options.UseNpgsql(connectionString));

        //Identity 
        builder.Services.AddIdentity<ApplicationUser, IdentityRole>(options =>
        {
            options.Password.RequiredLength = 6;
            options.Password.RequireDigit = true;
            options.Password.RequireLowercase = true;
            options.Password.RequireUppercase = true;
            options.Password.RequireNonAlphanumeric = true;

            options.User.RequireUniqueEmail = true;

            options.SignIn.RequireConfirmedEmail = false;
        })
        .AddEntityFrameworkStores<AppDbContext>()
        .AddDefaultTokenProviders();

        if (builder.Environment.IsDevelopment())
            builder.Services.AddSingleton<IEmailSender, NoOpEmailSender>();

        //JWT

        var secretKey = Environment.GetEnvironmentVariable("JWT_SECRET") ?? "Your-super-secret_key_very_long123 ";
        var issuer = builder.Environment.IsDevelopment() ? "http://localhost:5147" : builder.Configuration["JwtSettings:Issuer"];
        var audience = builder.Environment.IsDevelopment() ? "https://localhost:4200" : builder.Configuration["JwtSettings:Audience"];

        builder.Services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        })
        .AddJwtBearer(options =>
        {
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                ValidIssuer = issuer,
                ValidAudience = audience,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey))
            };
        });

        //Services
        builder.Services.AddScoped<RoleSeederService>();
        builder.Services.AddControllers();
        builder.Services.AddEndpointsApiExplorer();
        builder.Services.AddSwaggerGen();

        // CORS Angular
        var allowedOrigins = builder.Environment.IsDevelopment()
            ? new[] { "http://localhost:4200", "https://localhost:4200" }
            : builder.Configuration.GetSection("AllowedOrigins").Get<string[]>() ?? new[] { "https://yourdomain.com" };


        builder.Services.AddCors(options =>
        {
            options.AddPolicy("AngularApp", policy =>
            {
                policy.WithOrigins(allowedOrigins)
                    .AllowAnyMethod()
                    .AllowAnyHeader();
            });
        });

        var app = builder.Build();

        //Pipeline
        if (app.Environment.IsDevelopment())
        {
            app.UseSwagger();
            app.UseSwaggerUI();
        }

        app.UseCors("AngularApp");
        app.UseAuthentication();
        app.UseAuthorization();
        app.MapControllers();


        // Initialisation Roles
        using (var scope = app.Services.CreateScope())
        {
            var roleSeeder = scope.ServiceProvider.GetRequiredService<RoleSeederService>();
            await roleSeeder.SeedRolesAndAdminAsync();
        }


        app.Run();

    }

}