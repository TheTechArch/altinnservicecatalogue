using Altinn.Authorization.Api.Contracts.ResourceRegistry;
using Altinn.ResourceRegistry.Core.Models;

namespace AltinnServiceCatalogue.Server.Services;

/// <summary>
/// Client interface for calling the Altinn Resource Registry API.
/// </summary>
public interface IResourceRegistryClient
{
    Task<List<ServiceResource>> GetResourceListAsync(string baseUrl, bool? includeApps, bool? includeAltinn2, CancellationToken ct = default);

    Task<ServiceResource?> GetResourceAsync(string baseUrl, string id, CancellationToken ct = default);

    Task<List<ServiceResource>> SearchResourcesAsync(string baseUrl, ResourceSearch search, CancellationToken ct = default);

    Task<List<ServiceResource>> GetResourcesBySubjectAsync(string baseUrl, SubjectResources subject, CancellationToken ct = default);

    Task<OrgList?> GetOrgListAsync(string baseUrl, CancellationToken ct = default);

    Task<Stream> GetResourcePolicyAsync(string baseUrl, string id, CancellationToken ct = default);

    Task<Stream> GetResourcePolicySubjectsAsync(string baseUrl, string id, CancellationToken ct = default);

    Task<Stream> GetResourcePolicyRulesAsync(string baseUrl, string id, CancellationToken ct = default);
}
