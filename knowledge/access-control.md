---
tier: "MustHave"
keywords: ["roles","permissions","admin","operator","rbac","hasPermission"]
intent: "When designing any permission-gated feature, translating requirement role statements (Admin, Operator) into permission keys, changing roles, permission assignments, read/write/manage policy, or diagnosing seed and effective-permission behavior."
---
# Access Control

## Keys

Permissions are code-defined. `ACCESS_SECTIONS` crossed with `ACCESS_OPERATIONS` yields one key per operation, and the operations are always `read`, `write` and `manage`. Assign existing keys to roles through role management; never create a key from UI input and never add an operation ad hoc.

## Effective permissions

A user's effective keys are exactly the union of the grants on their roles. `hasPermission` matches one exact `section:operation` key, and no key implies another in either direction. Page visibility is a separate policy check that grants no key.

## Section boundaries

A model, migration or route creates no privilege. Give a boundary its own section only when it needs independent keys; data read or written inside another section's workflow is gated by the host section's keys. Never reuse an unrelated section to avoid defining a boundary, and gate a new section's routes and mutations on the server.

## Page privilege rules

Every section, page and entity follows these, without variation:

- Any one of `section:read`, `section:write` or `section:manage` opens every page of the section.
- The list page always shows the create control; it is enabled only with `section:write`.
- The create page is reachable only with `section:write`; without it redirect to the dashboard.
- The detail page always shows the edit control; it is enabled only with `section:manage`.
- The edit page or form is reachable only with `section:manage`; without it redirect to the detail page. When editing opens in a modal, the disabled control is the only guard and no edit URL exists.
- The server path that creates content tests `section:write`; the server path that edits a record tests `section:manage`. A hidden or disabled control is not authorization.
- Derive the actor from the server session; never accept a caller-built flag as the gate.
- Every server entry point that performs a gated action carries the same check — create, edit, status change, bulk, override, and anything calling the same service.

## Seed

Bootstrap upserts every generated key and grants it to the system Admin role, so Admin holders inherit new keys through that role. It also deletes keys for sections no longer in `ACCESS_SECTIONS`: review the full section list before seeding. A blank `INITIAL_ADMIN_EMAIL` assigns no administrator and seed reports it. Never assume the administrator has new access because the role or the model exists — verify the Admin grants and the intended user's effective keys after seeding, and never grant a key directly to one user.

## Requirement roles

Requirements name roles; the application gates on keys. Translate every role statement into a section, a case and one exact key: viewing, creating or editing.

- A named role is the set of keys that role holds. `section:write` creates, `section:manage` edits, and any of the three views. Never assign a key the requirement does not need, and never treat viewing as permission to create or edit.
- "Admin" means admin privileges, not the `Admin` role. Bootstrap creates `Admin` as a code-owned system role holding every generated key; `isSystem` marks code ownership, not privilege. Any role granted the same keys has the same privileges, so a key gate already covers it.
- "Only Admin" means a key that only Admin receives from code. Gate the action on that key and grant it to no other role in code; role management may still grant it, which is an administrator's choice. `isAdmin` is informational only.
- Admin is the only code-owned role. Assign every other role its keys through role management, and make a role code-owned only when the requirement asks for it.
- Assign `section:read` only when a read-only role or an explicitly read-gated operation needs it. Viewing never requires it.

A page, control, navigation filter or action that breaks these rules is a defect to fix, never a precedent to copy.
