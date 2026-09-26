# When to read this

Use this checklist before adding a database entity that needs an independent permission boundary or a new ACCESS_SECTIONS entry for a dashboard/admin section or gateway. Nested routes and entities accessed only inside an existing gated workflow use that section's permission and do not automatically need a separate section key.

## Last verified

2026-09-26, dirty worktree. Evidence from repository files:

- lib/access-control.ts
- lib/access-control/server.ts
- lib/service-desk-navigation.ts
- lib/service-desk-navigation.test.ts
- lib/access-control.test.ts
- prisma/seed.ts
- prisma/schema.prisma
- app/(dashboard)/admin/_lib/current-application-user.ts
- app/(dashboard)/(admin)/users/page.tsx
- docs/agents/knowledge/access-control.md

## Dashboard Section and Permission Creation Flow Checklist

## Evidence

- Base permissions are generated from ACCESS_SECTIONS and ACCESS_OPERATIONS, not manually entered in UI: lib/access-control.ts.
- Bootstrap and seed flow upserts permissions and binds them to the Admin role: lib/access-control/server.ts, prisma/seed.ts.
- Sidebar visibility is permission-driven from grouped navigation config: lib/service-desk-navigation.ts.
- Admin routes enforce permission gates server-side before rendering: app/(dashboard)/(admin)/users/page.tsx, app/(dashboard)/admin/_lib/current-application-user.ts.
- Tests verify grouping, filtering, and permission model assumptions: lib/service-desk-navigation.test.ts, lib/access-control.test.ts.

## Unified Add-a-Section Runbook

Use this sequence when introducing an independently protected section such as customers, assets, or technicians. A new Prisma model alone does not create privileges: Customer and Asset data currently participate in ticket workflows under tickets permissions. Keep a new access boundary's permissions, navigation, routes, and tests in one change set.

1. Extend permission source of truth

- A new top-level access boundary requires a new ACCESS_SECTIONS entry. Do not reuse an unrelated section key solely to avoid creating privileges.
- Add the new section id to ACCESS_SECTIONS in lib/access-control.ts.
- Do not add ad hoc operations; keep ACCESS_OPERATIONS as read, write, manage unless the operation model is intentionally changed for all sections.
- Confirm INITIAL_PERMISSIONS now includes section-id:read, section-id:write, section-id:manage via ACCESS_SECTIONS x ACCESS_OPERATIONS.
- Do not rely on a Prisma migration or model creation to grant these keys; bootstrapAccessControl persists them and upserts each as a grant on the code-owned Admin role. Any user already assigned Admin inherits the new grants through that role, not through a direct per-user permission insert.

2. Add sidebar navigation wiring when applicable

- For a user-navigable section, add a new item in SERVICE_DESK_NAVIGATION in lib/service-desk-navigation.ts.
- Set requiredPermission to { section: "section-id", operation: "read" } and add the section icon mapping in components/app-sidebar.tsx.
- Gateway boundaries do not need a sidebar item. When navigation changes, preserve hiding of empty groups through getReadableServiceDeskNavigationGroups.

3. Scaffold protected dashboard routes

- Create route files under app/(dashboard)/... following existing section patterns (for example tickets and admin users).
- In each page, resolve current application access server-side and gate rendering with hasPermission(..., "section-id", "read").
- Redirect unauthorized access to /dashboard from server components.
- In server actions, gate mutations with write (and manage where higher-impact actions exist).
- Keep actor identity server-derived using requireCurrentApplicationAccess; do not trust client-submitted actor ids.

4. Update automated tests in the same PR

- Extend lib/access-control.test.ts to assert the new section is in ACCESS_SECTIONS and receives read/write/manage generated permissions.
- Extend lib/service-desk-navigation.test.ts for section visibility with and without section-id:read.
- Add or update route/action tests for server-side read and write/manage gates where the section introduces new behavior.

5. Seed the approved database and validate before handoff

- Confirm the target database/environment is authorized before running pnpm db:seed. bootstrapAccessControl deletes permissions for sections no longer in ACCESS_SECTIONS; review the complete section list before seeding so existing grants are not removed unintentionally.
- Run pnpm db:seed against that approved target and confirm output indicates permissions were seeded and the Admin role was created or upserted. Verify the new read/write/manage keys are granted to Admin; the seed count alone does not prove the intended user has access.
- When INITIAL_ADMIN_EMAIL is non-empty after trimming, confirm output states `Initial administrator role assigned`; this attaches the expanded Admin role to the administrator user.
- When INITIAL_ADMIN_EMAIL is missing, empty, or whitespace-only, output states `INITIAL_ADMIN_EMAIL not set; administrator role not assigned`. Configure a non-empty administrator email and rerun seed before relying on an administrator session for the new boundary.
- Confirm the configured administrator has the Admin UserRole and receives the new keys in effective permissions. Existing Admin-role holders inherit the role's new keys after bootstrap; do not grant each key directly to individual administrators.
- Check diagnostics, run pnpm typecheck and scoped lint, then focused access-control, navigation, and route/action tests. Broaden validation only when the change requires it.

6. Verify admin assignment flow still works

- Ensure new base permissions are assignable through role management flows after seed.
- Confirm the intended administrator can read and use the new section after bootstrap and that another user lacking its key cannot access it.
- For a navigable section, confirm it appears in sidebar only for users with section-id:read in effective permissions.
- Confirm route-level access remains blocked when permission is missing even if a user can reach the URL manually.

## Permission Assignment Flow

- Permission creation source of truth is code constants in access-control.
- Permission persistence runs through bootstrapAccessControl in server access-control.
- Role assignment happens through admin role management pages and actions.
- User effective permissions are resolved server-side as an allow-only union of role permissions and then used to filter navigation and protect routes.

## Security and Auth Implications

- Do not create base permissions from free-text admin UI input.
- Do not gate new sections in client components only; enforce on server routes and actions.
- Keep actor identity server-derived in management operations.

## Pitfalls to avoid

- Adding a new top-level access boundary without adding a section and generated privilege keys.
- Adding a section route without adding it to ACCESS_SECTIONS.
- Adding a navigation item without requiredPermission.
- Adding permission checks only in UI and skipping server enforcement.
- Forgetting tests when introducing a new navigation group or permission-dependent section.
- Adding an independently gated database entity but skipping Admin role grants or the configured administrator's Admin assignment.
- Running seed against an unapproved target or dropping an existing ACCESS_SECTIONS key without accounting for permission deletion.
