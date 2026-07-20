# When to read this

Use this checklist when adding a new dashboard or admin section, wiring it into grouped navigation, and enabling permissions safely.

## Last verified

2026-07-19, commit unavailable, dirty worktree. Evidence from repository files:

- lib/access-control.ts
- lib/access-control/server.ts
- lib/service-desk-navigation.ts
- lib/service-desk-navigation.test.ts
- lib/access-control.test.ts
- prisma/seed.ts
- app/(dashboard)/admin/_lib/current-application-user.ts
- app/(dashboard)/admin/users/page.tsx
- docs/agents/access-control.md

## Dashboard Section and Permission Creation Flow Checklist

## Evidence

- Base permissions are generated from ACCESS_SECTIONS and ACCESS_OPERATIONS, not manually entered in UI: lib/access-control.ts.
- Bootstrap and seed flow upserts permissions and binds them to the Admin role: lib/access-control/server.ts, prisma/seed.ts.
- Sidebar visibility is permission-driven from grouped navigation config: lib/service-desk-navigation.ts.
- Admin routes enforce permission gates server-side before rendering: app/(dashboard)/admin/users/page.tsx, app/(dashboard)/admin/_lib/current-application-user.ts.
- Tests verify grouping, filtering, and permission model assumptions: lib/service-desk-navigation.test.ts, lib/access-control.test.ts.

## Create New Section Checklist

- Add the section id to ACCESS_SECTIONS in lib/access-control.ts.
- Keep operation model aligned with read, write, and manage defined by ACCESS_OPERATIONS in lib/access-control.ts.
- Run seed so section permissions are upserted and available for role assignment.
- Add section entry to grouped navigation in lib/service-desk-navigation.ts.
- Place item in the correct group, or create a new group when the section needs a distinct category.
- Set requiredPermission to the new section read permission.
- Add route page under dashboard or admin and enforce server-side read checks before rendering data.
- Add mutation actions when needed and enforce write or manage checks in server access-control service methods.
- Update tests for group visibility, section visibility, and access-control behavior.

## Unified Add-a-Section Runbook

Use this sequence when introducing a new section such as clients, assets, or technicians. Keep these steps in one change set so permissions, navigation, routes, and tests stay aligned.

1. Extend permission source of truth

- Add the new section id to ACCESS_SECTIONS in lib/access-control.ts.
- Do not add ad hoc operations; keep ACCESS_OPERATIONS as read, write, manage unless the operation model is intentionally changed for all sections.
- Confirm INITIAL_PERMISSIONS now includes section-id:read, section-id:write, section-id:manage via ACCESS_SECTIONS x ACCESS_OPERATIONS.

1. Add sidebar navigation wiring

- Add a new item in SERVICE_DESK_NAVIGATION in lib/service-desk-navigation.ts.
- Set requiredPermission to { section: "section-id", operation: "read" }.
- Add the section icon mapping in components/app-sidebar.tsx if the new navigation id is rendered in the sidebar.
- Keep grouped navigation behavior intact: empty groups should remain hidden through getReadableServiceDeskNavigationGroups.

1. Scaffold protected dashboard routes

- Create route files under app/(dashboard)/... following existing section patterns (for example tickets and admin users).
- In each page, resolve current application access server-side and gate rendering with hasPermission(..., "section-id", "read").
- Redirect unauthorized access to /dashboard from server components.
- In server actions, gate mutations with write (and manage where higher-impact actions exist).
- Keep actor identity server-derived using requireCurrentApplicationAccess; do not trust client-submitted actor ids.

1. Update automated tests in the same PR

- Extend lib/access-control.test.ts to assert the new section is in ACCESS_SECTIONS and receives read/write/manage generated permissions.
- Extend lib/service-desk-navigation.test.ts for section visibility with and without section-id:read.
- Add or update route/action tests for server-side read and write/manage gates where the section introduces new behavior.

1. Run seed and validation commands before handoff

- Run pnpm db:seed and confirm output indicates permissions were seeded (for example Seeded N permissions and Admin role creation/upsert).
- Run pnpm test and verify access-control and navigation tests pass with the new section.
- Run pnpm typecheck for updated section ids, navigation ids, and route/action typing.

1. Verify admin assignment flow still works

- Ensure new base permissions are assignable through role management flows after seed.
- Confirm the new section appears in sidebar only for users with section-id:read in effective permissions.
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

- Adding a section route without adding it to ACCESS_SECTIONS.
- Adding a navigation item without requiredPermission.
- Adding permission checks only in UI and skipping server enforcement.
- Forgetting tests when introducing a new navigation group or permission-dependent section.
