---
tier: "PerComponent"
intent: "Before creating or editing shared UI primitives, or navigation and action controls built on Base UI wrappers (buttons rendered as links, sidebar, breadcrumbs, select, textarea)."
---
# Base UI Composition

- Never use `asChild` in a Base UI wrapper or its consumers.
- A navigation action renders the link through `render` and sets `nativeButton={false}`.
- A mutation action keeps native button submit semantics; never force `nativeButton={false}` on it.
- A client click action with no navigation is `type="button"` with a handler. Never mix navigation and mutation semantics in one control.
- Keep wrapper props aligned with the existing primitives rather than adding a parallel API, and prefer an existing wrapper over a one-off clickable element.
