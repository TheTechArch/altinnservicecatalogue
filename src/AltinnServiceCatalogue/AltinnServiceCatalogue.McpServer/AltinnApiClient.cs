using System.Net.Http.Json;
using System.Text.Json;
using Altinn.Authorization.Api.Contracts.AccessManagement;
using Altinn.Authorization.Api.Contracts.ResourceRegistry;
using Altinn.ResourceRegistry.Core.Models;

namespace AltinnServiceCatalogue.McpServer;

public class AltinnApiClient
{
    private const string BaseUrl = "https://platform.altinn.no";
    private const string ResourceRegistryBase = "/resourceregistry/api/v1/resource";
    private const string MetadataBase = "/accessmanagement/api/v1/meta";

    internal static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        PropertyNameCaseInsensitive = true,
        WriteIndented = true
    };

    private readonly IHttpClientFactory _httpClientFactory;

    public AltinnApiClient(IHttpClientFactory httpClientFactory)
    {
        _httpClientFactory = httpClientFactory;
    }

    private HttpClient CreateClient() => _httpClientFactory.CreateClient("Altinn");

    // Resource Registry

    public async Task<List<ServiceResource>> GetResourceListAsync(bool includeApps = false, bool includeAltinn2 = false, CancellationToken ct = default)
    {
        using var client = CreateClient();
        var url = $"{BaseUrl}{ResourceRegistryBase}/resourcelist?includeApps={B(includeApps)}&includeAltinn2={B(includeAltinn2)}";
        return await client.GetFromJsonAsync<List<ServiceResource>>(url, JsonOptions, ct) ?? [];
    }

    public async Task<ServiceResource?> GetResourceAsync(string id, CancellationToken ct = default)
    {
        using var client = CreateClient();
        var url = $"{BaseUrl}{ResourceRegistryBase}/{Uri.EscapeDataString(id)}";
        return await client.GetFromJsonAsync<ServiceResource>(url, JsonOptions, ct);
    }

    public async Task<List<ServiceResource>> SearchResourcesAsync(string? id = null, string? title = null, string? description = null, string? resourceType = null, string? keyword = null, string? reference = null, CancellationToken ct = default)
    {
        using var client = CreateClient();
        var queryParts = new List<string>();
        if (id != null) queryParts.Add($"Id={Uri.EscapeDataString(id)}");
        if (title != null) queryParts.Add($"Title={Uri.EscapeDataString(title)}");
        if (description != null) queryParts.Add($"Description={Uri.EscapeDataString(description)}");
        if (resourceType != null) queryParts.Add($"ResourceType={Uri.EscapeDataString(resourceType)}");
        if (keyword != null) queryParts.Add($"Keyword={Uri.EscapeDataString(keyword)}");
        if (reference != null) queryParts.Add($"Reference={Uri.EscapeDataString(reference)}");
        var query = queryParts.Count > 0 ? "?" + string.Join("&", queryParts) : "";
        var url = $"{BaseUrl}{ResourceRegistryBase}/Search{query}";
        return await client.GetFromJsonAsync<List<ServiceResource>>(url, JsonOptions, ct) ?? [];
    }

    public async Task<OrgList?> GetOrgsAsync(CancellationToken ct = default)
    {
        using var client = CreateClient();
        var url = $"{BaseUrl}{ResourceRegistryBase}/orgs";
        return await client.GetFromJsonAsync<OrgList>(url, JsonOptions, ct);
    }

    // Policy endpoints use raw stream pass-through to avoid UrnJsonTypeValue serialization issues
    public async Task<string> GetResourcePolicyRightsAsync(string id, string language = "nb", CancellationToken ct = default)
    {
        using var client = CreateClient();
        var url = $"{BaseUrl}/resourceregistry/api/v2/resource/{Uri.EscapeDataString(id)}/policy/rights";
        var request = new HttpRequestMessage(HttpMethod.Get, url);
        request.Headers.Add("Accept-Language", language);
        var response = await client.SendAsync(request, ct);
        response.EnsureSuccessStatusCode();
        return await FormatJsonAsync(response, ct);
    }

    public async Task<string> GetResourcePolicySubjectsAsync(string id, CancellationToken ct = default)
    {
        using var client = CreateClient();
        var url = $"{BaseUrl}{ResourceRegistryBase}/{Uri.EscapeDataString(id)}/policy/subjects";
        var response = await client.GetAsync(url, HttpCompletionOption.ResponseHeadersRead, ct);
        response.EnsureSuccessStatusCode();
        return await FormatJsonAsync(response, ct);
    }

    public async Task<string> GetResourcePolicyRulesAsync(string id, CancellationToken ct = default)
    {
        using var client = CreateClient();
        var url = $"{BaseUrl}{ResourceRegistryBase}/{Uri.EscapeDataString(id)}/policy/rules";
        var response = await client.GetAsync(url, HttpCompletionOption.ResponseHeadersRead, ct);
        response.EnsureSuccessStatusCode();
        return await FormatJsonAsync(response, ct);
    }

    public async Task<string> GetResourcesBySubjectsAsync(string[] subjectUrns, CancellationToken ct = default)
    {
        using var client = CreateClient();
        var url = $"{BaseUrl}{ResourceRegistryBase}/bysubjects";
        var response = await client.PostAsJsonAsync(url, subjectUrns, ct);
        response.EnsureSuccessStatusCode();
        return await FormatJsonAsync(response, ct);
    }

    // Metadata API - Access Packages

    public async Task<List<SearchObjectOfPackageDto>> SearchPackagesAsync(string? term = null, string? typeName = null, CancellationToken ct = default)
    {
        using var client = CreateClient();
        var queryParts = new List<string>();
        if (term != null) queryParts.Add($"term={Uri.EscapeDataString(term)}");
        if (typeName != null) queryParts.Add($"typeName={Uri.EscapeDataString(typeName)}");
        var query = queryParts.Count > 0 ? "?" + string.Join("&", queryParts) : "";
        var url = $"{BaseUrl}{MetadataBase}/info/accesspackages/search{query}";
        return await client.GetFromJsonAsync<List<SearchObjectOfPackageDto>>(url, JsonOptions, ct) ?? [];
    }

    public async Task<List<AreaGroupDto>> ExportPackagesAsync(CancellationToken ct = default)
    {
        using var client = CreateClient();
        var url = $"{BaseUrl}{MetadataBase}/info/accesspackages/export";
        return await client.GetFromJsonAsync<List<AreaGroupDto>>(url, JsonOptions, ct) ?? [];
    }

    public async Task<List<AreaGroupDto>> GetPackageGroupsAsync(CancellationToken ct = default)
    {
        using var client = CreateClient();
        var url = $"{BaseUrl}{MetadataBase}/info/accesspackages/group";
        return await client.GetFromJsonAsync<List<AreaGroupDto>>(url, JsonOptions, ct) ?? [];
    }

    public async Task<List<AreaDto>> GetPackageGroupAreasAsync(string groupId, CancellationToken ct = default)
    {
        using var client = CreateClient();
        var url = $"{BaseUrl}{MetadataBase}/info/accesspackages/group/{Uri.EscapeDataString(groupId)}/areas";
        return await client.GetFromJsonAsync<List<AreaDto>>(url, JsonOptions, ct) ?? [];
    }

    public async Task<List<PackageDto>> GetAreaPackagesAsync(string areaId, CancellationToken ct = default)
    {
        using var client = CreateClient();
        var url = $"{BaseUrl}{MetadataBase}/info/accesspackages/area/{Uri.EscapeDataString(areaId)}/packages";
        return await client.GetFromJsonAsync<List<PackageDto>>(url, JsonOptions, ct) ?? [];
    }

    public async Task<PackageDto?> GetPackageByIdAsync(string packageId, CancellationToken ct = default)
    {
        using var client = CreateClient();
        var url = $"{BaseUrl}{MetadataBase}/info/accesspackages/package/{Uri.EscapeDataString(packageId)}";
        return await client.GetFromJsonAsync<PackageDto>(url, JsonOptions, ct);
    }

    public async Task<PackageDto?> GetPackageByUrnAsync(string urnValue, CancellationToken ct = default)
    {
        using var client = CreateClient();
        var url = $"{BaseUrl}{MetadataBase}/info/accesspackages/package/urn/{Uri.EscapeDataString(urnValue)}";
        return await client.GetFromJsonAsync<PackageDto>(url, JsonOptions, ct);
    }

    public async Task<List<ResourceDto>> GetPackageResourcesAsync(string packageId, CancellationToken ct = default)
    {
        using var client = CreateClient();
        var url = $"{BaseUrl}{MetadataBase}/info/accesspackages/package/{Uri.EscapeDataString(packageId)}/resources";
        return await client.GetFromJsonAsync<List<ResourceDto>>(url, JsonOptions, ct) ?? [];
    }

    // Metadata API - Roles

    public async Task<List<RoleDto>> GetRolesAsync(CancellationToken ct = default)
    {
        using var client = CreateClient();
        var url = $"{BaseUrl}{MetadataBase}/info/roles";
        return await client.GetFromJsonAsync<List<RoleDto>>(url, JsonOptions, ct) ?? [];
    }

    public async Task<RoleDto?> GetRoleByIdAsync(string id, CancellationToken ct = default)
    {
        using var client = CreateClient();
        var url = $"{BaseUrl}{MetadataBase}/info/roles/{Uri.EscapeDataString(id)}";
        return await client.GetFromJsonAsync<RoleDto>(url, JsonOptions, ct);
    }

    public async Task<List<RolePackageDto>> GetRolePackagesAsync(string role, string variant, bool includeResources = false, CancellationToken ct = default)
    {
        using var client = CreateClient();
        var url = $"{BaseUrl}{MetadataBase}/info/roles/packages?role={Uri.EscapeDataString(role)}&variant={Uri.EscapeDataString(variant)}&includeResources={B(includeResources)}";
        return await client.GetFromJsonAsync<List<RolePackageDto>>(url, JsonOptions, ct) ?? [];
    }

    public async Task<List<ResourceDto>> GetRoleResourcesAsync(string role, string variant, bool includePackageResources = false, CancellationToken ct = default)
    {
        using var client = CreateClient();
        var url = $"{BaseUrl}{MetadataBase}/info/roles/resources?role={Uri.EscapeDataString(role)}&variant={Uri.EscapeDataString(variant)}&includePackageResources={B(includePackageResources)}";
        return await client.GetFromJsonAsync<List<ResourceDto>>(url, JsonOptions, ct) ?? [];
    }

    // Metadata API - Types

    public async Task<List<SubTypeDto>> GetOrganizationSubTypesAsync(CancellationToken ct = default)
    {
        using var client = CreateClient();
        var url = $"{BaseUrl}{MetadataBase}/types/organization/subtypes";
        return await client.GetFromJsonAsync<List<SubTypeDto>>(url, JsonOptions, ct) ?? [];
    }

    private static string B(bool value) => value ? "true" : "false";

    private static async Task<string> FormatJsonAsync(HttpResponseMessage response, CancellationToken ct)
    {
        var raw = await response.Content.ReadAsStringAsync(ct);
        try
        {
            using var doc = JsonDocument.Parse(raw);
            return JsonSerializer.Serialize(doc.RootElement, JsonOptions);
        }
        catch
        {
            return raw;
        }
    }
}
