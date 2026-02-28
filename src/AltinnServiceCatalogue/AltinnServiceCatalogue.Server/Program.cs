using AltinnServiceCatalogue.Server.Configuration;
using AltinnServiceCatalogue.Server.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddOpenApi();

// Resource Registry proxy configuration
builder.Services.Configure<ResourceRegistryOptions>(
    builder.Configuration.GetSection(ResourceRegistryOptions.SectionName));

builder.Services.AddHttpClient("ResourceRegistry", client =>
{
    client.DefaultRequestHeaders.Add("Accept", "application/json");
    client.Timeout = TimeSpan.FromSeconds(30);
});

builder.Services.AddScoped<IResourceRegistryClient, ResourceRegistryClient>();

var app = builder.Build();

app.UseDefaultFiles();
app.MapStaticAssets();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.MapFallbackToFile("/index.html");

app.Run();
