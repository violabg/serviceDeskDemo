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

- Create a new shared component only when the pattern repeats across at least two feature surfaces.
- If a new component is created, place it in components/ui when it is generic, or components when it is app-specific composition.
- Prefer thin wrappers around existing primitives over custom isolated controls.

## Security and Auth Implications

- Reusing UI components does not replace server-side permission enforcement.
- Keep access checks in server routes, layouts, actions, and access-control services, even when UI is shared.

## Pitfalls to avoid

- Copy-pasting button or input styles directly into pages.
- Duplicating sidebar or menu behavior outside shared navigation components.
- Creating local class-merging utilities instead of using cn().
- Introducing one-off primitives that overlap with existing components/ui wrappers.
