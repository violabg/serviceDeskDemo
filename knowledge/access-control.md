# Access Control Reference

## When to read this

Use this reference for existing roles, permission assignments, operation policy, seed behavior, or effective permissions. For a new application access boundary, use `dashboard-section-permission-flow-checklist.md`; read both documents when the task also changes existing role assignments.

## Last verified

2026-09-26, dirty worktree.

## Evidence

- `lib/access-control.ts` defines code-owned sections, operations, and generated base permissions.
- `lib/access-control/server.ts` bootstraps permissions, binds them to the Admin role, and resolves effective permissions from user roles.
- `prisma/seed.ts` runs the bootstrap flow and reports whether the configured initial administrator received the Admin role.
- `prisma/schema.prisma` defines Customer, Asset, and Ticket models separately from the code-defined access sections.
- `app/(dashboard)/layout.tsx`, `app/(dashboard)/(admin)/actions.ts`, and `app/(dashboard)/tickets/actions.ts` enforce server-side gates.

## Permission Vocabulary

Application permissions are created from code, not from the admin UI.

- Base permissions come from `ACCESS_SECTIONS` and `ACCESS_OPERATIONS` in `lib/access-control.ts`.
- `read`, `write`, and `manage` are the canonical operation set. Do not add ad hoc operations for an existing section.
- Assign existing base permissions to roles through role management. Do not create base permissions from UI input.

## Independent Entity Privileges

A database entity does not automatically create a permission. When a new entity needs its own read/write/manage boundary, add it to `ACCESS_SECTIONS` and let `INITIAL_PERMISSIONS` generate its operation keys. An entity accessed only inside an existing gated workflow can use that workflow's section: current Customer and Asset reads in ticket workflows are gated by tickets permissions. Never reuse an unrelated section merely to avoid defining an independent boundary. Gate new routes and mutations on the server; add permission-filtered navigation when users need to browse the section. Source: `prisma/schema.prisma`, `lib/access-control.ts`, `lib/service-desk-navigation.ts`, `app/(dashboard)/tickets/new/page.tsx`, `app/(dashboard)/tickets/actions.ts`.

## Admin Grants and Seed Verification

`bootstrapAccessControl` upserts every generated base permission and grants each one to the system Admin role through `RolePermission`. Users already holding Admin inherit its expanded privileges. When `INITIAL_ADMIN_EMAIL` is nonblank, bootstrap also upserts that application user and assigns Admin through `UserRole`; without it, seed logs that no initial administrator role was assigned. Do not claim the administrator has the new access merely because the Admin role or the database model exists. Use the runbook in `dashboard-section-permission-flow-checklist.md` to seed the authorized database, verify the Admin grants and intended administrator's effective permissions, and test the read/write/manage gates. This repository does not grant new base permissions directly to a single administrator user. Source: `lib/access-control/server.ts`, `prisma/seed.ts`, `lib/access-control.test.ts`.

Bootstrap deletes permissions whose sections are no longer in `ACCESS_SECTIONS` before upserting the current set. Review changes to the section list and the target database before running seed. Source: `lib/access-control/server.ts`.

## Operation and Assignment Gates

`getEffectivePermissionKeys` unions grants from all the user's roles. `hasPermission` checks one exact `section:operation` key; `manage` does not implicitly grant `write` or `read`. The dashboard layout requires dashboard read; section pages check read before protected data renders. Role assignment requires users write, role management requires roles read/write, and reopening a closed ticket requires tickets manage. Keep the actor identity derived from the server session and gate writes on the server. Source: `lib/access-control.ts`, `lib/access-control/server.ts`, `app/(dashboard)/layout.tsx`, `app/(dashboard)/(admin)/actions.ts`, `app/(dashboard)/tickets/actions.ts`.
