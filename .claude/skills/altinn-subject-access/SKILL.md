---
name: altinn-subject-access
description: Find what an Altinn access package or role can access — the list of services/resources it grants. Use for questions like "what services does <access package> have access to", "what can <role> access", or "which resources does tilgangsstyrer grant". Uses the `altinn` MCP server.
---

# What can a role / access package access

Answers the **subject → resources** direction.

## Is the subject an access package or a role?

- Sounds like a delegation bundle (e.g. *tilgangsstyrer*, *skatt næring*, *regnskap*) → **access package**.
- Sounds like a person's role (e.g. *daglig leder*, *regnskapsfører*, DAGL, REGN) → **role**.
- If unsure, try `find_access_packages(name)` and `find_roles(name)` and use whichever resolves.

## Recipe — access package

1. `find_access_packages(name)` → pick the package, note its `urn`.
2. `get_access_package_resources(urn)` (also accepts the name directly) → list of resource identifiers.
3. To enrich a resource identifier with a title/owner, call `get_resource(identifier)` or
   `find_resources` on the slug. Only enrich the ones the user cares about — the list can be long.

> **What services does "tilgangsstyrer" have access to?**
> → `find_access_packages("tilgangsstyrer")` → urn `urn:altinn:accesspackage:tilgangsstyrer`
> → `get_access_package_resources("urn:altinn:accesspackage:tilgangsstyrer")` → answer with the count + list.

## Recipe — role

1. `find_roles(name)` → note `code` and `variant` (e.g. code `daglig-leder`, variant `ccr`).
2. Resources: `get_role_resources(role=code, variant, includePackageResources=true)`
   (set `includePackageResources=true` to also include resources reachable via the role's packages).
3. Packages assigned to the role: `get_role_packages(role=code, variant, includeResources=false)`.

## Notes

- `get_access_package_resources` deduplicates and returns `{ identifier, urn }` per resource.
  If it returns `error`, the name didn't resolve — fall back to `find_access_packages` and retry with the URN.
- Big result sets: report the total count first, then a representative sample, and offer the full list.
- Generic fallback for any subject URN(s): `get_resources_by_subjects(["urn:altinn:accesspackage:…", "urn:altinn:rolecode:…"])`.
