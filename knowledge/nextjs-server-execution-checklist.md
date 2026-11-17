---
tier: "PerContext"
intent: "Before adding or changing Next.js app router pages, layouts, server actions, form submit wiring, or session and permission checks in the dashboard."
---
# Server Execution

- Routes, layouts and data reads are Server Components by default; use a Client Component only for browser hooks or interactivity.
- Keep mutations in dedicated action files marked `"use server"`.
- Choose the trigger by UI boundary: `action={serverAction}` for a server-first form needing no client orchestration, or a client `onSubmit` calling the action inside `startTransition` when react-hook-form state or pending/optimistic UI is needed.
- Enforce auth and permissions on the server before protected UI renders, and redirect unauthenticated users before rendering dashboard content.
- Derive actor identity from the server session, never from form input.

## Session during render

- A session lookup during Server Component rendering is read-only: the auth SDK may want to refresh session and session-cache cookies, and Next.js forbids cookie writes during render.
- Run session refresh in the request proxy for every route whose Server Component reads the session, and make the refreshed cookies visible to the render-time reader. Cookie persistence stays in the proxy, a Route Handler or a Server Action.
- Read the session through a reader that cannot write during render, and keep the ordinary writable auth instance for auth operations.
- Keep browser auth APIs in client-only modules and server auth APIs in server modules.

## After a write

Call `updateTag` for affected cached data when the user must read their change immediately, and redirect when navigation is required. `revalidateTag(tag, "max")` permits stale content; `revalidatePath` covers broad invalidation when tags are unknown.

## Boundaries

Sidebar and navigation need client hooks and stay client components. Data, permission resolution and access gating stay in server layouts and actions.
