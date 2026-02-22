using System.Text.Json.Serialization;

namespace Altinn.Authorization.Api.Contracts.AccessManagement;

/// <summary>
/// Represents an authorized party that the user can represent.
/// </summary>
public class AuthorizedPartyExternal
{
    /// <summary>
    /// Gets or sets the party's unique identifier (UUID).
    /// </summary>
    [JsonPropertyName("partyUuid")]
    public Guid PartyUuid { get; set; }

    /// <summary>
    /// Gets or sets the name of the party.
    /// </summary>
    [JsonPropertyName("name")]
    public string? Name { get; set; }

    /// <summary>
    /// Gets or sets the organization number (for organizations).
    /// </summary>
    [JsonPropertyName("organizationNumber")]
    public string? OrganizationNumber { get; set; }

    /// <summary>
    /// Gets or sets the parent party ID (for subunits).
    /// </summary>
    [JsonPropertyName("parentId")]
    public Guid? ParentId { get; set; }

    /// <summary>
    /// Gets or sets the person ID (for persons).
    /// </summary>
    [JsonPropertyName("personId")]
    public string? PersonId { get; set; }

    /// <summary>
    /// Gets or sets the date of birth (for persons).
    /// </summary>
    [JsonPropertyName("dateOfBirth")]
    public DateOnly? DateOfBirth { get; set; }

    /// <summary>
    /// Gets or sets the legacy party ID.
    /// </summary>
    [JsonPropertyName("partyId")]
    public int PartyId { get; set; }

    /// <summary>
    /// Gets or sets the type of party.
    /// </summary>
    [JsonPropertyName("type")]
    public string? Type { get; set; }

    /// <summary>
    /// Gets or sets the unit type (for organizations).
    /// </summary>
    [JsonPropertyName("unitType")]
    public string? UnitType { get; set; }

    /// <summary>
    /// Gets or sets whether the party is deleted.
    /// </summary>
    [JsonPropertyName("isDeleted")]
    public bool IsDeleted { get; set; }

    /// <summary>
    /// Gets or sets whether this is only a hierarchy element with no access.
    /// </summary>
    [JsonPropertyName("onlyHierarchyElementWithNoAccess")]
    public bool OnlyHierarchyElementWithNoAccess { get; set; }

    /// <summary>
    /// Gets or sets the authorized access packages.
    /// </summary>
    [JsonPropertyName("authorizedAccessPackages")]
    public List<string>? AuthorizedAccessPackages { get; set; }

    /// <summary>
    /// Gets or sets the authorized resources.
    /// </summary>
    [JsonPropertyName("authorizedResources")]
    public List<string>? AuthorizedResources { get; set; }

    /// <summary>
    /// Gets or sets the authorized roles.
    /// </summary>
    [JsonPropertyName("authorizedRoles")]
    public List<string>? AuthorizedRoles { get; set; }

    /// <summary>
    /// Gets or sets the authorized instances.
    /// </summary>
    [JsonPropertyName("authorizedInstances")]
    public List<AuthorizedResourceInstance>? AuthorizedInstances { get; set; }

    /// <summary>
    /// Gets or sets the subunits of this party.
    /// </summary>
    [JsonPropertyName("subunits")]
    public List<AuthorizedPartyExternal>? Subunits { get; set; }
}

/// <summary>
/// Represents an authorized resource instance.
/// </summary>
public class AuthorizedResourceInstance
{
    /// <summary>
    /// Gets or sets the resource ID.
    /// </summary>
    [JsonPropertyName("resourceId")]
    public string? ResourceId { get; set; }

    /// <summary>
    /// Gets or sets the instance ID.
    /// </summary>
    [JsonPropertyName("instanceId")]
    public string? InstanceId { get; set; }
}
