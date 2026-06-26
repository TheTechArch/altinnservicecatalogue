---
name: altinn-catalogue
description: Answer questions about Altinn services, resources, access packages and roles using the `altinn` MCP server. Use for any question about who can access a service, what a role or access package grants access to, finding services by name/owner/type, or exploring the Altinn access model. This is the entry point — it explains the data model and routes to the focused altinn-* skills.
---

# Altinn Service Catalogue — answering questions

This project ships an MCP server named **`altinn`** (see `.mcp.json`) that proxies the
Altinn Resource Registry and Access Management APIs (production: `platform.altinn.no`).
Use its tools to answer natural-language questions about public digital services.

## The domain model (read this first)

- **Resource / service** — a registered service (`identifier` like `app_brg_samordnet-registermelding`
  or `skd_mva`). Has a title (multi-language), `resourceType`, owner (`hasCompetentAuthority`), status.
- **Policy** — each resource has an XACML policy. The policy grants access to **subjects**.
- **Subject** — either an **access package** (`urn:altinn:accesspackage:<slug>`) or a **role**
  (`urn:altinn:rolecode:<code>`, `urn:altinn:role:<code>`, `urn:altinn:external-role:<variant>:<code>`).
- **Access package** — a named bundle used for delegation, organised into **areas** inside **groups**.
- **Role** — e.g. *daglig leder* (DAGL). Roles can carry access packages and resources.

Two directions of questions:
1. **Resource → subjects**: "who/what can access service X" → access packages + roles. → `altinn-resource-access`
2. **Subject → resources**: "what can role/package Y access" → list of services. → `altinn-subject-access`

## The golden rule: resolve names to identifiers first

Users speak in **names**; the APIs mostly need **identifiers/URNs**. Always resolve first:

| User says | Resolve with | You get |
|-----------|--------------|---------|
| a service name | `find_resources` | resource `identifier` |
| an access package name | `find_access_packages` | package `urn` |
| a role name | `find_roles` | role `code` + `variant` |

If a resolution returns several candidates, show them and pick/confirm the best match
(matching owner, type and exact title) before continuing.

## Tool catalog (server: `altinn`)

Resolution / search:
- `find_resources(name, resourceType?)` — services by name → concise list with identifiers.
- `find_access_packages(name)` — access packages by name → id, urn, area, group.
- `find_roles(name)` — roles by name/code → code, variant, urn, provider.
- `search_resources`, `get_resource_list`, `search_packages` — lower-level search.

Resource → subjects:
- `get_resource_access_packages(id)` — access packages with access (name/area/group enriched).
- `get_resource_roles(id)` — roles with access.
- `get_resource_policy_subjects(id)` — raw subjects (roles + packages).
- `get_resource_policy_rules(id)` — per-rule subject → action mapping.
- `get_resource_rights(id, language)` — delegable rights/actions.

Subject → resources:
- `get_access_package_resources(urnOrName)` — services an access package can access.
- `get_role_resources(role, variant, includePackageResources)` — services a role can access.
- `get_role_packages(role, variant, includeResources)` — packages assigned to a role.
- `get_resources_by_subjects(subjectUrns[])` — generic reverse lookup for any subject URNs.

Detail / metadata:
- `get_resource(id)`, `get_organizations`, `get_organization_sub_types`.
- `get_package_by_id/urn`, `get_package_resources`, `get_package_groups`,
  `get_package_group_areas`, `get_area_packages`, `export_packages`.
- `get_roles`, `get_role_by_id`.

## Focused skills

- **altinn-resource-access** — who/what has access to a service.
- **altinn-subject-access** — what a role / access package can access.
- **altinn-access-packages** — explore access packages, groups, areas, contents.
- **altinn-roles** — explore roles, their packages and resources.
- **altinn-resource-lookup** — find and describe services, owners, types, rights, security level.

## Environment (prod vs tt02)

Every tool accepts an optional `environment` argument:
- **Default is `prod`** (production, `platform.altinn.no`) — omit the argument for normal questions.
- Pass `environment: "tt02"` (test, `platform.tt02.altinn.no`) **only when the user explicitly asks**
  for tt02/test data. When you do, say which environment the answer came from.

## Answering style

- Lead with the direct answer (a short list/count), then offer detail.
- Always show the resolved identifier/URN you used, so the user can verify the match.
- Note when a result looks empty because a name didn't resolve — suggest the closest matches.
- Answers come from **production** by default; query tt02 only when the user explicitly asks (see Environment above).
