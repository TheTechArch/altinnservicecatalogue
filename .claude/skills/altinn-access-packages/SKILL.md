---
name: altinn-access-packages
description: Explore Altinn access packages — search them, inspect a package's metadata, the resources it contains, and the group/area hierarchy they are organised in. Use for questions about access packages themselves (e.g. "what is the X package", "which packages exist for skatt", "what resources are in package Y", "list the package areas"). Uses the `altinn` MCP server.
---

# Exploring access packages

Access packages bundle resources for delegation. They are organised as **groups → areas → packages**.

## Common tasks

**Find packages by name/term**
- `find_access_packages(term)` → id, urn, name, area, group, isDelegable, description.
- Lower level: `search_packages(term, typeName?)`.

**Describe one package**
- By URN: `get_package_by_urn("urn:altinn:accesspackage:skatt-naring")`.
- By id (UUID): `get_package_by_id(id)`.

**What resources are in a package** (the package's defined contents, not policy access)
- `get_package_resources(packageId)` (needs the UUID from a find/get call).
- vs. **what a package can access via policies** → use skill `altinn-subject-access`
  (`get_access_package_resources`). These can differ; be explicit about which the user wants.

**Browse the hierarchy**
- `get_package_groups()` → groups (each with a UUID).
- `get_package_group_areas(groupId)` → areas in a group.
- `get_area_packages(areaId)` → packages in an area.
- `export_packages()` → the entire group/area/package tree in one call (large; good for counting/overview).

## Tips

- "Which package should I use for X?" → `find_access_packages("X")`, then show name + area + whether
  `isDelegable`, and the description so the user can choose.
- IDs come in two forms: a **UUID** (`id`) for `*_by_id`/area/group/resources calls, and a **URN**
  (`urn`) for policy/subject calls. Keep them straight.
- For an overview ("how many packages / what areas exist"), `export_packages()` once and summarise.
