---
tier: "PerComponent"
intent: "Before creating or refactoring interactive dashboard forms, URL-driven filter forms, or form fields that submit server actions."
---
# When to read this

Use this before creating or refactoring interactive dashboard forms, especially when forms call server actions.

## Do not use this for

Do not use this for static read-only views without user input, or for server-only data loaders with no client form state.

## Dashboard Forms Best Practices

## Core rules

- Default to shadcn Base UI controls for dashboard form inputs.
- Use react-hook-form for interactive client-side dashboard forms.
- Use `Controller` for Base UI `Select` integration.
- Keep mutation authority on server actions; use client form state only for orchestration and validation.
- Use `useTransition` for submit/check pending states when a form triggers async server actions.
- Mark required fields visually with `*` in labels.
- Keep the edit state of every view that can be edited in the URL search params, with a Cancel control that leaves that state through a URL change (see Cancel Control in Edit State).
- Keep the search and filter state of every results list in the URL search params, with a Reset Filters control (see URL-Driven Filter Forms).

## Create and Edit Forms

- The user story decides whether an entity's create and edit forms are one component or two. Record that decision in the plan.
- When the user story does not decide it, assume one shared form component for creating and editing the entity. This assumption is not a project rule: remove it during evaluation planning.
- A separate create form and edit form is allowed when the user story needs different fields or behavior. Report the separate forms in the plan; this is not a blocking question.
- A form may also render read-only in the entity's view section. This is an option, not a requirement; use it when the user story or the plan asks for it.
- The shared form receives a mode (`create` or `edit`), the entity's current values when editing, and the server action for that mode. The mode decides only the defaults, the title, the submit label and the action. A shared form keeps the same fields and validation rules in both modes.
- Place the shared form by the shared component placement rule: in the `_components` folder of the lowest route folder that contains both the create and the edit routes.
- The shared form owns field state through react-hook-form and submits through the mode's server action, using the same transition pattern as other client forms.
- The server action for each mode keeps its own permission check. A shared form never decides access by itself.

## Cancel Control in Edit State

- Edit state is a URL search param on the view's own path (for example `?edit=true`). The URL alone decides whether the view is read-only or editable, so the edit state survives a reload and the browser back and forward buttons restore it.
- Entering edit state is a navigation: the Edit control is a `Link` or a `router.push` that adds the edit param. Do not keep edit state only in React state (`useState`).
- Every view that can be in edit state shows a Cancel control while that state is active.
- Cancel leaves edit state by navigating to the same path without the edit param. Render it with `Link` and `nativeButton={false}`, following the Base UI rule for navigation controls. It is not a submit button and not a `type="button"` click handler.
- Cancel discards unsaved field changes. Field values live only in the form, and the read-only view renders the last saved values that the server returns for the path.
- Cancel never mutates data.
- A successful save leaves edit state through the same URL change, so the read-only view shows the saved values.

## URL-Driven Filter Forms

- Every list that shows results from a search or filter keeps its query state in URL search params. The URL alone must reproduce the list, so the search is part of the history entry and the browser back and forward buttons restore it.
- Server pages read the params through the `searchParams` prop, which is a Promise in Next.js 16. Await it in the Server Component that renders the list, inside its Suspense boundary, and pass the values to the cached data function (see `nextjs-cache-components-pattern.md`). Client components read the params with `useSearchParams`.
- Filter forms read their initial values from the URL search params. Submitting a search or filter writes the new values into the URL; the URL, not client state, is the authoritative filter state.
- A filter form submits as a GET navigation: use `Form` from `next/form` with `action` set to the list's base path, or a native form with `method="GET"`, so each field name becomes a search param. A react-hook-form client form builds the same params with `URLSearchParams` and navigates with `router.push` or `router.replace`.
- Each filter form has a Reset Filters control. It clears every filter field of the list, including fields in separate forms on the same page, and navigates to the list's base path without search params.
- Reset Filters is a navigation action: render it with `Link` to the base path and `nativeButton={false}`, following the Base UI rule for navigation controls. Do not reset only the visible client state.

## Field composition rules

- Use the `Field` family for new or refactored dashboard forms that need consistent label, helper text, and error composition.
- Keep current `Input`/`Textarea`/`Select` primitives inside `Field` wrappers instead of adding custom field abstractions for the same role.
- Single field shape: `Field -> FieldLabel -> control -> FieldDescription (optional) -> FieldError (optional)`.
- Group related fields with `FieldGroup`.
- Use `FieldSet` with `FieldLegend` for semantic grouped inputs (for example notification preferences and access toggles).
- Use `FieldSeparator` only when section boundaries materially improve scanability.

## Field layout and validation rules

- Default to vertical field layout for mobile-first forms.
- Use `orientation="horizontal"` for compact binary controls such as switch, checkbox, and radio.
- Use `orientation="responsive"` only when the parent `FieldGroup` has container-aware classes so label/help alignment stays stable.
- For invalid state, set `data-invalid` on `Field` and `aria-invalid` on the control.
- Place `FieldError` immediately after the control, or inside `FieldContent` when horizontal/responsive alignment requires grouped helper and error text.
- Keep required marker convention as `Field Name *`; do not treat the marker as validation.

## Field accessibility and form-library integration

- Keep explicit `htmlFor`/`id` associations between `FieldLabel` and controls.
- Prefer `FieldSet` and `FieldLegend` for related controls so assistive technologies preserve group context.
- Do not separate labels from controls with wrappers that break reading order.
- Keep `react-hook-form` as the dashboard form state boundary.
- For controlled inputs, keep `Controller` ownership at the form boundary and render `Field` wrappers inside each `render` block.

## Required field convention

- Required label pattern: `Field Name *`.
- Style the required marker with semantic destructive text class (example: `text-destructive`).
- Required marker is visual cue, not replacement for validation rules.

## Form action and transition pattern

- Build `FormData` in client submit handlers when server action signatures require `FormData`.
- Trigger action inside `startTransition(async () => { ... })`.
- Refresh route state after successful action when page data depends on the mutation.
- Keep duplicate-check and create/update mutations as separate transitions when UX requires separate pending indicators.

## Security and Auth Implications

- Never treat client-side validation as authorization.
- Keep permission checks in server actions before mutations.
- Do not pass actor identity from client form fields; derive actor on server session context.

## Pitfalls to avoid

- Importing Prisma-backed service modules directly into client form components.
- Mixing native and shadcn form controls in the same new dashboard workflow without explicit reason.
- Omitting required field marker `*` on mandatory inputs.
- Using `useTransition` without exposing pending state in submit/check controls.
- Replacing server action checks with client-only guard logic.
- Keeping search, filter or edit state only in client state (`useState`), so a reload or back navigation loses it.
- Clearing only the visible filter fields with a Reset Filters control that does not change the URL.
- Leaving an edit view without a Cancel control, or making Cancel a submit button that saves the changes.
- Making Cancel a `type="button"` click handler that only resets client state instead of navigating to the path without the edit param.
- Awaiting `searchParams` in the route shell instead of the content component, which blocks the static shell from prerendering.
