using System.Text.Json.Serialization;

namespace Altinn.Authorization.Api.Contracts.AccessManagement;

/// <summary>
/// Represents a paginated result with links and data.
/// </summary>
/// <typeparam name="T">The type of data in the result.</typeparam>
public class PaginatedResult<T>
{
    /// <summary>
    /// Gets or sets the pagination links.
    /// </summary>
    [JsonPropertyName("links")]
    public PaginatedResultLinks Links { get; set; } = new();

    /// <summary>
    /// Gets or sets the data items.
    /// </summary>
    [JsonPropertyName("data")]
    public List<T> Data { get; set; } = [];
}

/// <summary>
/// Represents pagination links.
/// </summary>
public class PaginatedResultLinks
{
    /// <summary>
    /// Gets or sets the next page link.
    /// </summary>
    [JsonPropertyName("next")]
    public string? Next { get; set; }
}
