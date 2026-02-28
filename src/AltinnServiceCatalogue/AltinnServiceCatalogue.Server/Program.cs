using AltinnServiceCatalogue.Server.Configuration;
using AltinnServiceCatalogue.Server.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddOpenApi();
builder.Services.AddMemoryCache();

// Resource Registry proxy configuration
builder.Services.Configure<ResourceRegistryOptions>(
    builder.Configuration.GetSection(ResourceRegistryOptions.SectionName));

builder.Services.AddHttpClient("ResourceRegistry", client =>
{
    client.DefaultRequestHeaders.Add("Accept", "application/json");
    client.Timeout = TimeSpan.FromSeconds(30);
});

builder.Services.AddScoped<IResourceRegistryClient, ResourceRegistryClient>();
builder.Services.AddSingleton<IResourceCacheService, ResourceCacheService>();

// Metadata proxy configuration
builder.Services.Configure<MetadataOptions>(
    builder.Configuration.GetSection(MetadataOptions.SectionName));

builder.Services.AddHttpClient("Metadata", client =>
{
    client.DefaultRequestHeaders.Add("Accept", "application/json");
    client.Timeout = TimeSpan.FromSeconds(30);
});

builder.Services.AddScoped<IMetadataClient, MetadataClient>();

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
