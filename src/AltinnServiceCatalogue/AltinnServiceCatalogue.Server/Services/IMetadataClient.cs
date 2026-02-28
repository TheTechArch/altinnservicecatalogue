using Altinn.Authorization.Api.Contracts.AccessManagement;

namespace AltinnServiceCatalogue.Server.Services;

/// <summary>
/// Client interface for calling the Altinn Access Management Metadata API.
/// </summary>
public interface IMetadataClient
{
    // Packages
    Task<List<SearchObjectOfPackageDto>> SearchPackagesAsync(string baseUrl, string? term, string[]? resourceProviderCode, bool? searchInResources, string? typeName, CancellationToken ct = default);
    Task<List<AreaGroupDto>> ExportPackagesAsync(string baseUrl, CancellationToken ct = default);
    Task<List<AreaGroupDto>> GetGroupsAsync(string baseUrl, CancellationToken ct = default);
    Task<AreaGroupDto?> GetGroupAsync(string baseUrl, Guid id, CancellationToken ct = default);
    Task<List<AreaDto>> GetGroupAreasAsync(string baseUrl, Guid id, CancellationToken ct = default);
    Task<AreaDto?> GetAreaAsync(string baseUrl, Guid id, CancellationToken ct = default);
    Task<List<PackageDto>> GetAreaPackagesAsync(string baseUrl, Guid id, CancellationToken ct = default);
    Task<PackageDto?> GetPackageAsync(string baseUrl, Guid id, CancellationToken ct = default);
    Task<PackageDto?> GetPackageByUrnAsync(string baseUrl, string urnValue, CancellationToken ct = default);
    Task<List<ResourceDto>> GetPackageResourcesAsync(string baseUrl, Guid id, CancellationToken ct = default);

    // Roles
    Task<List<RoleDto>> GetRolesAsync(string baseUrl, CancellationToken ct = default);
    Task<RoleDto?> GetRoleAsync(string baseUrl, Guid id, CancellationToken ct = default);
    Task<List<PackageDto>> GetRolePackagesAsync(string baseUrl, string role, string variant, bool? includeResources, CancellationToken ct = default);
    Task<List<ResourceDto>> GetRoleResourcesAsync(string baseUrl, string role, string variant, bool? includePackageResources, CancellationToken ct = default);
    Task<List<PackageDto>> GetRolePackagesByIdAsync(string baseUrl, Guid id, string variant, bool? includeResources, CancellationToken ct = default);
    Task<List<ResourceDto>> GetRoleResourcesByIdAsync(string baseUrl, Guid id, string variant, bool? includePackageResources, CancellationToken ct = default);

    // Types
    Task<List<SubTypeDto>> GetOrganizationSubTypesAsync(string baseUrl, CancellationToken ct = default);
}
