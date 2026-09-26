# When to read this

Use this before adding or changing dashboard breadcrumbs, grouped sidebar navigation, or admin-area route structure.

## Last verified

2026-09-26, dirty worktree. Evidence from repository files:

- components/dashboard-breadcrumbs.tsx
- app/(dashboard)/(admin)
- lib/service-desk-navigation.ts
- components/app-sidebar.tsx
- `CONTEXT.md` and `docs/agents/context-glossary.md` both record vocabulary; the latter is the agent-system glossary. Breadcrumb behavior was checked against the component above.

## Dashboard Navigation Boundaries

## Evidence

- Breadcrumbs are derived from public pathname segments, and the current component renders every non-last segment as a link without checking whether the intermediate URL has a page.
- Access Management is a grouped area whose internal folder may organize related pages without needing its own public URL segment.
- Sidebar groups are defined in navigation metadata, not inferred from route folders.
- The sidebar treats grouped items as active when a descendant URL matches.
- The approved domain label for this area is `Access Management`.

## Core rules

- Do not assume every visible pathname segment is a safe breadcrumb destination.
- Treat sidebar grouping as information architecture, not as proof that an intermediate URL has a page.
- Treat route folders, public URLs, and breadcrumb output as separate concerns.
- When a folder exists only to group related pages and should not affect public URLs, use a Next.js route group using parentheses.
- Use a normal public segment only when that folder has its own intended page or should intentionally appear in the public URL.
- Do not solve grouping-only URL leakage by hiding the segment later in breadcrumbs; fix route structure first.
- Use approved domain labels from repo language when they differ from raw folder names.

## Practical repo example

- The sidebar groups Users and Roles under `Access Management`.
- If `admin` is only organizational, model it as `(admin)` so public URLs become `/users` and `/roles` instead of `/admin/users` and `/admin/roles`.
- Breadcrumbs follow the public URL segments instead of hiding internal grouping names after the fact; the current component still assumes every non-final segment is a valid link.
- Future folder-only grouping that should stay out of the URL should use route groups such as `(access-management)` instead of a public segment.

## Pitfalls to avoid

- Assuming the current breadcrumb implementation already avoids dead intermediate links: it still links every non-final segment. Verify a destination exists before extending that behavior to new route shapes.
- Leaving grouping-only folder names in public URLs and then trying to hide them later in breadcrumbs.
- Reusing sidebar group labels as URL assumptions.
- Treating a grouping folder as a public URL segment when it has no intended page of its own.
- Letting route folder names override approved domain terminology.
