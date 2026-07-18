# When to read this

Use this before creating or refactoring interactive dashboard forms, especially when forms call server actions.

## Do not use this for

Do not use this for static read-only views without user input, or for server-only data loaders with no client form state.

## Last verified

2026-07-18, dirty worktree. Evidence from repository files:

- components.json
- package.json
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

## Field composition rules

- Use the `Field` family for new or refactored dashboard forms that need consistent label, helper text, and error composition.
- Until `components/ui/field.tsx` is introduced, keep current `Input`/`Textarea`/`Select` primitives and apply these rules when `Field` wrappers are added.
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
