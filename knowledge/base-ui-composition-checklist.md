---
tier: "PerComponent"
intent: "Before creating or editing shared UI primitives, or navigation and action controls built on Base UI wrappers (buttons rendered as links, sidebar, breadcrumbs, select, textarea)."
---
# When to read this

Use this checklist before creating or editing shared UI primitives and navigation/actions built on Base UI wrappers.

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
