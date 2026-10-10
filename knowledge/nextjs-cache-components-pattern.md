# Next.js Cache Components and PPR Rendering Pattern

## When to read this

When adding or refactoring admin or dashboard pages that need caching, skeleton loading
states, or must opt out of full dynamic rendering per request.

## Last verified

2026-09-26, dirty worktree. Evidence from repository files and the Next.js 16.3.6 caching, revalidation, and instant-navigation guides:

- `next.config.ts` — `cacheComponents: true` and custom `days` life preset
- `app/(dashboard)/admin/_lib/cache-tags.ts` — tag factory functions
- `app/(dashboard)/tickets/_lib/cache-tags.ts` — ticket tag factory functions
- `app/(dashboard)/(admin)/roles/page.tsx` and `[roleId]/page.tsx` — full page pattern
- `app/(dashboard)/(admin)/users/page.tsx` and `[userId]/page.tsx` — full page pattern
- `app/(dashboard)/layout.tsx` — layout Suspense shell
- `app/(dashboard)/admin/_lib/current-application-user.ts` — request and access boundary
- `app/(dashboard)/(admin)/actions.ts` — `updateTag` after mutations
- `app/(dashboard)/tickets/actions.ts` — `updateTag` after ticket mutations
- `app/(dashboard)/tickets/new/page.tsx` — separately cached reference data
- `app/login/page.tsx`, `app/page.tsx`, `app/pending-access/page.tsx` — public page pattern
- Next.js 16.3.6 docs: [Caching](https://nextjs.org/docs/app/getting-started/caching), [Revalidating](https://nextjs.org/docs/app/getting-started/revalidating), [Instant Navigation](https://nextjs.org/docs/app/guides/instant-navigation), and [Partial Prefetching](https://nextjs.org/docs/app/guides/adopting-partial-prefetching).

## Evidence

- `next.config.ts` sets `cacheComponents: true` and defines a `days` preset (stale: 7d, revalidate: 7d, expire: 30d).
- Admin pages put access-gated content behind Suspense; `requireCurrentApplicationAccess()` calls `connection()` before checking the session. Public pages call `connection()` in their async content components.
- Admin and ticket data-fetching functions use `"use cache"`, `cacheLife("days")`, and shared `cacheTag(...)` values; new-ticket reference data uses `cacheLife("minutes")`.
- Server actions call `updateTag` for immediately fresh data after writes.
- Cache tag factories are feature-local under route-domain `_lib/cache-tags.ts` modules, with separate factories for admin and tickets.

## Static-First Principle

The primary goal is to render as much content as possible as static HTML at server time, before any data is fetched. Only content that genuinely depends on runtime data belongs inside a Suspense boundary.

Rules:

- Put page headings and other request-independent page chrome outside the page-level Suspense boundary when possible. The protected dashboard layout has its own auth boundary; do not claim its chrome is prerendered outside Suspense.
- Data-dependent tables, lists, forms populated from the database, and permission-gated sections go **inside** a Suspense boundary.
- Each Suspense boundary has a collocated skeleton that mirrors the loaded content's layout dimensions.
- Nest Suspense boundaries to isolate independent data sections so one slow fetch does not block another.

```tsx
export default function SomePage() {
  return (
    <main className="...">
      {/* Static — renders immediately, no Suspense needed */}
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">Administration</p>
        <h1 className="font-heading text-3xl font-semibold">Roles</h1>
      </div>

      {/* Dynamic — wrapped in Suspense */}
      <Suspense fallback={<RolesContentSkeleton />}>
        <RolesPageContent />
      </Suspense>
    </main>
  )
}
```

## Route Shell, Access, and Cached Data

### Layer 1 — Route export shell (sync, prerenderable)

A sync function with no data fetching. It owns all static chrome and one or more Suspense boundaries.

```tsx
export default function SomePage() {
  return (
    <main ...>
      {/* static heading */}
      <Suspense fallback={<SomePageSkeleton />}>
        <SomePageContent />
      </Suspense>
    </main>
  )
}
```

### Access-gated content (async, dynamic)

```tsx
async function SomePageContent() {
  const access = await requireCurrentApplicationAccess()
  // Check this section's read permission before fetching protected data.
  const data = await getSomeData(access.user.id)
  return <SomeView data={data} />
}
```

`requireCurrentApplicationAccess()` calls `connection()` and performs session and dashboard access checks. The page checks its section permission before rendering protected data. Do not add a duplicate `connection()` to every page.

### Cached data (within content or a separate section)

```tsx
async function SomeDataSection({ actorUserId }: { actorUserId: string }) {
  const data = await getSomeData(actorUserId)
  return <>{/* render */}</>
}
```

The content component may call a collocated `"use cache"` function directly. Extract an independent server component and nested Suspense boundary when separate data sections benefit from streaming independently.

### Skeleton components

Every page defines collocated skeleton components using `Skeleton` from `@/components/ui/skeleton`. Skeletons mirror the layout dimensions of the loaded content.

## `"use cache"` Data Fetching Pattern

```ts
async function getAdminData(actorUserId: string) {
  "use cache"

  cacheLife("days")
  cacheTag(adminRolesListTag())

  return someServiceCall({ actorUserId })
}
```

- `"use cache"` goes at the top of the function body.
- `cacheLife("days")` uses the repo's custom preset: stale 7d, revalidate 7d, expire 30d.
- Actor inputs remain part of the cache key and access-aware service call. The tag is shared across actor-keyed entries backed by the same records, so a write invalidates other authorized viewers' cached entries too.
- New-ticket Customer, Asset, and technician options have a separate `ticketReferenceTag()` and use `cacheLife("minutes")`; ticket mutations do not invalidate unrelated reference data.
- These functions are module-level and not exported outside their page file unless the component is shared across routes.

## Component-Level Data Ownership

Shared components that need server data own their own data fetch. They do not accept pre-fetched data as props from a parent page.

When a server component is reused across multiple pages:

- It defines its own `"use cache"` data-fetching function internally.
- The parent passes only identity props (such as `actorUserId`) needed for the access-aware cache key and service call.
- This keeps the component independently cacheable and avoids duplicating fetch logic in every consuming page.

```tsx
// Shared server component — owns its own cached fetch
async function RoleDropdown({ actorUserId }: { actorUserId: string }) {
  const roles = await getRolesData(actorUserId)   // "use cache" inside
  return <select>{roles.map(r => <option key={r.id}>{r.name}</option>)}</select>
}
```

The parent wraps it in Suspense without knowing what data it needs:

```tsx
<Suspense fallback={<Skeleton className="h-9 w-full" />}>
  <RoleDropdown actorUserId={actorUserId} />
</Suspense>
```

## Donut Pattern for Interactive Shared Components

When a shared component needs **client interactivity** (state, event handlers) *and* **server-fetched data**, use the donut pattern:

- The `"use client"` component is the outer shell (the donut). It handles interaction state.
- Server-rendered content is passed as `children` (the hole). The server component owns the data fetch.
- The client component never fetches data itself.

```tsx
// "use client" shell — interaction only, no data
"use client"
export function DropdownShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <div>
      <button onClick={() => setOpen(o => !o)}>Open</button>
      {open && children}
    </div>
  )
}
```

```tsx
// Server component — data fetch + rendering, wraps the client shell
async function RolePickerDropdown({ actorUserId }: { actorUserId: string }) {
  const roles = await getRolesData(actorUserId)   // cached
  return (
    <DropdownShell>
      {roles.map(r => <RoleOption key={r.id} role={r} />)}
    </DropdownShell>
  )
}
```

The server component is placed inside a Suspense boundary by the page. The client shell never crosses the server/client boundary for data.

## Cache Tag Conventions

Tag factories live in feature-local `_lib/cache-tags.ts` modules. Shared records use shared invalidation tags even when the cached function's actor input produces a distinct cache entry.

| Factory | Tag pattern | Scope |
| --- | --- | --- |
| `adminRolesListTag()` | `admin:roles` | Roles list and permission choices |
| `adminRoleDetailTag(roleId)` | `admin:roles:{roleId}` | Single role |
| `adminUsersListTag()` | `admin:users` | User list |
| `adminUserDetailTag(targetUserId)` | `admin:users:{targetUserId}` | Single user detail |
| `adminUserRoleOptionsTag()` | `admin:user-role-options` | User detail views listing assignable roles |
| `ticketListTag()` | `tickets:list` | Ticket list |
| `ticketDetailTag(ticketId)` | `tickets:detail:{ticketId}` | Single ticket |
| `ticketReferenceTag()` | `tickets:reference` | New-ticket Customer, Asset, and technician choices |

## Invalidating Cache After Mutations

Server Actions use `updateTag` for read-your-writes after successful mutations:

```ts
updateTag(adminUserDetailTag(targetUserId))
updateTag(adminUsersListTag())
```

Role creation invalidates the roles list and user role options; role updates additionally invalidate that role's detail. Ticket creation invalidates the list before redirect; status, priority, and technician changes invalidate detail and list; notes invalidate only detail. Invalidate each affected data dependency, not every tag in the feature. `revalidateTag(tag, "max")` allows stale content while refreshing and is suitable only when that delay is acceptable. `revalidatePath` remains supported with Cache Components for route-wide invalidation, but known tags are more precise. Source: the action modules listed above and the Next.js 16.3.6 revalidation guide.

## Instant Navigation Check

`next.config.ts` enables Cache Components and Partial Prefetching. Page-level Suspense boundaries below a shared layout can provide fallbacks on client transitions; a boundary above an already-mounted shared layout cannot cover content changing beneath it. Automatic link prefetch does not run in `next dev`, so a clean development error report or visible skeleton does not prove instant navigation. Inspect the initial UI and navigation in a production build before promising instant transitions. Source: `next.config.ts`, the dashboard pages and layout, and the Next.js 16.3.6 instant-navigation and partial-prefetching guides.

## Pitfalls to avoid

- Do not use `export const dynamic = "force-dynamic"` on new pages; use the Suspense + `connection()` shell instead.
- Do not move request-independent page headings inside a page-level Suspense boundary unnecessarily; protected layout chrome may still depend on the layout's auth boundary.
- Do not use actor-specific invalidation tags for shared records or substitute stale-while-revalidate for `updateTag` when an immediate read-after-write is required.
- Do not put `connection()` in the route shell or duplicate the call already made by `requireCurrentApplicationAccess()`.
- Do not call service functions directly in the content component when they should be cached; wrap them in a `"use cache"` function first.
- Do not pass pre-fetched data as props to shared server components; let the component own its `"use cache"` fetch.
- Do not give the client donut shell any data-fetching responsibility; pass server-rendered JSX as `children` instead.
- Do not hard-code cache tag strings; always use the factory from the feature-local `cache-tags.ts` module.
- Do not use `cacheLife("days")` without `cacheComponents: true` in `next.config.ts`.
