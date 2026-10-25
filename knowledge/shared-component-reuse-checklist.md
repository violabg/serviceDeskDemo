---

---
# When to read this

Use this checklist before creating new UI components in pages, navigation, or app chrome to avoid duplicating patterns already implemented in shared primitives.

## Last verified

2026-07-18, commit 71a9195, dirty worktree. Evidence from repository files:

- components/ui/button.tsx
- components/ui/input.tsx
- components/ui/sidebar.tsx
- components/ui/sheet.tsx
- components/nav-main.tsx
- components/nav-user.tsx
- components/app-sidebar.tsx
- lib/utils.ts

## Shared Component Reuse Checklist

## Evidence

- Shared UI wrappers already exist for common controls and composition: button, input, sidebar, and sheet.
- Navigation components compose around shared sidebar primitives instead of custom one-off wrappers.
- Shared utility for class merging is centralized in cn() and reused by UI wrappers.

## Reuse rules

- Before creating a new primitive, check existing wrappers in components/ui and reuse them when behavior matches.
- Extend shared components through props and className composition before creating new duplicated variants.
- Keep Base UI composition style consistent with existing wrappers and render-based composition patterns.
- Reuse existing layout primitives for navigation and shell instead of rebuilding structure in each page.
- Keep styling composition centralized through cn() rather than introducing alternate class merge helpers.

## When to create a new shared component

- Share as much as possible: when two UI parts have similar functionality and purpose, build one common component and use it in both places, even when both live in the same feature.
- Do not wait for a second feature surface before sharing. A single entity's creation form and edit form are one shared component.
- An entity with a create flow and an edit flow uses one shared form component for both. Split them only when a documented use case requires different fields or behavior.
- Prefer thin wrappers around existing primitives over custom isolated controls.

## Where a shared component lives

- Every shared component goes in a folder named `_components`. Keep it as low in the route tree as possible: the `_components` folder sits in the nearest route folder that contains every route using the component.
- A component used by one route stays beside that route. A component used by two routes of the same feature goes in the feature's `_components` folder. A component used across features goes in the dashboard-level `_components` folder.
- When a component is needed by a route outside its current folder, move it up to the nearest folder that contains both consumers. Do not copy it into the other route.
- Generic shadcn primitives stay in `components/ui`; this rule places the shared components built from them.
- Do not add a second copy elsewhere to avoid moving a component.
- Import a shared component through its folder path, never through a copy in another route.

## Security and Auth Implications

- Reusing UI components does not replace server-side permission enforcement.
- Keep access checks in server routes, layouts, actions, and access-control services, even when UI is shared.

## Pitfalls to avoid

- Copy-pasting button or input styles directly into pages.
- Duplicating sidebar or menu behavior outside shared navigation components.
- Creating local class-merging utilities instead of using cn().
- Introducing one-off primitives that overlap with existing components/ui wrappers.
- Keeping a duplicate create form and edit form for the same entity.
- Copying a list's filter or results markup into a second page instead of sharing one component.
- Leaving a shared component in one route folder while another route imports it, or copying it into the other route.
