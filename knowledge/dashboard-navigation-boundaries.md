# When to read this

Use this before adding or changing dashboard breadcrumbs, sidebar groups or links, navigation visibility or active state, or dashboard route structure.

## Last verified

2026-09-27, current working tree. Read-only source and existing-test inspection; no browser navigation, authenticated runtime, database operation or product test execution was performed.

- `components/dashboard-breadcrumbs.tsx` and `components/dashboard-breadcrumbs.test.tsx`
- `lib/service-desk-navigation.ts` and `lib/service-desk-navigation.test.ts`
- `components/app-sidebar.tsx` and `components/app-sidebar.test.tsx`
- `components/nav-main.tsx` and `components/nav-main.test.tsx`
- `app/(dashboard)/layout.tsx` and the dashboard, users, roles and tickets page sources listed below
- `app/(dashboard)/admin/_lib/current-application-user.ts`, `lib/access-control.ts` and `getDashboardAccessForSessionUser` in `lib/access-control/server.ts`
- `CONTEXT.md` and `docs/agents/context-glossary.md` record vocabulary; the latter is the agent-system glossary.
- [Official Next.js Route Groups documentation](https://nextjs.org/docs/app/api-reference/file-conventions/route-groups), retrieved 2026-09-27; displayed version 16.3.6 matches the repository dependency. Parenthesized organizational folders do not contribute public URL segments.

## Dashboard Navigation Boundaries

## Evidence

### Route ownership

| Page source | Public route |
| --- | --- |
| `app/(dashboard)/dashboard/page.tsx` | `/dashboard` |
| `app/(dashboard)/(admin)/users/page.tsx` | `/users` |
| `app/(dashboard)/(admin)/users/[userId]/page.tsx` | `/users/<userId>` |
| `app/(dashboard)/(admin)/roles/page.tsx` | `/roles` |
| `app/(dashboard)/(admin)/roles/[roleId]/page.tsx` | `/roles/<roleId>` |
| `app/(dashboard)/tickets/page.tsx` | `/tickets` |
| `app/(dashboard)/tickets/[id]/page.tsx` | `/tickets/<id>` |
| `app/(dashboard)/tickets/new/page.tsx` | `/tickets/new` |

- `(dashboard)` and `(admin)` organize the inspected page sources without adding URL segments. The separate `admin/_lib` helper location does not establish a public `/admin` landing page; none appears in the scoped dashboard page inventory.
- The dashboard layout owns the sidebar and breadcrumb shell. It redirects unauthenticated users to `/login` and users without `dashboard:read` to `/pending-access`, then passes effective permission keys to `AppSidebar` (`app/(dashboard)/layout.tsx`).
- Users and Roles list/detail page content checks its own section's `read` grant. Ticket list/detail/new content checks `tickets:read`; missing section read access redirects to `/dashboard`. Ticket creation additionally requires `tickets:write`; a read-only user gets a message instead of the form (`page.tsx` sources above).

### Sidebar ownership and visibility

- `SERVICE_DESK_NAVIGATION` defines `Ticket Management` containing Tickets at `/tickets`, and `Access Management` containing Users at `/users` and Roles at `/roles`. These are metadata groups, not route folders or destination pages (`lib/service-desk-navigation.ts`).
- `getReadableServiceDeskNavigationGroups` includes each item only when its exact section `read` key is present, and removes groups with no readable items. `getReadableServiceDeskNavigation` flattens the filtered groups. Permission keys are the union of role grants; `hasPermission` does not infer read from write or manage (`lib/service-desk-navigation.ts`, `lib/access-control.ts`).
- `AppSidebar` marks an item active for an exact destination or a descendant starting with destination plus `/`. A group is active when any readable child is active. Its `/dashboard` header link is separate from the filtered group metadata (`components/app-sidebar.tsx`).
- In expanded mode, `NavMain` renders group toggles and child destination links. It opens active groups initially and opens active groups when a new items reference is received, while preserving other stored toggles. Open state is keyed by group title (`components/nav-main.tsx`).
- In collapsed mode, `NavMain` flattens all supplied child destinations into links with icons, active state, tooltips and accessible names. It does not make the group heading a destination (`components/nav-main.tsx`).

### Breadcrumb ownership

- `DashboardBreadcrumbs` derives cumulative hrefs from non-empty public pathname segments. Every non-final segment is a link; the final segment is the current page. It does not check destination existence, section permissions or record names (`components/dashboard-breadcrumbs.tsx`).
- Explicit labels cover Dashboard, Users and Roles. Other segments replace hyphens/underscores with spaces and capitalize word initials; Tickets uses that fallback. Dynamic IDs are formatted as segment text, not replaced with fetched record titles. `/` renders no crumbs (`components/dashboard-breadcrumbs.tsx`).

## Core rules

- Keep route folders, public URLs, sidebar metadata and breadcrumbs as separate concerns.
- Use a parenthesized route group when a folder only organizes related pages and should not add a URL segment. Use a normal segment when it intentionally belongs in the URL; check whether a landing page is required.
- Do not fix grouping-only URL leakage by hiding the segment later in breadcrumbs; establish the intended route structure first.
- Do not assume every visible pathname segment is a safe breadcrumb destination. Verify actual parent destinations when adding nested routes.
- Keep sidebar visibility tied to exact section read grants and preserve removal of empty groups. Hidden links are not authorization: keep server-side page and operation checks.
- Preserve exact-or-descendant active matching with a slash boundary, and preserve accessible collapsed destination links when modifying grouped navigation.
- Treat active state and group expansion as distinct state. Group titles currently key stored expansion state; changing labels can change that identity.
- Use approved domain labels when they differ from folder names. Sidebar labels do not automatically become breadcrumb labels.

## Practical repo example

- Users and Roles belong to the `Access Management` metadata group and live under `(admin)`, while their public routes are `/users` and `/roles`.
- Tickets belongs to `Ticket Management`. `/tickets/new` and `/tickets/<id>` activate its sidebar destination; their first crumb links to the existing `/tickets` page.
- `/users/<userId>` links its first crumb to the existing `/users` page and displays a formatted ID as the final crumb. Sidebar grouping does not inject an `Access Management` crumb.
- Future grouping-only folders should use route groups such as `(access-management)` rather than adding a public group segment without intended routing behavior.

## Pitfalls to avoid

- Assuming the breadcrumb component already prevents unavailable intermediate destinations or supplies permission-aware links and domain record labels.
- Treating sidebar groups or the helper folder name `admin` as proof of corresponding landing pages.
- Using a plain string prefix for active matching and accidentally matching a sibling path.
- Granting navigation read access implicitly from write/manage, or treating hidden navigation as the access-control gate.
- Losing visible destinations or accessible names when the sidebar collapses, or resetting unrelated group toggles after navigation.
- Treating the Queue/Operations values in `NavMain` tests as production navigation metadata; they are fixtures.

## Existing coverage and limits

- Navigation helper tests cover read filtering, group removal/order and ticket inclusion. Sidebar tests cover readable items and nested active state while mocking `NavMain` and sidebar primitives (`lib/service-desk-navigation.test.ts`, `components/app-sidebar.test.tsx`).
- `NavMain` tests cover collapsed destinations/icons/names/tooltips, expanded grouped links, empty groups and reopening a newly active group while preserving another toggle (`components/nav-main.test.tsx`).
- Breadcrumb tests cover mapped/fallback labels, `/users` href, current-page markup, sibling list items and empty root output. They do not verify actual route availability, permission-aware destinations or record labels (`components/dashboard-breadcrumbs.test.tsx`).
- These statements describe inspected assertions and source behavior, not a passing test run or verified authenticated navigation.
