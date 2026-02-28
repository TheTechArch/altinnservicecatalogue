namespace AltinnServiceCatalogue.Server.Configuration;

/// <summary>
/// Configuration options for the Access Management Metadata proxy.
/// </summary>
public class MetadataOptions
{
    public const string SectionName = "Metadata";

    /// <summary>
    /// Maps environment names (e.g. "tt02", "prod") to platform base URLs.
    /// </summary>
    public Dictionary<string, string> Environments { get; set; } = new(StringComparer.OrdinalIgnoreCase);
}
