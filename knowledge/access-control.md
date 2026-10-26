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

`getEffectivePermissionKeys` unions the grants held by all of the user's roles. It adds nothing else: the resolved set contains exactly the `section:operation` keys that are stored as grants. `hasPermission` checks one exact `section:operation` key against that resolved set.

## Explicit Read With Write and Manage

Each section has three independent grants: `read`, `write` and `manage`. No grant implies another. A `write` or `manage` grant does not give the read key, so the read key must be granted explicitly.

- When a `section:write` or `section:manage` permission is assigned to a role, the same role must also hold `section:read`, or the assignment must add it in the same change. The same rule applies when a grant is assigned to a user through their roles: the role or user that receives write or manage must have read enabled.
- A role or user that holds `section:write` or `section:manage` without `section:read` fails every read gate of that section: page gates, server action read checks, and navigation filters.
- Read is not implied by any other operation. Assigning `section:read` alone is valid and gives read-only access.
- Do not add read keys in `getEffectivePermissionKeys`, `hasPermission`, page gates, server action gates or navigation filters. Those places check exactly what is granted.
- Removing a role's read grant while the same role still holds write or manage leaves a write or manage key without its read key. Review the write and manage grants of that role in the same change.
- Bootstrap grants every generated key to Admin, including each section's read key, so Admin holds the read key for every section.
- Test the rule in `lib/access-control.test.ts` with a role that holds only `section:write` or only `section:manage`: its effective keys must not include `section:read`. A role that holds `section:write` together with `section:read` must include both keys.
- Gate examples: the dashboard layout requires dashboard read; section pages check read before protected data renders. Role assignment requires users write, role management requires roles read and write, reopening a closed ticket requires tickets manage, and customer status changes require customers manage. A user who should perform one of these actions also holds the read key of that section, because the page that hosts the action checks read first.
- Keep the actor identity derived from the server session and gate writes on the server.
