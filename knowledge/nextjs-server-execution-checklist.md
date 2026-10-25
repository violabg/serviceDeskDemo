---
tier: "PerContext"
intent: "Before adding or changing Next.js app router pages, layouts, server actions, form submit wiring, or session and permission checks in the dashboard."
---
# When to read this

Use this checklist before adding or changing pages, layouts, and mutations in the Next.js app router, especially in dashboard and admin areas.

## Next.js Server Execution Checklist

## Core rules

- Default to Server Components for routes, layouts, and data reads.
- Use Client Components only when browser hooks or client interactivity are required.
- Keep server mutations in dedicated action files using "use server".
- Choose the form trigger pattern that matches the UI boundary:
  - Use `action={serverAction}` for server-rendered forms that can submit directly without client-side orchestration.
  - Use client `onSubmit` handlers plus `startTransition(async () => serverAction(formData))` when react-hook-form state, optimistic/pending UI, or client-only orchestration is required.
- After successful writes, call `updateTag` for affected cached data when the user needs to read their change immediately, and redirect when navigation is required. `revalidateTag(tag, "max")` permits stale content; `revalidatePath` remains valid for broad route invalidation when tags are not known. See `nextjs-cache-components-pattern.md` for the current tag and dependency rules.
- Keep auth and permission checks on the server before protected UI is rendered.
- Treat session lookup during Server Component rendering as read-only. An auth SDK may refresh its session or session-cache cookies during `getSession()`, and Next.js does not allow cookie writes while a Server Component renders.
- Run session refresh in the request proxy or middleware for every route whose Server Component reads the session. Make refreshed request cookies available to the render-time session reader, and keep cookie persistence in the proxy, Route Handler, or Server Action.
- Keep browser auth APIs in client-only modules and server auth APIs in server modules.

## Security and Auth Implications

- Never trust client-side checks for access control. Enforce access on server routes, layouts, and actions.
- Action handlers should derive actor identity from current server session context, not from form input.
- Redirect unauthenticated users before protected dashboard content is rendered.

## Practical repo patterns

- Server action module pattern:
  - Use one domain action file under the route domain (examples: admin actions, customer actions).
  - In the customer actions, each action starts with `requireCurrentApplicationAccess()` and a `hasPermission` check for the operation's level (`write` or `manage`); on denial it returns `{ ok: false, reason: "forbidden" }`. Apply the same gate in any new action module.
  - Parse FormData on server, call domain service methods, then expire only affected cache tags.
- Server form pattern:
  - Use direct `<form action={serverAction}>` wiring when the form can stay server-first.
- Client-orchestrated form pattern:
  - Use `react-hook-form` in a client component, build `FormData` in the submit handler, and invoke the server action inside `startTransition`.
- Protected dashboard layout pattern:
  - Read session server-side through a read-only request context. For Neon Auth, use a `createAuthServer` session reader whose `getCookies` reads the merged `cookies()` store and whose `setCookie` does not write during render. Keep the ordinary auth instance for writable auth operations.
  - Include each session-reading dashboard route in the auth proxy matcher so it can validate the session and return refreshed cookies before rendering. Reuse a route-group matcher when it covers the route; update the matcher when a new session-reading route falls outside existing coverage.
  - Resolve effective permissions server-side.
  - Redirect to login or pending-access before rendering children.
- Client boundary pattern:
  - Sidebar and navigation use client hooks and remain client components.
  - Data, permission fetches, and access gating stay in parent server layouts and pages.

## Pitfalls to avoid

- Do not move permission enforcement into client components.
- Do not call server-side auth utilities from client files.
- Do not call a cookie-writing auth session reader directly during Server Component rendering. If a page needs a session, use the read-only server session reader and confirm its route receives proxy-managed cookie refresh.
- Do not place mutation logic directly inside client components when a server action can own it.
- Do not force direct `action={serverAction}` wiring in forms that already need client-side state orchestration.
- Do not forget to expire affected list, detail, and role-option tags with `updateTag` after role, user, or permission changes.
