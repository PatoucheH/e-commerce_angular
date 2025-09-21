using Microsoft.EntityFrameworkCore;
using DotNetEnv;
using backend_api.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Authentication.Cookies;
using backend_api.Services;
using Microsoft.AspNetCore.Identity.UI.Services;
using Microsoft.OpenApi.Models;
using Microsoft.Extensions.FileProviders;

namespace backend_api;

public class Program
{
    public static async Task Main(string[] args)
    {
        var envPath = Path.Combine(
            Directory.GetParent(Directory.GetCurrentDirectory())!.FullName,
            ".env"
        );
        Env.Load(envPath);
        var builder = WebApplication.CreateBuilder(args);

        //Postgre connection
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

        // Configuration Cookie Authentication (remplace JWT)
        builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
            .AddCookie(options =>
            {
                options.Cookie.Name = "AuthCookie";
                options.Cookie.HttpOnly = true;
                options.Cookie.SecurePolicy = builder.Environment.IsDevelopment()
                    ? CookieSecurePolicy.SameAsRequest
                    : CookieSecurePolicy.Always;
                options.Cookie.SameSite = SameSiteMode.Lax;
                options.ExpireTimeSpan = TimeSpan.FromDays(30);
                options.SlidingExpiration = true;

                // CORRECTION IMPORTANTE : Gestion spécifique pour les API
                options.Events.OnRedirectToLogin = context =>
                {
                    // Vérifier si c'est une requête API
                    if (context.Request.Path.StartsWithSegments("/api") &&
                        context.Response.StatusCode == 200) // Seulement si pas encore défini
                    {
                        context.Response.StatusCode = 401;
                        context.Response.Headers["Content-Type"] = "application/json";
                        return context.Response.WriteAsync("{\"message\":\"Non authentifié\"}");
                    }
                    // Pour les autres requêtes, comportement par défaut
                    return Task.CompletedTask;
                };

                options.Events.OnRedirectToAccessDenied = context =>
                {
                    if (context.Request.Path.StartsWithSegments("/api") &&
                        context.Response.StatusCode == 200)
                    {
                        context.Response.StatusCode = 403;
                        context.Response.Headers["Content-Type"] = "application/json";
                        return context.Response.WriteAsync("{\"message\":\"Accès refusé\"}");
                    }
                    return Task.CompletedTask;
                };
            });

        // Swagger 
        builder.Services.AddSwaggerGen(c =>
        {
            c.SwaggerDoc("v1", new OpenApiInfo { Title = "backend_api", Version = "v1" });
        });

        //Services
        builder.Services.AddScoped<RoleSeederService>();
        builder.Services.AddScoped<ICartService, CartService>();
        builder.Services.AddScoped<IProductsService, ProductsService>();
        builder.Services.AddScoped<IOrderService, OrderService>();
        builder.Services.AddScoped<IImageService, ImageService>();
        builder.Services.AddScoped<IRatingService, RatingService>();
        builder.Services.AddControllers();
        builder.Services.AddEndpointsApiExplorer();

        // Static File
        builder.Services.Configure<FileUploadSettings>(
            builder.Configuration.GetSection("FileUpload"));

        // CORS pour Angular avec support des cookies
        var allowedOrigins = new[] { "http://localhost:4200", "https://localhost:4200" };

        builder.Services.AddCors(options =>
        {
            options.AddPolicy("AngularApp", policy =>
            {
                policy.WithOrigins(allowedOrigins)
                    .AllowAnyMethod()
                    .AllowAnyHeader()
                    .AllowCredentials(); // CRUCIAL pour les cookies
            });
        });

        var app = builder.Build();

        //Pipeline - ORDRE IMPORTANT
        if (app.Environment.IsDevelopment())
        {
            app.UseSwagger();
            app.UseSwaggerUI();
        }

        // CORRECTION : CORS doit être avant Authentication
        app.UseCors("AngularApp");

        // Configuration for static's files
        app.UseStaticFiles(new StaticFileOptions
        {
            FileProvider = new PhysicalFileProvider(
               Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "Images")),
            RequestPath = "/Images",
        });

        app.UseAuthentication(); // Toujours avant UseAuthorization
        app.UseAuthorization();
        app.MapControllers();

        // Initialisation Roles
        using (var scope = app.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            db.Database.Migrate();
            var roleSeeder = scope.ServiceProvider.GetRequiredService<RoleSeederService>();
            await roleSeeder.SeedRolesAndAdminAsync();
        }

        app.Run();
    }
}