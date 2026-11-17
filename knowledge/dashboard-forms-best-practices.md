---
tier: "PerComponent"
intent: "Before creating or refactoring interactive dashboard forms, URL-driven filter forms, or form fields that submit server actions."
---
# Dashboard Forms

Built on shadcn Base UI controls with react-hook-form, using `Controller` for Base UI `Select`. Mutation authority stays on server actions; client state only orchestrates and validates.

## Create and edit

- One shared form component serves create and edit, unless the user story needs different fields or behaviour, in which case a separate pair is allowed. The plan records which.
- The shared form takes a mode, the current values when editing, and that mode's server action. The mode sets only defaults, title, submit label and action; fields and validation are identical in both modes.
- Field state lives in react-hook-form and submits through the mode's action. Each action keeps its own permission check.
- The form may also render read-only inside a view section when the plan asks for it.

## Edit state

- Edit state is a URL search param on the view's own path. The URL alone decides read-only versus editable, so reload and browser history restore it; never keep it only in `useState`.
- Entering edit state is a navigation. Cancel leaves it by navigating to the same path without the param, rendered with `render` and `nativeButton={false}` — never as a submit button and never as a `type="button"` handler.
- Cancel discards unsaved values and never mutates. A successful save leaves edit state the same way, so the view shows the saved values.

## Filter forms

- Every list's search and filter state lives in URL search params; the URL alone must reproduce the list. Server pages await `searchParams` in the Suspense content, client components read `useSearchParams`.
- A filter form navigates as a GET to the list's base path so each field becomes a param, or builds the same params with `URLSearchParams` and pushes them.
- Each filter form has a Reset Filters control that clears every filter field on the page and navigates to the base path. Render it as a navigation control, never resetting only the visible state.

## Fields

- Compose `Field` → `FieldLabel` → control → `FieldDescription` and `FieldError`, grouping related fields in `FieldGroup` and semantic groups in `FieldSet` with `FieldLegend`. Keep `Input`, `Textarea` and `Select` inside `Field`; add no parallel field abstraction.
- Vertical layout by default; `horizontal` for switches, checkboxes and radios; `responsive` only under a container-aware parent.
- Invalid state sets `data-invalid` on `Field` and `aria-invalid` on the control, with `FieldError` immediately after the control.
- Associate every label and control by `id` and `htmlFor`; a marker never replaces validation.
- Label required fields `Name *` and style the marker as destructive text. It is a visual cue only.

## Submission

- Build `FormData` in the submit handler when the action takes it, call the action inside `startTransition`, and expose the pending state on the submit and check controls.
- Refresh the route when page data depends on the mutation, and keep separate transitions only where separate pending indicators are needed.
