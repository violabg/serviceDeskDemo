# When to read this

Use this checklist when adding a new dashboard or admin section, wiring it into grouped navigation, and enabling permissions safely.

## Last verified

2026-07-18, commit 71a9195, dirty worktree. Evidence from repository files:

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
