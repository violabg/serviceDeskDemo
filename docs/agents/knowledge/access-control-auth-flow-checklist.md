# Access Control And Auth Flow Checklist

Use this file before changing login, pending-access, dashboard access gates, local user sync, permission bootstrap, or permission-filtered navigation.

## When to read

- The task changes [app/login/page.tsx](./../../../app/login/page.tsx), [app/pending-access/page.tsx](./../../../app/pending-access/page.tsx), or [app/(dashboard)/layout.tsx](./../../../app/%28dashboard%29/layout.tsx).
- The task changes [lib/access-control.ts](./../../../lib/access-control.ts), [lib/access-control/server.ts](./../../../lib/access-control/server.ts), or [lib/service-desk-navigation.ts](./../../../lib/service-desk-navigation.ts).
- The task adds a new protected dashboard section or changes permission-based redirects.
- The task changes how Neon-authenticated users become local application users.

## Ownership map

- [lib/auth/server.ts](./../../../lib/auth/server.ts) owns Neon Auth server setup.
- [lib/access-control/server.ts](./../../../lib/access-control/server.ts) owns local application-user synchronization, permission bootstrap, and access lookups.
- [lib/access-control.ts](./../../../lib/access-control.ts) owns canonical permission sections, operations, and permission-key helpers.
- [lib/service-desk-navigation.ts](./../../../lib/service-desk-navigation.ts) owns permission-filtered navigation groups.
- [app/login/page.tsx](./../../../app/login/page.tsx), [app/pending-access/page.tsx](./../../../app/pending-access/page.tsx), and [app/(dashboard)/layout.tsx](./../../../app/%28dashboard%29/layout.tsx) own redirect behavior for unauthenticated, pending-access, and dashboard-access states.
- [app/(dashboard)/admin/_lib/current-application-user.ts](./../../../app/%28dashboard%29/admin/_lib/current-application-user.ts) is the reusable guard for protected dashboard actions and pages.

## Rules to preserve

- Permissions are code-defined from `ACCESS_SECTIONS` and `ACCESS_OPERATIONS` in [lib/access-control.ts](./../../../lib/access-control.ts). Do not create base permissions from freeform UI input.
- `bootstrapAccessControl` in [lib/access-control/server.ts](./../../../lib/access-control/server.ts) is the bootstrap path for base permissions and the system Admin role. New protected sections must be reflected there indirectly by updating `ACCESS_SECTIONS`.
- Neon session users are not the canonical application user record. `ensureApplicationUserForSessionUser` in [lib/access-control/server.ts](./../../../lib/access-control/server.ts) must map Neon identity data onto the local Prisma `User` model.
- Local user lookup prefers `neonAuthId` and falls back to normalized email so seeded users can be completed on first login.
- Redirect order is strict:
  - unauthenticated users go to `/login`
  - authenticated users without `dashboard:read` go to `/pending-access`
  - authenticated users with dashboard access may enter `/dashboard`
- `requireCurrentApplicationAccess` in [app/(dashboard)/admin/_lib/current-application-user.ts](./../../../app/%28dashboard%29/admin/_lib/current-application-user.ts) is the shared gate for protected server actions and dashboard pages. Prefer reusing it instead of re-implementing session and redirect logic.
- Navigation visibility is permission-filtered. `SERVICE_DESK_NAVIGATION` in [lib/service-desk-navigation.ts](./../../../lib/service-desk-navigation.ts) may list a section only when the corresponding `read` permission is granted.

## Common change patterns

- Adding a protected section:
  - add the section id to `ACCESS_SECTIONS` in [lib/access-control.ts](./../../../lib/access-control.ts)
  - verify navigation ownership in [lib/service-desk-navigation.ts](./../../../lib/service-desk-navigation.ts)
  - gate the route with the matching permission check
  - keep bootstrap behavior seed-driven rather than UI-driven
- Changing login or pending-access behavior:
  - preserve `connection()` plus Suspense page structure where the route depends on live session state
  - keep redirects driven by access facts from [lib/access-control/server.ts](./../../../lib/access-control/server.ts) rather than duplicating permission logic in the page

## Anti-patterns

- Do not treat `User` and authenticated session user as the same persistence concept.
- Do not add navigation entries without a matching permission boundary.
- Do not bypass `requireCurrentApplicationAccess` for new protected ticket or admin mutations unless a stronger route-local abstraction is introduced.
- Do not invent permission names outside the `${section}:${operation}` shape.

## Verification anchors

- [lib/access-control.test.ts](./../../../lib/access-control.test.ts) covers permission generation, bootstrap behavior, and first-login user sync.
- [lib/service-desk-navigation.test.ts](./../../../lib/service-desk-navigation.test.ts) covers permission-filtered navigation visibility.
- [app/login/page.test.tsx](./../../../app/login/page.test.tsx) and [app/pending-access/page.test.tsx](./../../../app/pending-access/page.test.tsx) cover redirect behavior.