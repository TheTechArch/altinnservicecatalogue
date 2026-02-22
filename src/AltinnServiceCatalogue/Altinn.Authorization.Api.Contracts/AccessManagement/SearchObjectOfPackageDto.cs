namespace Altinn.Authorization.Api.Contracts.AccessManagement;

/// <summary>
/// Represents a search result object containing a package and search metadata.
/// </summary>
public class SearchObjectOfPackageDto
{
    /// <summary>
    /// Gets or sets the package object.
    /// </summary>
    public PackageDto Object { get; set; }

    /// <summary>
    /// Gets or sets the relevance score of the search result.
    /// </summary>
    public double Score { get; set; }

    /// <summary>
    /// Gets or sets the fields that matched the search.
    /// </summary>
    public List<SearchField> Fields { get; set; }
}

/// <summary>
/// Represents a field that matched in a search.
/// </summary>
public class SearchField
{
    /// <summary>
    /// Gets or sets the field name.
    /// </summary>
    public string Field { get; set; }

    /// <summary>
    /// Gets or sets the field value.
    /// </summary>
    public string Value { get; set; }

    /// <summary>
    /// Gets or sets the relevance score for this field.
    /// </summary>
    public double Score { get; set; }

    /// <summary>
    /// Gets or sets the words that matched in this field.
    /// </summary>
    public List<SearchWord> Words { get; set; }
}

/// <summary>
/// Represents a word that matched in a search.
/// </summary>
public class SearchWord
{
    /// <summary>
    /// Gets or sets the content of the word.
    /// </summary>
    public string Content { get; set; }

    /// <summary>
    /// Gets or sets the lowercase content of the word.
    /// </summary>
    public string LowercaseContent { get; set; }

    /// <summary>
    /// Gets or sets whether this word is a match.
    /// </summary>
    public bool IsMatch { get; set; }

    /// <summary>
    /// Gets or sets the relevance score for this word.
    /// </summary>
    public double Score { get; set; }
}
