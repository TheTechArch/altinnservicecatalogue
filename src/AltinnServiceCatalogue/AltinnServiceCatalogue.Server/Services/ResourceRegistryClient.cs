using System.Net.Http.Json;
using System.Text.Json;
using Altinn.Authorization.Api.Contracts.ResourceRegistry;
using Altinn.ResourceRegistry.Core.Models;
using Microsoft.AspNetCore.Http.Extensions;

namespace AltinnServiceCatalogue.Server.Services;

public class ResourceRegistryClient(IHttpClientFactory httpClientFactory, ILogger<ResourceRegistryClient> logger) : IResourceRegistryClient
{
    private const string BasePath = "/resourceregistry/api/v1/resource";

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        PropertyNameCaseInsensitive = true,
    };

    public async Task<List<ServiceResource>> GetResourceListAsync(string baseUrl, bool? includeApps, bool? includeAltinn2, CancellationToken ct)
    {
        var client = CreateClient();
        var query = new QueryBuilder();
        if (includeApps.HasValue)
            query.Add("includeApps", includeApps.Value.ToString().ToLowerInvariant());
        if (includeAltinn2.HasValue)
            query.Add("includeAltinn2", includeAltinn2.Value.ToString().ToLowerInvariant());

        var url = $"{baseUrl}{BasePath}/resourcelist{query}";
        logger.LogInformation("Fetching resource list from {Url}", url);

        var response = await client.GetAsync(url, ct);
        response.EnsureSuccessStatusCode();
        return await response.Content.ReadFromJsonAsync<List<ServiceResource>>(JsonOptions, ct) ?? [];
    }

    public async Task<ServiceResource?> GetResourceAsync(string baseUrl, string id, CancellationToken ct)
    {
        var client = CreateClient();
        var url = $"{baseUrl}{BasePath}/{Uri.EscapeDataString(id)}";

        var response = await client.GetAsync(url, ct);
        if (response.StatusCode == System.Net.HttpStatusCode.NotFound)
            return null;

        response.EnsureSuccessStatusCode();
        return await response.Content.ReadFromJsonAsync<ServiceResource>(JsonOptions, ct);
    }

    public async Task<List<ServiceResource>> SearchResourcesAsync(string baseUrl, ResourceSearch search, CancellationToken ct)
    {
        var client = CreateClient();
        var url = $"{baseUrl}{BasePath}/search";

        // Upstream API uses GET with JSON body
        using var request = new HttpRequestMessage(HttpMethod.Get, url)
        {
            Content = JsonContent.Create(search, options: JsonOptions),
        };

        var response = await client.SendAsync(request, ct);
        response.EnsureSuccessStatusCode();
        return await response.Content.ReadFromJsonAsync<List<ServiceResource>>(JsonOptions, ct) ?? [];
    }

    public async Task<List<ServiceResource>> GetResourcesBySubjectAsync(string baseUrl, SubjectResources subject, CancellationToken ct)
    {
        var client = CreateClient();
        var url = $"{baseUrl}{BasePath}/bysubject";

        // Upstream API uses GET with JSON body
        using var request = new HttpRequestMessage(HttpMethod.Get, url)
        {
            Content = JsonContent.Create(subject, options: JsonOptions),
        };

        var response = await client.SendAsync(request, ct);
        response.EnsureSuccessStatusCode();
        return await response.Content.ReadFromJsonAsync<List<ServiceResource>>(JsonOptions, ct) ?? [];
    }

    public async Task<OrgList?> GetOrgListAsync(string baseUrl, CancellationToken ct)
    {
        var client = CreateClient();
        var url = $"{baseUrl}{BasePath}/orgs";

        var response = await client.GetAsync(url, ct);
        response.EnsureSuccessStatusCode();
        return await response.Content.ReadFromJsonAsync<OrgList>(JsonOptions, ct);
    }

    public async Task<Stream> GetResourcePolicyAsync(string baseUrl, string id, CancellationToken ct)
    {
        var client = CreateClient();
        var url = $"{baseUrl}{BasePath}/{Uri.EscapeDataString(id)}/policy";

        var response = await client.GetAsync(url, HttpCompletionOption.ResponseHeadersRead, ct);
        response.EnsureSuccessStatusCode();
        return await response.Content.ReadAsStreamAsync(ct);
    }

    public async Task<Stream> GetResourcePolicySubjectsAsync(string baseUrl, string id, CancellationToken ct)
    {
        var client = CreateClient();
        var url = $"{baseUrl}{BasePath}/{Uri.EscapeDataString(id)}/policy/subjects";

        var response = await client.GetAsync(url, HttpCompletionOption.ResponseHeadersRead, ct);
        response.EnsureSuccessStatusCode();
        return await response.Content.ReadAsStreamAsync(ct);
    }

    private HttpClient CreateClient() => httpClientFactory.CreateClient("ResourceRegistry");
}
