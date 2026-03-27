using System.Xml;
using Altinn.Authorization.ABAC.Utils;
using Altinn.Authorization.ABAC.Xacml;
using Altinn.Authorization.Api.Contracts.ResourceRegistry;
using Altinn.ResourceRegistry.Core.Models;
using AltinnServiceCatalogue.Server.Configuration;
using AltinnServiceCatalogue.Server.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace AltinnServiceCatalogue.Server.Controllers;

[ApiController]
[Route("api/v1/{environment}/resource")]
public class ResourceRegistryController(
    IResourceRegistryClient client,
    IResourceCacheService cacheService,
    IOptions<ResourceRegistryOptions> options,
    ILogger<ResourceRegistryController> logger) : ControllerBase
{
    private readonly ResourceRegistryOptions _options = options.Value;

    [HttpGet("resourcelist")]
    [ProducesResponseType<List<ServiceResource>>(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetResourceList(
        [FromRoute] string environment,
        [FromQuery] bool? includeApps,
        [FromQuery] bool? includeAltinn2,
        CancellationToken ct)
    {
        if (!TryResolveBaseUrl(environment, out var baseUrl))
            return BadRequest($"Unknown environment: {environment}");

        try
        {
            var result = await cacheService.GetResourceListAsync(baseUrl, includeApps, includeAltinn2, ct);
            return Ok(result);
        }
        catch (HttpRequestException ex)
        {
            logger.LogError(ex, "Upstream request failed for GetResourceList in {Environment}", environment);
            return StatusCode(StatusCodes.Status502BadGateway, "Upstream service unavailable");
        }
    }

    [HttpGet("{id}")]
    [ProducesResponseType<ServiceResource>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetResource(
        [FromRoute] string environment,
        [FromRoute] string id,
        CancellationToken ct)
    {
        if (!TryResolveBaseUrl(environment, out var baseUrl))
            return BadRequest($"Unknown environment: {environment}");

        try
        {
            var cached = await cacheService.GetResourceByIdAsync(baseUrl, id, ct);
            if (cached is not null)
                return Ok(cached);

            var result = await client.GetResourceAsync(baseUrl, id, ct);
            if (result is null)
                return NotFound();
            return Ok(result);
        }
        catch (HttpRequestException ex)
        {
            logger.LogError(ex, "Upstream request failed for GetResource({Id}) in {Environment}", id, environment);
            return StatusCode(StatusCodes.Status502BadGateway, "Upstream service unavailable");
        }
    }

    [HttpGet("search")]
    [ProducesResponseType<List<ServiceResource>>(StatusCodes.Status200OK)]
    public async Task<IActionResult> SearchResources(
        [FromRoute] string environment,
        [FromBody] ResourceSearch search,
        CancellationToken ct)
    {
        if (!TryResolveBaseUrl(environment, out var baseUrl))
            return BadRequest($"Unknown environment: {environment}");

        try
        {
            var result = await client.SearchResourcesAsync(baseUrl, search, ct);
            return Ok(result);
        }
        catch (HttpRequestException ex)
        {
            logger.LogError(ex, "Upstream request failed for SearchResources in {Environment}", environment);
            return StatusCode(StatusCodes.Status502BadGateway, "Upstream service unavailable");
        }
    }

    [HttpGet("bysubject")]
    [ProducesResponseType<List<ServiceResource>>(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetResourcesBySubject(
        [FromRoute] string environment,
        [FromBody] SubjectResources subject,
        CancellationToken ct)
    {
        if (!TryResolveBaseUrl(environment, out var baseUrl))
            return BadRequest($"Unknown environment: {environment}");

        try
        {
            var result = await client.GetResourcesBySubjectAsync(baseUrl, subject, ct);
            return Ok(result);
        }
        catch (HttpRequestException ex)
        {
            logger.LogError(ex, "Upstream request failed for GetResourcesBySubject in {Environment}", environment);
            return StatusCode(StatusCodes.Status502BadGateway, "Upstream service unavailable");
        }
    }

    [HttpPost("bysubjects")]
    [Produces("application/json")]
    public async Task<IActionResult> GetResourcesBySubjects(
        [FromRoute] string environment,
        [FromBody] string[] subjectUrns,
        CancellationToken ct)
    {
        if (!TryResolveBaseUrl(environment, out var baseUrl))
            return BadRequest($"Unknown environment: {environment}");

        try
        {
            var stream = await client.GetResourcesBySubjectsAsync(baseUrl, subjectUrns, ct);
            return new FileStreamResult(stream, "application/json");
        }
        catch (HttpRequestException ex)
        {
            logger.LogError(ex, "Upstream request failed for GetResourcesBySubjects in {Environment}", environment);
            return StatusCode(StatusCodes.Status502BadGateway, "Upstream service unavailable");
        }
    }

    [HttpGet("orgs")]
    [ProducesResponseType<OrgList>(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetOrgList(
        [FromRoute] string environment,
        CancellationToken ct)
    {
        if (!TryResolveBaseUrl(environment, out var baseUrl))
            return BadRequest($"Unknown environment: {environment}");

        try
        {
            var result = await client.GetOrgListAsync(baseUrl, ct);
            return Ok(result);
        }
        catch (HttpRequestException ex)
        {
            logger.LogError(ex, "Upstream request failed for GetOrgList in {Environment}", environment);
            return StatusCode(StatusCodes.Status502BadGateway, "Upstream service unavailable");
        }
    }

    [HttpGet("{id}/policy")]
    [Produces("application/json")]
    public async Task<IActionResult> GetResourcePolicy(
        [FromRoute] string environment,
        [FromRoute] string id,
        CancellationToken ct)
    {
        if (!TryResolveBaseUrl(environment, out var baseUrl))
            return BadRequest($"Unknown environment: {environment}");

        try
        {
            var stream = await client.GetResourcePolicyAsync(baseUrl, id, ct);
            return new FileStreamResult(stream, "application/json");
        }
        catch (HttpRequestException ex)
        {
            logger.LogError(ex, "Upstream request failed for GetResourcePolicy({Id}) in {Environment}", id, environment);
            return StatusCode(StatusCodes.Status502BadGateway, "Upstream service unavailable");
        }
    }

    [HttpGet("{id}/policy/subjects")]
    [Produces("application/json")]
    public async Task<IActionResult> GetResourcePolicySubjects(
        [FromRoute] string environment,
        [FromRoute] string id,
        CancellationToken ct)
    {
        if (!TryResolveBaseUrl(environment, out var baseUrl))
            return BadRequest($"Unknown environment: {environment}");

        try
        {
            var stream = await client.GetResourcePolicySubjectsAsync(baseUrl, id, ct);
            return new FileStreamResult(stream, "application/json");
        }
        catch (HttpRequestException ex)
        {
            logger.LogError(ex, "Upstream request failed for GetResourcePolicySubjects({Id}) in {Environment}", id, environment);
            return StatusCode(StatusCodes.Status502BadGateway, "Upstream service unavailable");
        }
    }

    [HttpGet("{id}/policy/rules")]
    [Produces("application/json")]
    public async Task<IActionResult> GetResourcePolicyRules(
        [FromRoute] string environment,
        [FromRoute] string id,
        CancellationToken ct)
    {
        if (!TryResolveBaseUrl(environment, out var baseUrl))
            return BadRequest($"Unknown environment: {environment}");

        try
        {
            var stream = await client.GetResourcePolicyRulesAsync(baseUrl, id, ct);
            return new FileStreamResult(stream, "application/json");
        }
        catch (HttpRequestException ex)
        {
            logger.LogError(ex, "Upstream request failed for GetResourcePolicyRules({Id}) in {Environment}", id, environment);
            return StatusCode(StatusCodes.Status502BadGateway, "Upstream service unavailable");
        }
    }

    [HttpGet("{id}/policy/rights")]
    [ProducesResponseType<List<RightDto>>(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetResourcePolicyRights(
        [FromRoute] string environment,
        [FromRoute] string id,
        CancellationToken ct)
    {
        if (!TryResolveBaseUrl(environment, out var baseUrl))
            return BadRequest($"Unknown environment: {environment}");

        var acceptLanguage = string.Join(",", Request.GetTypedHeaders().AcceptLanguage);

        try
        {
            var result = await client.GetResourcePolicyRightsAsync(baseUrl, id, acceptLanguage, ct);
            return Ok(result);
        }
        catch (HttpRequestException ex)
        {
            logger.LogError(ex, "Upstream request failed for GetResourcePolicyRights({Id}) in {Environment}", id, environment);
            return StatusCode(StatusCodes.Status502BadGateway, "Upstream service unavailable");
        }
    }

    [HttpGet("{id}/policy/securitylevel")]
    [Produces("application/json")]
    public async Task<IActionResult> GetResourcePolicySecurityLevel(
        [FromRoute] string environment,
        [FromRoute] string id,
        CancellationToken ct)
    {
        if (!TryResolveBaseUrl(environment, out var baseUrl))
            return BadRequest($"Unknown environment: {environment}");

        try
        {
            await using var stream = await client.GetResourcePolicyAsync(baseUrl, id, ct);

            using var reader = XmlReader.Create(stream, new XmlReaderSettings { Async = true });
            var policy = XacmlParser.ParseXacmlPolicy(reader);

            int? userLevel = null;
            int? orgLevel = null;

            foreach (var obligation in policy.ObligationExpressions)
            {
                foreach (var assignment in obligation.AttributeAssignmentExpressions)
                {
                    var category = assignment.Category?.ToString();
                    if (assignment.Property is XacmlAttributeValue attrValue && category is not null)
                    {
                        if (category == "urn:altinn:minimum-authenticationlevel"
                            && int.TryParse(attrValue.Value, out var uLevel))
                        {
                            userLevel = uLevel;
                        }
                        else if (category == "urn:altinn:minimum-authenticationlevel-org"
                            && int.TryParse(attrValue.Value, out var oLevel))
                        {
                            orgLevel = oLevel;
                        }
                    }
                }
            }

            return Ok(new { userLevel, orgLevel });
        }
        catch (HttpRequestException ex)
        {
            logger.LogError(ex, "Upstream request failed for GetResourcePolicySecurityLevel({Id}) in {Environment}", id, environment);
            return StatusCode(StatusCodes.Status502BadGateway, "Upstream service unavailable");
        }
        catch (XmlException ex)
        {
            logger.LogError(ex, "Failed to parse XACML policy for {Id} in {Environment}", id, environment);
            return StatusCode(StatusCodes.Status502BadGateway, "Failed to parse policy XML");
        }
    }

    [HttpGet("keywords")]
    [ProducesResponseType<List<string>>(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetKeywords(
        [FromRoute] string environment,
        CancellationToken ct)
    {
        if (!TryResolveBaseUrl(environment, out var baseUrl))
            return BadRequest($"Unknown environment: {environment}");

        try
        {
            var result = await cacheService.GetKeywordsAsync(baseUrl, ct);
            return Ok(result);
        }
        catch (HttpRequestException ex)
        {
            logger.LogError(ex, "Failed to fetch keywords in {Environment}", environment);
            return StatusCode(StatusCodes.Status502BadGateway, "Upstream service unavailable");
        }
    }

    [HttpGet("bykeyword/{keyword}")]
    [ProducesResponseType<List<ServiceResource>>(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetResourcesByKeyword(
        [FromRoute] string environment,
        [FromRoute] string keyword,
        CancellationToken ct)
    {
        if (!TryResolveBaseUrl(environment, out var baseUrl))
            return BadRequest($"Unknown environment: {environment}");

        try
        {
            var result = await cacheService.GetResourcesByKeywordAsync(baseUrl, keyword, ct);
            return Ok(result);
        }
        catch (HttpRequestException ex)
        {
            logger.LogError(ex, "Failed to fetch resources by keyword {Keyword} in {Environment}", keyword, environment);
            return StatusCode(StatusCodes.Status502BadGateway, "Upstream service unavailable");
        }
    }

    [HttpGet("statistics/authlevel")]
    [Produces("application/json")]
    public async Task<IActionResult> GetAuthLevelStatistics(
        [FromRoute] string environment,
        CancellationToken ct)
    {
        if (!TryResolveBaseUrl(environment, out var baseUrl))
            return BadRequest($"Unknown environment: {environment}");

        try
        {
            // Get all resources including apps
            var allResources = await cacheService.GetResourceListAsync(baseUrl, includeApps: true, includeAltinn2: false, ct);

            // Filter to Altinn Studio apps (AltinnApp without _a2- in identifier)
            var studioApps = allResources
                .Where(r => r.ResourceType == Altinn.Authorization.Api.Contracts.ResourceType.AltinnApp
                    && r.Identifier is not null && !r.Identifier.Contains("_a2-"))
                .ToList();

            // Fetch security levels in parallel (throttled to avoid overwhelming upstream)
            const int maxConcurrency = 20;
            using var semaphore = new SemaphoreSlim(maxConcurrency);

            var tasks = studioApps.Select(async app =>
            {
                await semaphore.WaitAsync(ct);
                try
                {
                    var levels = await ParseSecurityLevel(baseUrl, app.Identifier!, ct);
                    return new AppAuthLevelEntry
                    {
                        Identifier = app.Identifier!,
                        Title = app.Title,
                        HasCompetentAuthority = app.HasCompetentAuthority,
                        UserLevel = levels.userLevel,
                        OrgLevel = levels.orgLevel,
                    };
                }
                catch (Exception ex)
                {
                    logger.LogWarning(ex, "Failed to fetch policy for {Id}", app.Identifier);
                    return new AppAuthLevelEntry
                    {
                        Identifier = app.Identifier!,
                        Title = app.Title,
                        HasCompetentAuthority = app.HasCompetentAuthority,
                        UserLevel = null,
                        OrgLevel = null,
                        Error = true,
                    };
                }
                finally
                {
                    semaphore.Release();
                }
            });

            var entries = await Task.WhenAll(tasks);
            var entryList = entries.ToList();

            var result = new AuthLevelStatistics
            {
                TotalApps = entryList.Count,
                Level4Apps = entryList.Where(e => e.UserLevel == 4).ToList(),
                Level3Apps = entryList.Where(e => e.UserLevel == 3).ToList(),
                Level2Apps = entryList.Where(e => e.UserLevel == 2).ToList(),
                OtherApps = entryList.Where(e => e.UserLevel is null or 0 or 1).ToList(),
                ErrorCount = entryList.Count(e => e.Error),
            };

            return Ok(result);
        }
        catch (HttpRequestException ex)
        {
            logger.LogError(ex, "Failed to compute auth level statistics in {Environment}", environment);
            return StatusCode(StatusCodes.Status502BadGateway, "Upstream service unavailable");
        }
    }

    private async Task<(int? userLevel, int? orgLevel)> ParseSecurityLevel(string baseUrl, string id, CancellationToken ct)
    {
        await using var stream = await client.GetResourcePolicyAsync(baseUrl, id, ct);
        using var reader = XmlReader.Create(stream, new XmlReaderSettings { Async = true });
        var policy = XacmlParser.ParseXacmlPolicy(reader);

        int? userLevel = null;
        int? orgLevel = null;

        foreach (var obligation in policy.ObligationExpressions)
        {
            foreach (var assignment in obligation.AttributeAssignmentExpressions)
            {
                var category = assignment.Category?.ToString();
                if (assignment.Property is XacmlAttributeValue attrValue && category is not null)
                {
                    if (category == "urn:altinn:minimum-authenticationlevel"
                        && int.TryParse(attrValue.Value, out var uLevel))
                    {
                        userLevel = uLevel;
                    }
                    else if (category == "urn:altinn:minimum-authenticationlevel-org"
                        && int.TryParse(attrValue.Value, out var oLevel))
                    {
                        orgLevel = oLevel;
                    }
                }
            }
        }

        return (userLevel, orgLevel);
    }

    private bool TryResolveBaseUrl(string environment, out string baseUrl)
    {
        return _options.Environments.TryGetValue(environment, out baseUrl!);
    }
}

public class AppAuthLevelEntry
{
    public string Identifier { get; set; } = string.Empty;
    public Dictionary<string, string>? Title { get; set; }
    public CompetentAuthority? HasCompetentAuthority { get; set; }
    public int? UserLevel { get; set; }
    public int? OrgLevel { get; set; }
    public bool Error { get; set; }
}

public class AuthLevelStatistics
{
    public int TotalApps { get; set; }
    public List<AppAuthLevelEntry> Level4Apps { get; set; } = [];
    public List<AppAuthLevelEntry> Level3Apps { get; set; } = [];
    public List<AppAuthLevelEntry> Level2Apps { get; set; } = [];
    public List<AppAuthLevelEntry> OtherApps { get; set; } = [];
    public int ErrorCount { get; set; }
}
