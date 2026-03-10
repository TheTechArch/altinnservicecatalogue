using System.ComponentModel;
using System.Text.Json;
using ModelContextProtocol.Server;

namespace AltinnServiceCatalogue.McpServer;

[McpServerToolType]
public sealed class AltinnTools
{
    private static string ToJson<T>(T value) => JsonSerializer.Serialize(value, AltinnApiClient.JsonOptions);

    [McpServerTool, Description("Get a specific resource from the Altinn Resource Registry by its identifier. Returns full resource details including title, description, rights, contact points, etc.")]
    public static async Task<string> GetResource(
        AltinnApiClient client,
        [Description("The resource identifier, e.g. 'skd_mva' or 'nav_dagpenger'")] string id,
        CancellationToken ct)
    {
        var result = await client.GetResourceAsync(id, ct);
        return ToJson(result);
    }

    [McpServerTool, Description("Search for resources in the Altinn Resource Registry. All parameters are optional and combined as filters.")]
    public static async Task<string> SearchResources(
        AltinnApiClient client,
        [Description("Filter by resource ID (partial match)")] string? id = null,
        [Description("Filter by title (partial match)")] string? title = null,
        [Description("Filter by description (partial match)")] string? description = null,
        [Description("Filter by resource type, e.g. 'GenericAccessResource', 'Systemresource', 'MaskinportenSchema', 'Altinn2Service', 'AltinnApp', 'BrokerService', 'CorrespondenceService'")] string? resourceType = null,
        [Description("Filter by keyword")] string? keyword = null,
        [Description("Filter by reference (e.g. MaskinportenScope, ServiceCode)")] string? reference = null,
        CancellationToken ct = default)
    {
        var result = await client.SearchResourcesAsync(id, title, description, resourceType, keyword, reference, ct);
        return ToJson(result);
    }

    [McpServerTool, Description("Get the full list of resources from the Altinn Resource Registry. Can be large - consider using SearchResources instead for targeted queries.")]
    public static async Task<string> GetResourceList(
        AltinnApiClient client,
        [Description("Include Altinn 3 app resources")] bool includeApps = false,
        [Description("Include legacy Altinn 2 resources")] bool includeAltinn2 = false,
        CancellationToken ct = default)
    {
        var result = await client.GetResourceListAsync(includeApps, includeAltinn2, ct);
        return ToJson(result);
    }

    [McpServerTool, Description("Get the list of organizations registered in the Altinn Resource Registry, including their names, logos, and org numbers.")]
    public static async Task<string> GetOrganizations(
        AltinnApiClient client,
        CancellationToken ct = default)
    {
        var result = await client.GetOrgsAsync(ct);
        return ToJson(result);
    }

    [McpServerTool, Description("Get the delegable rights (actions) for a specific resource. Returns what actions can be delegated and to whom.")]
    public static async Task<string> GetResourceRights(
        AltinnApiClient client,
        [Description("The resource identifier")] string id,
        [Description("Language code for response: 'nb' (Norwegian Bokmål), 'nn' (Nynorsk), or 'en' (English)")] string language = "nb",
        CancellationToken ct = default)
    {
        return await client.GetResourcePolicyRightsAsync(id, language, ct);
    }

    [McpServerTool, Description("Get the subjects (roles and access packages) that have access to a specific resource through its policy.")]
    public static async Task<string> GetResourcePolicySubjects(
        AltinnApiClient client,
        [Description("The resource identifier, e.g. 'altinn_access_management'")] string id,
        CancellationToken ct = default)
    {
        return await client.GetResourcePolicySubjectsAsync(id, ct);
    }

    [McpServerTool, Description("Get the full policy rules for a specific resource. Each rule maps a subject (role/access package) to specific actions (read, write, etc.) on the resource.")]
    public static async Task<string> GetResourcePolicyRules(
        AltinnApiClient client,
        [Description("The resource identifier, e.g. 'altinn_access_management'")] string id,
        CancellationToken ct = default)
    {
        return await client.GetResourcePolicyRulesAsync(id, ct);
    }

    [McpServerTool, Description("Get all resources accessible by one or more subject URNs (roles or access packages). Useful for answering 'what can this role/package access?'")]
    public static async Task<string> GetResourcesBySubjects(
        AltinnApiClient client,
        [Description("Array of subject URNs, e.g. ['urn:altinn:rolecode:DAGL', 'urn:altinn:accesspackage:tilgangsstyrer']")] string[] subjectUrns,
        CancellationToken ct = default)
    {
        return await client.GetResourcesBySubjectsAsync(subjectUrns, ct);
    }

    // Access Packages

    [McpServerTool, Description("Search access packages in the Altinn Access Management metadata API. Packages group resources for delegation.")]
    public static async Task<string> SearchPackages(
        AltinnApiClient client,
        [Description("Search term")] string? term = null,
        [Description("Filter by type name, e.g. 'Organisasjon'")] string? typeName = null,
        CancellationToken ct = default)
    {
        var result = await client.SearchPackagesAsync(term, typeName, ct);
        return ToJson(result);
    }

    [McpServerTool, Description("Export all access packages from the Altinn metadata API. Returns the complete list with full details.")]
    public static async Task<string> ExportPackages(
        AltinnApiClient client,
        CancellationToken ct = default)
    {
        var result = await client.ExportPackagesAsync(ct);
        return ToJson(result);
    }

    [McpServerTool, Description("Get all access package groups from the Altinn metadata API. Groups organize areas and packages hierarchically.")]
    public static async Task<string> GetPackageGroups(
        AltinnApiClient client,
        CancellationToken ct = default)
    {
        var result = await client.GetPackageGroupsAsync(ct);
        return ToJson(result);
    }

    [McpServerTool, Description("Get the areas within a specific access package group.")]
    public static async Task<string> GetPackageGroupAreas(
        AltinnApiClient client,
        [Description("The group ID (UUID)")] string groupId,
        CancellationToken ct = default)
    {
        var result = await client.GetPackageGroupAreasAsync(groupId, ct);
        return ToJson(result);
    }

    [McpServerTool, Description("Get the access packages within a specific area.")]
    public static async Task<string> GetAreaPackages(
        AltinnApiClient client,
        [Description("The area ID (UUID)")] string areaId,
        CancellationToken ct = default)
    {
        var result = await client.GetAreaPackagesAsync(areaId, ct);
        return ToJson(result);
    }

    [McpServerTool, Description("Get a specific access package by its ID.")]
    public static async Task<string> GetPackageById(
        AltinnApiClient client,
        [Description("The package ID (UUID)")] string packageId,
        CancellationToken ct = default)
    {
        var result = await client.GetPackageByIdAsync(packageId, ct);
        return ToJson(result);
    }

    [McpServerTool, Description("Get a specific access package by its URN.")]
    public static async Task<string> GetPackageByUrn(
        AltinnApiClient client,
        [Description("The URN value, e.g. 'urn:altinn:accesspackage:skatt-nering'")] string urnValue,
        CancellationToken ct = default)
    {
        var result = await client.GetPackageByUrnAsync(urnValue, ct);
        return ToJson(result);
    }

    [McpServerTool, Description("Get the resources included in a specific access package.")]
    public static async Task<string> GetPackageResources(
        AltinnApiClient client,
        [Description("The package ID (UUID)")] string packageId,
        CancellationToken ct = default)
    {
        var result = await client.GetPackageResourcesAsync(packageId, ct);
        return ToJson(result);
    }

    // Roles

    [McpServerTool, Description("Get all roles from the Altinn Access Management metadata API.")]
    public static async Task<string> GetRoles(
        AltinnApiClient client,
        CancellationToken ct = default)
    {
        var result = await client.GetRolesAsync(ct);
        return ToJson(result);
    }

    [McpServerTool, Description("Get a specific role by its ID.")]
    public static async Task<string> GetRoleById(
        AltinnApiClient client,
        [Description("The role ID (UUID)")] string id,
        CancellationToken ct = default)
    {
        var result = await client.GetRoleByIdAsync(id, ct);
        return ToJson(result);
    }

    [McpServerTool, Description("Get the access packages assigned to a specific role.")]
    public static async Task<string> GetRolePackages(
        AltinnApiClient client,
        [Description("The role code, e.g. 'DAGL' (daglig leder), 'REGN' (regnskapsfører)")] string role,
        [Description("The role variant, e.g. 'altinn', 'er', 'ccr'")] string variant,
        [Description("Include resource details in each package")] bool includeResources = false,
        CancellationToken ct = default)
    {
        var result = await client.GetRolePackagesAsync(role, variant, includeResources, ct);
        return ToJson(result);
    }

    [McpServerTool, Description("Get the resources accessible through a specific role.")]
    public static async Task<string> GetRoleResources(
        AltinnApiClient client,
        [Description("The role code, e.g. 'DAGL' (daglig leder), 'REGN' (regnskapsfører)")] string role,
        [Description("The role variant, e.g. 'altinn', 'er', 'ccr'")] string variant,
        [Description("Include resources from packages assigned to the role")] bool includePackageResources = false,
        CancellationToken ct = default)
    {
        var result = await client.GetRoleResourcesAsync(role, variant, includePackageResources, ct);
        return ToJson(result);
    }

    // Types

    [McpServerTool, Description("Get the organization sub-types defined in Altinn (e.g. AS, ENK, etc.).")]
    public static async Task<string> GetOrganizationSubTypes(
        AltinnApiClient client,
        CancellationToken ct = default)
    {
        var result = await client.GetOrganizationSubTypesAsync(ct);
        return ToJson(result);
    }
}
