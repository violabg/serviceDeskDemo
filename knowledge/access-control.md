---
tier: "PerContext"
intent: "When changing existing roles, permission assignments, read/write/manage policy, or diagnosing seed and effective-permission behavior."
---
# Access Control Reference

## When to read this

Use this reference for existing roles, permission assignments, operation policy, seed behavior, or effective permissions. For a new application access boundary, use `dashboard-section-permission-flow-checklist.md`; read both documents when the task also changes existing role assignments.

## Permission Vocabulary

Application permissions are created from code, not from the admin UI.

- Base permissions come from `ACCESS_SECTIONS` and `ACCESS_OPERATIONS` in `lib/access-control.ts`.
- `read`, `write`, and `manage` are the canonical operation set. Do not add ad hoc operations for an existing section.
- Assign existing base permissions to roles through role management. Do not create base permissions from UI input.

## Independent Entity Privileges

A database entity does not automatically create a permission. When a new entity needs its own read/write/manage boundary, add it to `ACCESS_SECTIONS` and let `INITIAL_PERMISSIONS` generate its operation keys. Customer is the current example: it has its own `customers` section, so its pages and actions gate on `customers:read`, `customers:write` and `customers:manage`. Asset has no section of its own; its reads and writes inside ticket workflows are gated by tickets permissions. An entity accessed only inside an existing gated workflow can use that workflow's section. Never reuse an unrelated section merely to avoid defining an independent boundary. Gate new routes and mutations on the server; add permission-filtered navigation when users need to browse the section.

## Admin Grants and Seed Verification

`bootstrapAccessControl` upserts every generated base permission and grants each one to the system Admin role through `RolePermission`. Users already holding Admin inherit its expanded privileges. When `INITIAL_ADMIN_EMAIL` is nonblank, bootstrap also upserts that application user and assigns Admin through `UserRole`; without it, seed logs that no initial administrator role was assigned. Do not claim the administrator has the new access merely because the Admin role or the database model exists. Use the runbook in `dashboard-section-permission-flow-checklist.md` to seed the authorized database, verify the Admin grants and intended administrator's effective permissions, and test the read/write/manage gates. This repository does not grant new base permissions directly to a single administrator user.

Bootstrap deletes permissions whose sections are no longer in `ACCESS_SECTIONS` before upserting the current set. Review changes to the section list and the target database before running seed.

## Operation and Assignment Gates

`getEffectivePermissionKeys` unions grants from all the user's roles, then applies the implied-permission rule below. `hasPermission` checks one exact `section:operation` key against those resolved keys.

## Implied Read and Write

Permissions form a chain on each section: `manage` implies `write`, and `write` implies `read`. A user who holds `section:manage` therefore also holds `section:write` and `section:read`; a user who holds `section:write` also holds `section:read`. `read` implies nothing.

- `getEffectivePermissionKeys` adds the implied keys to every resolved key, for every section. The added keys are treated exactly like granted ones: `hasPermission`, page gates, server action gates and navigation filters all see them.
- Do not store implied keys as `RolePermission` rows or `UserRole` changes. The chain is applied when effective permissions are resolved, so an existing manage or write grant gains its implied keys without a seed run or a new assignment.
- The chain holds for every section, including `dashboard`, `users`, `roles`, `tickets` and `customers`.
- Do not write a read check that excludes users who hold write or manage. Such a check already passes for them.
- Removing a role's manage or write grant also removes the implied keys, unless another role grants them explicitly.
- Test the chain in `lib/access-control.test.ts` with a user who holds only manage on a section: their effective keys must include that section's write and read keys. The dashboard layout requires dashboard read; section pages check read before protected data renders. Role assignment requires users write, role management requires roles read/write, reopening a closed ticket requires tickets manage, and customer status changes require customers manage. Keep the actor identity derived from the server session and gate writes on the server.
