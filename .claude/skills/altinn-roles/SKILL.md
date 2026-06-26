---
name: altinn-roles
description: Explore Altinn roles — search roles by name/code, inspect a role's metadata, and list the access packages and resources a role carries. Use for questions about roles themselves (e.g. "what is the DAGL role", "which roles exist", "what packages does daglig leder have", "what can regnskapsfører do"). Uses the `altinn` MCP server.
---

# Exploring roles

Roles (e.g. *daglig leder* / DAGL) are subjects that grant access, and can carry access packages.

## Resolve the role first

`find_roles(name)` accepts a name, code or partial term and returns, per role:
`id`, `name`, `code`, **`variant`**, `urn`, `legacyRoleCode`, `provider`, `isKeyRole`,
`isResourcePolicyAvailable`.

The **`variant`** is required by the role lookup tools and is derived from the URN:
- `urn:altinn:role:tilgangsstyrer` → variant `altinn`, code `tilgangsstyrer`
- `urn:altinn:external-role:ccr:daglig-leder` → variant `ccr`, code `daglig-leder`

## Common tasks

**List access packages a role carries**
- `get_role_packages(role=code, variant, includeResources=false)`.
- Set `includeResources=true` to also see each package's resources.

**List resources a role can access**
- `get_role_resources(role=code, variant, includePackageResources=true)`.
- `includePackageResources=true` adds resources reachable through the role's packages
  (usually what users mean by "what can this role do").

**Describe a role / list all roles**
- `get_role_by_id(id)` for full detail; `get_roles()` for the full list (filter/summarise as needed).

## Tips

- `isResourcePolicyAvailable=false` means the role can't be used as a subject in resource policies —
  mention this when relevant.
- Key roles (`isKeyRole=true`) are the central business roles; surface them first when listing.
- If a role name is ambiguous across providers (Altinn vs ER/CCR variants), list the candidates with
  their `provider` and `variant` and confirm before drilling in.
