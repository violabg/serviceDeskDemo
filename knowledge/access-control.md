---
tier: "MustHave"
keywords: ["roles","permissions","admin","operator","rbac","hasPermission"]
intent: "When designing any permission-gated feature, translating requirement role statements (Admin, Operator) into permission keys, changing roles, permission assignments, read/write/manage policy, or diagnosing seed and effective-permission behavior."
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

## Requirement Roles and Permission Keys

User stories and bugs name roles ("only Admin can …", "Operator can …"). The application never gates on a role name: every page, server action and navigation filter gates on an exact `section:operation` key through `hasPermission`. Translate each role statement into keys before designing; never add a role-name check.

- **A role named in a requirement is the set of keys that role holds, read included.** "Admin can create Technicians" means the creation action checks `technicians:write` and the page that hosts it checks `technicians:read`; the role holds both. Keep the role in the obligation ("an Admin can create…") and put the keys in the design. Never rewrite a role statement as a claim about every holder of a single key: a write-only holder cannot reach any page, by the explicit-read rule above. (The Technicians example is illustrative: `ACCESS_SECTIONS` has no `technicians` section today.)
- **"Admin" means admin privileges, not the `Admin` role alone.** Bootstrap creates the `Admin` role as a system role (`isSystem`) and grants it every generated key. `isSystem` marks a role as code-owned and locked against editing in role management; it is not a privilege marker. Any other role an administrator grants the same keys has the same admin privileges, and a key gate already covers it. Do not gate on the role name or on `isSystem`.
- **"Only Admin" means keys that only Admin receives from code.** Gate the action on its key (normally `section:manage`, or `section:write` for creation and editing) and grant that key to no other role in code. Role management can still grant it to another role; that is an administrator's deliberate choice, not a defect of the design. Do not gate on `isAdmin`, which is informational only.
- **Admin is the only code-owned role.** Every other role is created and granted keys through role management, not by bootstrap or seed. When a requirement says a non-Admin role must be able to do something, the design adds the key it needs and records the grant as a `Procedure` operation: assign `section:read` plus the needed key to that role in role management, following the explicit-read rule above. Do not make a role code-owned (seeded role or seeded grant list) unless the requirement explicitly asks for it.
- **Data shown inside another section is gated by the host section.** An entity displayed inside another section's workflow is read under the host section's key. The entity's own keys, when it has a section, gate only its own pages and actions.
- **Every write path carries the gate.** When a requirement gates an action, the same key check guards every server entry point that performs it: create, edit, status change, bulk or override paths, and every action that calls the same service function. A conditional gate inside one action must be repeated in every other action that can reach the same change. Resolve the actor's keys on the server from the session; never pass a caller-built flag into a service as the gate.
