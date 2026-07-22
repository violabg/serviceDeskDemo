# Next.js Cache Components and PPR Rendering Pattern

## When to read this

When adding or refactoring admin or dashboard pages that need caching, skeleton loading
states, or must opt out of full dynamic rendering per request.

## Last verified

2026-07-22, dirty worktree. Evidence from repository files:

- `next.config.ts` — `cacheComponents: true` and custom `days` life preset
- `app/(dashboard)/admin/_lib/cache-tags.ts` — tag factory functions
- `app/(dashboard)/tickets/_lib/cache-tags.ts` — ticket tag factory functions
- `app/(dashboard)/admin/roles/page.tsx` and `[roleId]/page.tsx` — full page pattern
- `app/(dashboard)/admin/users/page.tsx` and `[userId]/page.tsx` — full page pattern
- `app/(dashboard)/layout.tsx` — layout Suspense shell
- `app/(dashboard)/admin/actions.ts` — `revalidateTag` after mutations
- `app/(dashboard)/tickets/actions.ts` — `revalidateTag` after ticket mutations
- `app/login/page.tsx`, `app/page.tsx`, `app/pending-access/page.tsx` — public page pattern

## Evidence

- `next.config.ts` sets `cacheComponents: true` and defines a `days` preset (stale: 7d, revalidate: 7d, expire: 30d).
- All admin and public pages replaced `export const dynamic = "force-dynamic"` with a sync Suspense shell + `connection()` inside the async content component.
- Data-fetching functions use the `"use cache"` directive with `cacheLife("days")` and `cacheTag(...)` for tagged invalidation.
- Server actions call `revalidateTag` (not `revalidatePath`) after writes.
- Cache tag factories are feature-local under route-domain `_lib/cache-tags.ts` modules, with separate factories for admin and tickets.

## Static-First Principle

The primary goal is to render as much content as possible as static HTML at server time, before any data is fetched. Only content that genuinely depends on runtime data belongs inside a Suspense boundary.

Rules:

- Page headings, breadcrumbs, section labels, and layout chrome go **outside** Suspense — they render instantly as static HTML.
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

## Three-Layer Page Structure

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

### Layer 2 — Content component (async, dynamic)

```tsx
async function SomePageContent() {
  await connection()   // from "next/server" — opts subtree into dynamic rendering
  const access = await requireCurrentApplicationAccess()
  // permission gating and redirect live here
  // passes actorUserId and derived flags down as props
}
```

`connection()` signals that this subtree requires a live request. Auth and permission checks live here, not in the shell.

### Layer 3 — Cached data component (async, cached)

```tsx
async function SomeDataSection({ actorUserId }: { actorUserId: string }) {
  const data = await getSomeData(actorUserId)
  return <>{/* render */}</>
}
```

The data fetch is delegated to a collocated `"use cache"` function (see below).

### Skeleton components

Every page defines collocated skeleton components using `Skeleton` from `@/components/ui/skeleton`. Skeletons mirror the layout dimensions of the loaded content.

## `"use cache"` Data Fetching Pattern

```ts
async function getAdminData(actorUserId: string) {
  "use cache"

  cacheLife("days")
  cacheTag(someTag(actorUserId))

  return someServiceCall({ actorUserId })
}
```

- `"use cache"` goes at the top of the function body.
- `cacheLife("days")` uses the repo's custom preset: stale 7d, revalidate 7d, expire 30d.
- `cacheTag(...)` takes a string from the tag factory — always actor-scoped.
- These functions are module-level and not exported outside their page file unless the component is shared across routes.

## Component-Level Data Ownership

Shared components that need server data own their own data fetch. They do not accept pre-fetched data as props from a parent page.

When a server component is reused across multiple pages:

- It defines its own `"use cache"` data-fetching function internally.
- The parent passes only identity props (such as `actorUserId`) needed to scope the cache tag.
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

Tag factories live in feature-local `_lib/cache-tags.ts` modules under the route domain. Every factory takes at minimum `actorUserId` to scope cached data per actor.

| Factory | Tag pattern | Scope |
| --- | --- | --- |
| `adminRolesListTag(actorUserId)` | `admin:roles:{uid}` | All roles visible to actor |
| `adminRoleDetailTag(actorUserId, roleId)` | `admin:roles:{uid}:{roleId}` | Single role |
| `adminUsersListTag(actorUserId)` | `admin:users:{uid}` | All users visible to actor |
| `adminUserDetailTag(actorUserId, targetId)` | `admin:users:{uid}:{targetId}` | Single user |
| `ticketListTag(actorUserId)` | `tickets:list:{uid}` | Ticket list visible to actor |
| `ticketDetailTag(actorUserId, ticketId)` | `tickets:detail:{uid}:{ticketId}` | Single ticket |

## Invalidating Cache After Mutations

Server actions use `revalidateTag` (not `revalidatePath`) after writes:

```ts
revalidateTag(adminUserDetailTag(access.user.id, targetUserId), "max")
revalidateTag(adminUsersListTag(access.user.id), "max")
```

Pass `"max"` as the second argument to revalidate across all cache layers. Invalidate both the detail tag and the list tag when the mutation can affect both.

## Pitfalls to avoid

- Do not use `export const dynamic = "force-dynamic"` on new pages; use the Suspense + `connection()` shell instead.
- Do not put static headings, breadcrumbs, or layout chrome inside a Suspense boundary; they must render as static HTML.
- Do not call `revalidatePath` for tagged admin or ticket mutations; use `revalidateTag` with the feature-local tag factory.
- Do not put `connection()` in the route shell; it belongs inside the async `Content` component inside the Suspense boundary.
- Do not call service functions directly in the content component when they should be cached; wrap them in a `"use cache"` function first.
- Do not pass pre-fetched data as props to shared server components; let the component own its `"use cache"` fetch.
- Do not give the client donut shell any data-fetching responsibility; pass server-rendered JSX as `children` instead.
- Do not hard-code cache tag strings; always use the factory from the feature-local `cache-tags.ts` module.
- Do not use `cacheLife("days")` without `cacheComponents: true` in `next.config.ts`.
