---
tier: "PerContext"
intent: "When adding or refactoring pages, Server Action invalidation, or instant-navigation behavior involving caching or Suspense."
---
# Next.js Cache Components and PPR Rendering Pattern

## When to read this

When adding or refactoring admin or dashboard pages that need caching, skeleton loading
states, or must opt out of full dynamic rendering per request.

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

Pages that filter by URL search params receive `searchParams` as a Promise in Next.js 16. Await it in the content component, together with the access check, and not in the sync route shell, so the shell stays prerenderable. The searched values are then passed to the cached data function as arguments (see Cached data below).

```tsx
async function SomeListContent({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const [{ q }, access] = await Promise.all([searchParams, requireCurrentApplicationAccess()])
  const data = await getSomeList(access.user.id, q)
  return <SomeList data={data} />
}
```

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
- New-ticket Customer, Asset, and technician options have a separate `ticketReferenceTag()` and use `cacheLife("minutes")`; ticket mutations do not invalidate unrelated reference data. Customer mutations do invalidate `ticketReferenceTag()`, because customer options appear in those choices.
- Lists whose results come from URL search params pass the search and filter values into the `"use cache"` function as arguments, the same way actor inputs are passed. Each filter combination then has its own cache entry, and the shared list tag still covers every entry for the records.
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
| `customerListTag()` | `customers:list` | Customer list |
| `customerDetailTag(customerId)` | `customers:detail:{customerId}` | Single customer |
| `ticketListTag()` | `tickets:list` | Ticket list |
| `ticketDetailTag(ticketId)` | `tickets:detail:{ticketId}` | Single ticket |
| `ticketReferenceTag()` | `tickets:reference` | New-ticket Customer, Asset, and technician choices |

## Invalidating Cache After Mutations

Server Actions use `updateTag` for read-your-writes after successful mutations:

```ts
updateTag(adminUserDetailTag(targetUserId))
updateTag(adminUsersListTag())
```

Role creation invalidates the roles list and user role options; role updates additionally invalidate that role's detail. Ticket creation invalidates the list before redirect; status, priority, and technician changes invalidate detail and list; notes invalidate only detail. Customer creation invalidates the customer list, the ticket list and `ticketReferenceTag()`. Customer updates and status changes (manage-gated) additionally invalidate that customer's detail and the detail of each ticket linked to it. Invalidate each affected data dependency, not every tag in the feature. `revalidateTag(tag, "max")` marks the tag stale: the next visit serves stale content while fresh content loads in the background, so use it only when that delay is acceptable. `revalidatePath` remains supported with Cache Components for route-wide invalidation, but known tags are more precise.

## Instant Navigation Check

`next.config.ts` enables Cache Components and Partial Prefetching. Page-level Suspense boundaries below a shared layout can provide fallbacks on client transitions; a boundary above an already-mounted shared layout cannot cover content changing beneath it. Automatic link prefetch does not run in `next dev`, so a clean development error report or visible skeleton does not prove instant navigation. Inspect the initial UI and navigation in a production build before promising instant transitions.

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
- Do not omit a list's search or filter values from the arguments of its `"use cache"` function; otherwise different filter combinations share one cache entry.
- Do not await `searchParams` in the sync route shell; await it in the content component.
