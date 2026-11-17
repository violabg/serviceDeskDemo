---
tier: "PerContext"
intent: "Before adding a database entity needing independent privileges or a new ACCESS_SECTIONS boundary and wiring its routes or navigation."
---
# Adding a Gated Section

Do it in one change set: keys, navigation, routes, tests, seed.

1. **Keys** — add the section id to `ACCESS_SECTIONS` and let `INITIAL_PERMISSIONS` generate its `read`, `write` and `manage` keys. Do not add operations, and rely on no model or migration to grant anything.
2. **Navigation** — for a user-navigable section, add the group item and the section's icon mapping. Visibility follows the view rule and adds no key; empty groups disappear. A gateway boundary needs no sidebar item.
3. **Routes** — build the list, create, detail and edit surfaces under the page privilege rules. A folder without a page serves no URL.
4. **Tests** — cover all of these: the section exists and generates three keys; a role holding only `write`, or only `manage`, does not resolve `read`; each exact key makes the section visible and no key hides it; each exact key opens every page; create and the create page need `write`; edit and the edit form need `manage`; a control without its key is disabled, not hidden.
5. **Seed** — confirm the target database is authorized, review the full section list because bootstrap deletes keys for removed sections, then seed. Confirm the three keys are granted to Admin and that the intended administrator resolves them through Admin. When seed reports no administrator assigned, set a non-blank `INITIAL_ADMIN_EMAIL` and reseed before relying on that session.
6. **Validate** — clear diagnostics, typecheck, scoped lint, then focused access-control, navigation and route/action tests. Broaden only when the change requires it.
