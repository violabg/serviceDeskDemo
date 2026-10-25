---

---
# When to read this

Use this before creating or refactoring interactive dashboard forms, especially when forms call server actions.

## Do not use this for

Do not use this for static read-only views without user input, or for server-only data loaders with no client form state.

## Last verified

2026-07-22, dirty worktree. Evidence from repository files:

- components.json
- package.json
- components/ui/field.tsx
- components/ui/select.tsx
- components/ui/textarea.tsx
- app/(dashboard)/tickets/new/new-ticket-form.tsx
- app/(dashboard)/tickets/[id]/ticket-detail-forms.tsx
- app/(dashboard)/tickets/ticket-filters-form.tsx
- app/(dashboard)/tickets/actions.ts

## Dashboard Forms Best Practices

## Evidence

- Project is configured for shadcn Base UI style (`base-vega`) and aliases in components.json.
- Interactive ticket forms use react-hook-form `useForm` and `Controller` for managed field state.
- The shared `Field` family exists in `components/ui/field.tsx` and is already used by ticket forms for labels and validation states.
- Ticket forms use shadcn Base UI controls (`Select`, `Textarea`, `Input`) instead of native select/textarea styling blocks.
- Client forms submit to server actions and then refresh navigation state.
- Pending submission states are managed with `useTransition` in interactive forms.

## Core rules

- Default to shadcn Base UI controls for dashboard form inputs.
- Use react-hook-form for interactive client-side dashboard forms.
- Use `Controller` for Base UI `Select` integration.
- Keep mutation authority on server actions; use client form state only for orchestration and validation.
- Use `useTransition` for submit/check pending states when a form triggers async server actions.
- Mark required fields visually with `*` in labels.
- Build one form component per entity for both creation and edit (see Shared Create and Edit Forms).
- Give every view that can be in edit state a Cancel control (see Cancel Control in Edit State).
- Keep the search and filter state of every results list in the URL search params, with a Reset Filters control (see URL-Driven Filter Forms).

## Shared Create and Edit Forms

- An entity has one form component for both creating and editing it. Use a separate create form and edit form only when a documented use case requires different fields or behavior.
- The shared form receives a mode (`create` or `edit`), the entity's current values when editing, and the server action for that mode. The mode decides only the defaults, the title, the submit label and the action; the fields and validation rules are the same.
- Place the shared form by the shared component placement rule: in the `_components` folder of the lowest route folder that contains both the create and the edit routes.
- The shared form owns field state through react-hook-form and submits through the mode's server action, using the same transition pattern as other client forms.
- The server action for each mode keeps its own permission check. A shared form never decides access by itself.

## Cancel Control in Edit State

- Every view that can be in edit state shows a Cancel control while that state is active.
- Cancel leaves edit state, discards unsaved field changes and restores the read-only view with the last saved values.
- Cancel is a client click action with no mutation: use `type="button"` with an `onClick` handler, not a submit button and not a link.

## URL-Driven Filter Forms

- Every list that shows results from a search or filter keeps its query state in URL search params. The URL alone must reproduce the list, so the search is part of the history entry and the browser back and forward buttons restore it.
- Filter forms read their initial values from the URL search params. Submitting a search or filter writes the new values into the URL; the URL, not client state, is the authoritative filter state.
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
- Building a separate create form and edit form for the same entity without a documented use case.
- Keeping search or filter values only in client state, so a reload or back navigation loses the results.
- Clearing only the visible filter fields with a Reset Filters control that does not change the URL.
- Leaving an edit view without a Cancel control, or making Cancel a submit button that saves the changes.
