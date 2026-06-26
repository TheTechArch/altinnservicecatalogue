---
name: altinn-resource-access
description: Find who or what has access to a specific Altinn service/resource — the access packages and roles granted in its policy. Use for questions like "which access packages have access to <service>", "which roles can use <service>", or "who has access to <service>". Uses the `altinn` MCP server.
---

# Who/what has access to a service

Answers the **resource → subjects** direction.

## Recipe

1. **Resolve the service name → identifier** with `find_resources(name)`.
   - Pick the best candidate (match title, owner, type). If ambiguous, list candidates and confirm.
2. **Get the subjects** depending on what was asked:
   - Access packages → `get_resource_access_packages(id)` (returns package name, area, group, isDelegable).
   - Roles → `get_resource_roles(id)`.
   - Both / "who has access" → call both, or `get_resource_policy_subjects(id)` for the raw combined list.
3. **Want the exact actions** (read/write/sign) per subject? Use `get_resource_policy_rules(id)`.
4. **Present**: a short summary count, then the list. Group access packages by area when there are many.

## Worked example

> **Which packages have access to "Samordnet registermelding"?**

1. `find_resources("Samordnet registermelding")` → e.g. `{ identifier: "app_brg_samordnet-registermelding", owner: "brg" }`.
2. `get_resource_access_packages("app_brg_samordnet-registermelding")`.
3. Answer: "N access packages have access: …(name — area)…".

## Notes

- A resource with **no access packages** (only roles, or nothing) is common for legacy/migrated
  Altinn 2 apps. Say so explicitly rather than implying an error.
- Role subjects in policies use the legacy `urn:altinn:rolecode:<code>` form; `get_resource_roles`
  enriches names best-effort — if a name is missing, report the code/urn.
- If `find_resources` returns nothing, broaden the term (drop words) or try
  `search_resources(title=…)` / `get_resource(id)` if the user gave an identifier directly.
