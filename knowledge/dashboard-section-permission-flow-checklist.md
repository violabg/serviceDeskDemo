---
tier: "PerContext"
intent: "Before adding a database entity needing independent privileges or a new ACCESS_SECTIONS boundary and wiring its routes or navigation."
---
# When to read this

Use this checklist before adding a data model that needs an independent permission boundary or a new ACCESS_SECTIONS entry for a dashboard/admin section or gateway. Nested routes and data accessed only inside an existing gated workflow use that section's permission and do not automatically need a separate section key.

## Dashboard Section and Permission Creation Flow Checklist

## Unified Add-a-Section Runbook

Use this sequence when introducing an independently protected section. Neither a new Prisma model nor a migration creates privileges. Keep a new access boundary's permissions, navigation, routes, and tests in one change set.

1. Extend permission source of truth

- A new top-level access boundary requires a new ACCESS_SECTIONS entry. Do not reuse an unrelated section key solely to avoid creating privileges.
- Add the new section id to ACCESS_SECTIONS in lib/access-control.ts.
- Do not add ad hoc operations; keep ACCESS_OPERATIONS as read, write, manage unless the operation model is intentionally changed for all sections.
- Confirm INITIAL_PERMISSIONS now includes section-id:read, section-id:write, section-id:manage via ACCESS_SECTIONS x ACCESS_OPERATIONS.
- Do not rely on a Prisma migration or model creation to grant these keys; bootstrapAccessControl persists them and upserts each as a grant on the code-owned Admin role. Any user already assigned Admin inherits the new grants through that role, not through a direct per-user permission insert.

2. Add sidebar navigation wiring when applicable

- For a user-navigable section, add a new item in SERVICE_DESK_NAVIGATION in lib/service-desk-navigation.ts.
- Make the sidebar item visible when the effective permission keys contain any one exact grant for its section: read, write, or manage. Visibility must not add or imply a permission key. Add the section icon mapping in components/app-sidebar.tsx.
- Gateway boundaries do not need a sidebar item. When navigation changes, preserve hiding of empty groups through getReadableServiceDeskNavigationGroups.

3. Scaffold protected dashboard routes

- Create the section's list page, new page, detail page, and edit page or edit form, following the existing section patterns. A route folder without a page file serves no URL.
- Resolve current application access server-side in every section page and allow rendering when the user holds any one of section-id:read, section-id:write, or section-id:manage.
- Show the create control on the list page to every user and disable it unless the user holds section-id:write. Show the edit control on the detail page to every user and disable it unless the user holds section-id:manage.
- Redirect a user who reaches the new page without section-id:write to /dashboard. Redirect a user who reaches an edit page or edit form without section-id:manage to the detail page.
- In server actions, gate creation with section-id:write and editing with section-id:manage. A disabled control is not authorization.
- Keep actor identity server-derived using requireCurrentApplicationAccess; do not trust client-submitted actor ids.

4. Update automated tests in the same PR

- Extend lib/access-control.test.ts to assert the new section is in ACCESS_SECTIONS and receives read/write/manage generated permissions.
- Extend lib/access-control.test.ts to assert that a role holding only section-id:write or only section-id:manage does not resolve section-id:read, and that a role holding section-id:write together with section-id:read resolves both. Keep effective permission keys exact; visibility must not synthesize read or any other grant.
- Extend lib/service-desk-navigation.test.ts to assert that the section is visible with each exact read, write, and manage grant, and hidden when none is held.
- Add or update route and action tests to assert that any one of read, write, or manage opens every section page, that the new page and creation require section-id:write, that the edit page or form and editing require section-id:manage, and that each control is disabled rather than hidden without its key.

5. Seed the approved database and validate before handoff

- Confirm the target database/environment is authorized before running pnpm db:seed. bootstrapAccessControl deletes permissions for sections no longer in ACCESS_SECTIONS; review the complete section list before seeding so existing grants are not removed unintentionally.
- Run pnpm db:seed against that approved target and confirm output indicates permissions were seeded and the Admin role was created or upserted. Verify the new read/write/manage keys are granted to Admin; the seed count alone does not prove the intended user has access.
- When INITIAL_ADMIN_EMAIL is non-empty after trimming, confirm output states `Initial administrator role assigned`; this attaches the expanded Admin role to the administrator user.
- When INITIAL_ADMIN_EMAIL is missing, empty, or whitespace-only, output states `INITIAL_ADMIN_EMAIL not set; administrator role not assigned`. Configure a non-empty administrator email and rerun seed before relying on an administrator session for the new boundary.
- Confirm the configured administrator has the Admin UserRole and receives the new keys in effective permissions. Existing Admin-role holders inherit the role's new keys after bootstrap; do not grant each key directly to individual administrators.
- Check diagnostics, run pnpm typecheck and scoped lint, then focused access-control, navigation, and route/action tests. Broaden validation only when the change requires it.

6. Verify admin assignment flow still works

- Ensure new base permissions are assignable through role management flows after seed.
- Confirm the intended administrator can read and use the new section after bootstrap and that another user with none of its section grants cannot access it.
- For a navigable section, confirm it appears in the sidebar for a user holding any one exact section-id:read, section-id:write, or section-id:manage grant, and is hidden when none is held. Confirm visibility does not add a missing permission key.
- Confirm route-level access remains blocked when the user holds none of the grants accepted by the page visibility rule, even if the user can reach the URL manually.
- Assign section-id:read only when a role needs the exact read grant or read-only access. Do not require read alongside write or manage for existing-page or navigation visibility.

## Permission Assignment Flow

- Permission creation source of truth is code constants in access-control.
- Permission persistence runs through bootstrapAccessControl in server access-control.
- Role assignment happens through admin role management pages and actions.
- User effective permissions are resolved server-side as the union of the permissions granted on the user's roles. No key is implied: write and manage grants do not add read, and no page rule synthesizes a grant. Any one of a section's read, write, or manage keys opens its pages and its sidebar entry. Write is needed to create and to reach the new page; manage is needed to edit and to reach the edit form. Assign read only when a read-only role or an explicitly read-gated operation needs it.

## Security and Auth Implications

- Do not create base permissions from free-text admin UI input.
- Do not gate new sections in client components only; enforce on server routes and actions.
- Keep actor identity server-derived in management operations.

## Pitfalls to avoid

- Adding a new top-level access boundary without adding a section and generated privilege keys.
- Adding a section route without adding it to ACCESS_SECTIONS.
- Adding a navigation item without a permission-aware visibility rule that accepts any one exact section read, write, or manage grant.
- Adding permission checks only in UI and skipping server enforcement.
- Forgetting tests when introducing a new navigation group or permission-dependent section.
- Gating a section page or sidebar entry on read alone: any one of the section's exact read, write, or manage keys opens both.
- Hiding the create or edit control instead of disabling it, or treating a disabled control as authorization.
- Requiring a role or user to hold read alongside write or manage to view pages or navigation.
- Adding an independently gated data model but skipping Admin role grants or the configured administrator's Admin assignment.
- Running seed against an unapproved target or dropping an existing ACCESS_SECTIONS key without accounting for permission deletion.
