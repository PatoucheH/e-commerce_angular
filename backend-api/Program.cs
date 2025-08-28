using Microsoft.EntityFrameworkCore;
using DotNetEnv;
using backend_api.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using backend_api.Services;
using Microsoft.AspNetCore.Identity.UI.Services;
using Microsoft.OpenApi.Models;
using Microsoft.Extensions.FileProviders;
using Stripe;


namespace backend_api;

public class Program
{
    public static async Task Main(string[] args)
    {

        Env.Load(Path.Combine(Directory.GetParent(Directory.GetCurrentDirectory())!.FullName, ".env"));
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

// Configuration avec support multi-audience pour dev et config simple pour prod
var issuer = Environment.GetEnvironmentVariable("JWT_ISSUER") 
    ?? (builder.Environment.IsDevelopment() ? "http://localhost:5147" : builder.Configuration["JwtSettings:Issuer"]);

// En développement : accepter plusieurs audiences (Swagger + Angular)
// En production : utiliser la configuration
var validAudiences = new List<string>();

if (builder.Environment.IsDevelopment())
{
    // Développement : Swagger ET Angular
    validAudiences.Add("http://localhost:5147"); // Swagger
    validAudiences.Add("http://localhost:4200"); // Angular
    
    // Si variables d'environnement définies (Docker dev)
    var envAudience = Environment.GetEnvironmentVariable("JWT_AUDIENCE");
    if (!string.IsNullOrEmpty(envAudience))
    {
        validAudiences.Add(envAudience);
    }
}
else
{
    // Production : utiliser config ou variable d'environnement
    var prodAudience = Environment.GetEnvironmentVariable("JWT_AUDIENCE") 
        ?? builder.Configuration["JwtSettings:Audience"];
    
    if (!string.IsNullOrEmpty(prodAudience))
    {
        validAudiences.Add(prodAudience);
    }
}

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    // Pour debug
    options.Events = new JwtBearerEvents
    {
        OnAuthenticationFailed = context =>
        {
            Console.WriteLine($"JWT Auth failed: {context.Exception.Message}");
            return Task.CompletedTask;
        }
    };

    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = issuer,
        ValidAudiences = validAudiences, // Support multi-audience
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey))
    };
});


        // Swagger 
        builder.Services.AddSwaggerGen(c =>
        {
            c.SwaggerDoc("v1", new OpenApiInfo { Title = "backend_api", Version = "v1" });

            c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
            {
                In = ParameterLocation.Header,
                Description = "Please enter 'Bearer' followed by your token ",
                Name = "Authorization",
                Type = SecuritySchemeType.ApiKey,
                Scheme = "Bearer"
            });

            c.AddSecurityRequirement(new OpenApiSecurityRequirement
            {
                {
                new OpenApiSecurityScheme
                {
                    Reference = new OpenApiReference
                    {
                        Type = ReferenceType.SecurityScheme,
                        Id = "Bearer"
                    }
                },
                new string[]{}
                }
            });
        });

        // stripe
        StripeConfiguration.ApiKey = Environment.GetEnvironmentVariable("STRIPE_SECRET_KEY");


        //Services
        builder.Services.AddScoped<RoleSeederService>();
        builder.Services.AddScoped<ICartService, CartService>();
        builder.Services.AddScoped<IProductsService, ProductsService>();
        builder.Services.AddScoped<IOrderService, OrderService>();
        builder.Services.AddScoped<IImageService, ImageService>();
        builder.Services.AddScoped<IRatingService, RatingService>();
        builder.Services.AddControllers();
        builder.Services.AddEndpointsApiExplorer();
        builder.Services.AddSwaggerGen();

        // Static File
        builder.Services.Configure<FileUploadSettings>(
            builder.Configuration.GetSection("FileUpload"));

        // CORS Angular
        var allowedOrigins = new[] { "http://localhost:4200", "https://localhost:4200" };

        builder.Services.AddCors(options =>
        {
            options.AddPolicy("AngularApp", policy =>
            {
                policy.WithOrigins(allowedOrigins)
                    .AllowAnyMethod()
                    .AllowAnyHeader();
            });
        });

        // builder.WebHost.ConfigureKestrel(options =>
        // {
        //     options.ListenAnyIP(5000);
        // });

        var app = builder.Build();

        //Pipeline
        app.UseSwagger();
        app.UseSwaggerUI();

        app.UseCors("AngularApp");
        app.UseAuthentication();
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


        //Configuration for static's files
        app.UseStaticFiles(new StaticFileOptions
        {
            FileProvider = new PhysicalFileProvider(
               Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "Images")),
            RequestPath = "/Images",
        });


        app.Run();

    }

}