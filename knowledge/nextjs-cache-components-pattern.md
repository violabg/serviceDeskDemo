---
tier: "PerContext"
intent: "When adding or refactoring pages, Server Action invalidation, or instant-navigation behavior involving caching or Suspense."
---
# Cache Components

Render as much as possible as static HTML before any data is fetched; only runtime data goes inside Suspense.

- Page headings and request-independent chrome stay outside the page-level Suspense boundary. The protected layout has its own auth boundary, so its chrome is not prerendered outside Suspense.
- Data-dependent tables, lists, populated forms and permission-gated sections go inside Suspense, each with a collocated skeleton mirroring the loaded layout. Nest boundaries so one slow fetch does not block another.

## Layers

A page has three layers:

```tsx
export default function Page() {
  return (
    <main>
      <h1>Roles</h1>
      <Suspense fallback={<RolesSkeleton />}>
        <RolesContent searchParams={searchParams} />
      </Suspense>
    </main>
  )
}

async function RolesContent({ searchParams }) {
  const [{ q }, access] = await Promise.all([searchParams, requireCurrentApplicationAccess()])
  const roles = await getRoles(access.user.id, q)
  return <RolesView roles={roles} />
}
```

- The route export is sync and fetches nothing: it owns the static chrome and the Suspense boundaries. Never await `searchParams` there. Do not use `export const dynamic = "force-dynamic"`; the Suspense shell replaces it.
- `requireCurrentApplicationAccess()` already calls `connection()` and checks session and dashboard access, so never repeat it per page.
- The content component awaits `searchParams` and the access check together, checks the section permission, then calls cached data.
- Extract a separate server component with its own Suspense boundary only when a data section benefits from streaming independently.

## Cached data

```ts
async function getRoles(actorUserId: string, q?: string) {
  "use cache"
  cacheLife("days")
  cacheTag(adminRolesListTag())
  return rolesService({ actorUserId, q })
}
```

- `"use cache"` is the first statement of the body. Keep the function module-level and unexported unless it is shared across routes.
- Actor identity and every search or filter value are arguments: they are part of the cache key, so each combination has its own entry and a missing filter value silently shares one entry.
- Tags are shared across actor-keyed entries for the same records, so one write invalidates every authorized viewer's entry.
- Always use the feature's tag factories, never literal tag strings. Give reference data that feeds new-record choices its own tag and a shorter life than record lists.
- Fetch only through a cached function, never directly from the content component.

## Component data ownership

A shared server component fetches its own data and never accepts pre-fetched data as props. The parent passes only identity props such as the actor id and wraps it in Suspense.

When a shared component needs both client interactivity and server data, use the donut: the `"use client"` shell owns interaction and renders server-rendered JSX passed as `children`; the server component owns the fetch, and the client shell never fetches.

## Invalidation

Server Actions use `updateTag` for read-your-writes after a successful mutation. Invalidate each affected dependency, not every tag in the feature.

- `revalidateTag(tag, "max")` marks the tag stale: the next visit serves stale content while fresh content loads, so use it only when that delay is acceptable.
- `revalidatePath` stays valid for broad route invalidation; a known tag is more precise.
- A write that changes what other records display invalidates those too. Reference choices feed creation forms, so a change to them invalidates the reference tag while a record change does not.

## Instant navigation

Page-level Suspense below a shared layout provides client-transition fallbacks; a boundary above an already-mounted layout cannot cover content changing beneath it. Automatic prefetch does not run in development, so a clean dev report or a visible skeleton proves nothing — inspect a production build before promising instant transitions.
