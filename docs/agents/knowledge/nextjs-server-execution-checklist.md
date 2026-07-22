# When to read this

Use this checklist before adding or changing pages, layouts, and mutations in the Next.js app router, especially in dashboard and admin areas.

## Last verified

2026-07-22, dirty worktree. Evidence from repository files:

- AGENTS.md
- app/(dashboard)/admin/actions.ts
- app/(dashboard)/layout.tsx
- app/(dashboard)/admin/roles/page.tsx
- app/(dashboard)/admin/roles/[roleId]/page.tsx
- app/(dashboard)/admin/users/[userId]/page.tsx
- app/(dashboard)/tickets/actions.ts
- app/(dashboard)/tickets/new/new-ticket-form.tsx
- app/(dashboard)/tickets/[id]/ticket-detail-forms.tsx
- components/app-sidebar.tsx
- lib/auth/server.ts
- lib/auth/client.ts

## Next.js Server Execution Checklist

## Evidence

- Server actions are centralized in one module with "use server": app/(dashboard)/admin/actions.ts.
- Admin pages invoke server actions via form action handlers: app/(dashboard)/admin/roles/page.tsx, app/(dashboard)/admin/roles/[roleId]/page.tsx, app/(dashboard)/admin/users/[userId]/page.tsx.
- Ticket forms invoke server actions from client submit handlers when react-hook-form state and `useTransition` orchestration are needed: app/(dashboard)/tickets/new/new-ticket-form.tsx, app/(dashboard)/tickets/[id]/ticket-detail-forms.tsx, app/(dashboard)/tickets/actions.ts.
- Dashboard layout is server-first and performs session plus permission gating before render: app/(dashboard)/layout.tsx.
- Client-only auth helper is isolated behind "use client": lib/auth/client.ts, while server auth is separate in lib/auth/server.ts.

## Core rules

- Default to Server Components for routes, layouts, and data reads.
- Use Client Components only when browser hooks or client interactivity are required.
- Keep server mutations in dedicated action files using "use server".
- Choose the form trigger pattern that matches the UI boundary:
  - Use `action={serverAction}` for server-rendered forms that can submit directly without client-side orchestration.
  - Use client `onSubmit` handlers plus `startTransition(async () => serverAction(formData))` when react-hook-form state, optimistic/pending UI, or client-only orchestration is required.
- After write actions, refresh affected data with `revalidateTag` (admin sections) or `revalidatePath` (simple path-based cases), and redirect when route transition is required. See `nextjs-cache-components-pattern.md` for when to use each.
- Keep auth and permission checks on the server before protected UI is rendered.
- Keep browser auth APIs in client-only modules and server auth APIs in server modules.

## Security and Auth Implications

- Never trust client-side checks for access control. Enforce access on server routes, layouts, and actions.
- Action handlers should derive actor identity from current server session context, not from form input.
- Redirect unauthenticated users before protected dashboard content is rendered.

## Practical repo patterns

- Server action module pattern:
  - Use one domain action file under the route domain (example: admin actions).
  - Parse FormData on server, call domain service methods, then revalidate paths.
- Server form pattern:
  - Use direct `<form action={serverAction}>` wiring when the form can stay server-first.
- Client-orchestrated form pattern:
  - Use `react-hook-form` in a client component, build `FormData` in the submit handler, and invoke the server action inside `startTransition`.
- Protected dashboard layout pattern:
  - Read session server-side.
  - Resolve effective permissions server-side.
  - Redirect to login or pending-access before rendering children.
- Client boundary pattern:
  - Sidebar and navigation use client hooks and remain client components.
  - Data, permission fetches, and access gating stay in parent server layouts and pages.

## Pitfalls to avoid

- Do not move permission enforcement into client components.
- Do not call server-side auth utilities from client files.
- Do not place mutation logic directly inside client components when a server action can own it.
- Do not force direct `action={serverAction}` wiring in forms that already need client-side state orchestration.
- Do not forget to revalidate (via `revalidateTag` for admin sections) after role, user, or permission changes.
