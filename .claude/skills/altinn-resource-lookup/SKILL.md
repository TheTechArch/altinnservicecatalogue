---
name: altinn-resource-lookup
description: Find and describe Altinn services/resources — search by name, owner, type or keyword, and show details such as description, owner, status, resource type, delegable rights and security level. Use for questions about services themselves (e.g. "find services from Skatteetaten", "what is service X", "which MaskinportenSchema resources exist", "what rights does service Y have"). Uses the `altinn` MCP server.
---

# Finding and describing services

## Find services

- By name/title: `find_resources(name, resourceType?)` → concise list (identifier, title, type, owner, status, delegable).
- Flexible filters: `search_resources(id?, title?, description?, resourceType?, keyword?, reference?)`.
- By owner: there's no owner filter on search — `find_resources`/`search_resources` then filter the
  returned `owner.orgcode`, or get the owner list with `get_organizations`.
- Whole catalogue: `get_resource_list(includeApps, includeAltinn2)` (large — prefer search).

`resourceType` values: `GenericAccessResource`, `Systemresource`, `MaskinportenSchema`,
`Altinn2Service`, `AltinnApp`, `MigratedApp`, `BrokerService`, `CorrespondenceService`, `Consent`, `Default`.

## Describe one service

- Full record: `get_resource(identifier)` — title, description, contact points, references, etc.
- Delegable rights/actions: `get_resource_rights(identifier, language="nb")`.
- Who has access (packages/roles): use skill **altinn-resource-access**.
- Security level: the catalogue computes this from the XACML policy; for a single resource the policy
  is available via `get_resource_policy_rules(identifier)`. (The web app's Statistics tab does this in bulk.)

## Organizations / owners

- `get_organizations()` → orgs with code, name, org number, logo.
- `get_organization_sub_types()` → org sub-types (AS, ENK, …).

## Tips

- Always echo the `identifier` you resolved to, so the user can confirm it's the right service.
- When listing many results, show title + owner + type and cap the list, offering to narrow by type/owner.
- `delegable=false` services can't be delegated — call that out when the user asks about delegation.
