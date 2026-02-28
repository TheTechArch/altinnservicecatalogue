namespace AltinnServiceCatalogue.Server.Configuration;

/// <summary>
/// Configuration options for the Resource Registry proxy.
/// </summary>
public class ResourceRegistryOptions
{
    public const string SectionName = "ResourceRegistry";

    /// <summary>
    /// Maps environment names (e.g. "tt02", "prod") to platform base URLs.
    /// </summary>
    public Dictionary<string, string> Environments { get; set; } = new(StringComparer.OrdinalIgnoreCase);
}
