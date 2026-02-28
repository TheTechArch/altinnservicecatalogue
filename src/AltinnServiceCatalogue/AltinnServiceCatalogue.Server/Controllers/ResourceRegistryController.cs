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
            var result = await client.GetResourceListAsync(baseUrl, includeApps, includeAltinn2, ct);
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

    private bool TryResolveBaseUrl(string environment, out string baseUrl)
    {
        return _options.Environments.TryGetValue(environment, out baseUrl!);
    }
}
