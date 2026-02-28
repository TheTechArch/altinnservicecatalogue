using System.Net.Http.Json;
using System.Text.Json;
using Altinn.ResourceRegistry.Core.Models;
using Microsoft.Extensions.Caching.Memory;

namespace AltinnServiceCatalogue.Server.Services;

public class ResourceCacheService(
    IHttpClientFactory httpClientFactory,
    IMemoryCache cache,
    ILogger<ResourceCacheService> logger) : IResourceCacheService
{
    private const string BasePath = "/resourceregistry/api/v1/resource";
    private static readonly TimeSpan CacheDuration = TimeSpan.FromMinutes(10);

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        PropertyNameCaseInsensitive = true,
    };

    public async Task<List<ServiceResource>> GetResourceListAsync(string baseUrl, CancellationToken ct)
    {
        var cacheKey = $"resource-list-{baseUrl}";

        if (cache.TryGetValue(cacheKey, out List<ServiceResource>? cached) && cached is not null)
            return cached;

        var client = httpClientFactory.CreateClient("ResourceRegistry");
        var url = $"{baseUrl}{BasePath}/resourcelist";
        logger.LogInformation("Fetching and caching resource list from {Url}", url);

        var response = await client.GetAsync(url, ct);
        response.EnsureSuccessStatusCode();
        var resources = await response.Content.ReadFromJsonAsync<List<ServiceResource>>(JsonOptions, ct) ?? [];

        cache.Set(cacheKey, resources, CacheDuration);
        return resources;
    }

    public async Task<List<string>> GetKeywordsAsync(string baseUrl, CancellationToken ct)
    {
        var resources = await GetResourceListAsync(baseUrl, ct);

        var seen = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        var keywords = new List<string>();

        foreach (var resource in resources)
        {
            if (resource.Keywords is null) continue;
            foreach (var kw in resource.Keywords)
            {
                if (!string.IsNullOrWhiteSpace(kw.Word) && seen.Add(kw.Word))
                {
                    keywords.Add(kw.Word);
                }
            }
        }

        keywords.Sort(StringComparer.OrdinalIgnoreCase);
        return keywords;
    }

    public async Task<List<ServiceResource>> GetResourcesByKeywordAsync(string baseUrl, string keyword, CancellationToken ct)
    {
        var resources = await GetResourceListAsync(baseUrl, ct);

        return resources
            .Where(r => r.Keywords?.Any(kw =>
                string.Equals(kw.Word, keyword, StringComparison.OrdinalIgnoreCase)) == true)
            .ToList();
    }
}
