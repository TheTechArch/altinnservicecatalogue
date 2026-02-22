using System.Text.Json.Serialization;

namespace Altinn.Authorization.Api.Contracts.AccessManagement;

/// <summary>
/// Input model for identifying a person by national identity number and last name.
/// </summary>
public class PersonInput
{
    /// <summary>
    /// Gets or sets the person identifier (national identity number).
    /// </summary>
    [JsonPropertyName("personIdentifier")]
    public string? PersonIdentifier { get; set; }

    /// <summary>
    /// Gets or sets the last name for verification.
    /// </summary>
    [JsonPropertyName("lastName")]
    public string? LastName { get; set; }
}
