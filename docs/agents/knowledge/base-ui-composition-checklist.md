# When to read this

Use this checklist before creating or editing shared UI primitives and navigation/actions built on Base UI wrappers.

## Last verified

2026-07-18, dirty worktree. Evidence from repository files:

- components/ui/button.tsx
- components/ui/sidebar.tsx
- components/ui/select.tsx
- components/ui/textarea.tsx
- app/page.tsx
- components/nav-main.tsx
- components/dashboard-breadcrumbs.tsx
- components/app-sidebar.tsx
- components/auth/logout-button.tsx
- components.json

## Base UI Composition Checklist

## Evidence

- Repo button primitive is Base UI button wrapper, and consumers compose via render and nativeButton props instead of asChild: components/ui/button.tsx.
- Link-like buttons in pages use render with Link and set nativeButton={false}: app/page.tsx, app/(dashboard)/admin/roles/page.tsx.
- Sidebar and breadcrumb primitives compose children through render props: components/nav-main.tsx, components/dashboard-breadcrumbs.tsx, components/app-sidebar.tsx.
- Form actions still use native button behavior for submit and remove flows: app/(dashboard)/admin/users/[userId]/page.tsx.
- Repo is configured for shadcn Base UI style and aliases through components.json: components.json.

## Core rules

- Do not introduce asChild in Base UI wrappers or consumers.
- For button-as-link usage, pass render={<Link ... />} and set nativeButton={false}.
- For true form submit actions, keep native button semantics and do not force nativeButton={false}.
- Keep wrapper APIs aligned with existing primitive shape: variant, size, className, render, nativeButton.
- Prefer existing wrapper primitives before creating new one-off element styles.

## Link and button semantics

- Navigation action: render Link plus nativeButton={false}.
- Form mutation action: regular button submit semantics.
- Client click action with no navigation: type="button" with onClick handler.

## Security and Auth Implications

- UI composition choices must not replace server-side auth and permission checks.
- Do not rely on disabled or hidden client controls as access enforcement.
- Keep protected mutations behind server action checks even when controls are styled as links.

## Pitfalls to avoid

- Missing nativeButton={false} when rendering a Link inside button wrappers.
- Adding asChild patterns from other libraries into Base UI components.
- Creating duplicate ad-hoc clickable primitives instead of using shared wrappers.
- Mixing navigation and mutation semantics in one control.
