---
tier: "MustHave"
keywords: ["roles","permissions","admin","operator","rbac","hasPermission"]
intent: "When designing any permission-gated feature, translating requirement role statements (Admin, Operator) into permission keys, changing roles, permission assignments, read/write/manage policy, or diagnosing seed and effective-permission behavior."
---
# Access Control Reference

## When to read this

Use this reference for existing roles, permission assignments, operation policy, seed behavior, or effective permissions. For a new application access boundary, use `dashboard-section-permission-flow-checklist.md`; read both documents when the task also changes existing role assignments.

## Permission Vocabulary

Application permissions are created from code, not from the admin UI.

- Base permissions come from `ACCESS_SECTIONS` and `ACCESS_OPERATIONS` in `lib/access-control.ts`.
- `read`, `write`, and `manage` are the canonical operation set. Do not add ad hoc operations for an existing section.
- Assign existing base permissions to roles through role management. Do not create base permissions from UI input.

## Independent Section Privileges

A database model does not automatically create a permission. When a new data boundary needs its own read/write/manage privileges, add its section id to `ACCESS_SECTIONS` and let `INITIAL_PERMISSIONS` generate its three operation keys. A migration or model creation grants nothing on its own. Data that is only ever read or written inside another section's workflow uses that section's keys. Never reuse an unrelated section merely to avoid defining an independent boundary. Gate new routes and mutations on the server; add permission-filtered navigation when users need to browse the section.

## Admin Grants and Seed Verification

`bootstrapAccessControl` upserts every generated base permission and grants each one to the system Admin role through `RolePermission`. Users already holding Admin inherit its expanded privileges. When `INITIAL_ADMIN_EMAIL` is nonblank, bootstrap also upserts that application user and assigns Admin through `UserRole`; without it, seed logs that no initial administrator role was assigned. Do not claim the administrator has the new access merely because the Admin role or the database model exists. Use the runbook in `dashboard-section-permission-flow-checklist.md` to seed the authorized database, verify the Admin grants and intended administrator's effective permissions, and test the read/write/manage gates. This repository does not grant new base permissions directly to a single administrator user.

Bootstrap deletes permissions whose sections are no longer in `ACCESS_SECTIONS` before upserting the current set. Review changes to the section list and the target database before running seed.

## Operation and Assignment Gates

`getEffectivePermissionKeys` unions the grants held by all of the user's roles. It adds nothing else: the resolved set contains exactly the `section:operation` keys that are stored as grants. `hasPermission` checks one exact `section:operation` key against that resolved set. Page visibility is a separate policy check and does not add or imply any permission key.

## Page Privilege Rules

Every section page follows the same rules. They do not vary by section, by page, or by what the page displays.

- Each section has three independent keys: `section:read`, `section:write`, and `section:manage`. No key implies another in either direction.
- **View.** Opening any section page, list or detail, requires any one of the section's three exact keys. A holder of `section:write` or `section:manage` alone can open it; a holder of none cannot.
- **List page.** The list page always offers the control that creates new content. The control is enabled only for a holder of `section:write` and is disabled for everyone else. Privilege never hides it.
- **New page.** The page that creates new content is reachable only with `section:write`. A user without it who reaches that URL is redirected to `/dashboard`.
- **Edit control.** The detail page always offers the control that edits. The control is enabled only for a holder of `section:manage` and is disabled for everyone else. Privilege never hides it.
- **Edit page or form.** The page or form that edits an existing record is reachable only with `section:manage`. A user without it who reaches that URL is redirected to the detail page. When editing opens in a modal, the disabled edit control is what prevents opening it, and no separate edit URL exists to guard.
- **Server enforcement.** A disabled or hidden control is not authorization. The server path that creates new content tests the section's `section:write` key, and the server path that edits an existing record tests the section's `section:manage` key. Never substitute a visibility check for either key.
- **Exact keys.** These rules never add, infer, or synthesize a key. A user with `section:write` alone still has no `section:read` key, and a user with `section:manage` alone still has no `section:write` key.
- Keep the actor identity derived from the server session and gate mutations on the server.

## Requirement Roles and Permission Keys

User stories and bugs name roles ("only Admin can ...", "Operator can ..."). The application never gates on a role name. Translate each statement into the exact `section:operation` keys the page rules need, then check three things before designing: which section, whether the case is viewing, creating, or editing, and which exact key that case tests. Never add a role-name check.

- **A role named in a requirement is the set of keys that role holds.** Any one of `section:read`, `section:write`, or `section:manage` lets its holder view the section's pages. `section:write` lets its holder reach the new page and use the create control. `section:manage` lets its holder reach the edit form and use the edit control. Do not assign a key the requirement does not need, and do not treat a view as permission to create or edit.
- **"Admin" means admin privileges, not the `Admin` role alone.** Bootstrap creates the `Admin` role as a system role (`isSystem`) and grants it every generated key. `isSystem` marks a role as code-owned and locked against editing in role management; it is not a privilege marker. Any other role an administrator grants the same keys has the same admin privileges, and a key gate already covers it. Do not gate on the role name or on `isSystem`.
- **"Only Admin" means keys that only Admin receives from code.** Gate the action on its required key: `section:write` to create and to reach the new page, `section:manage` to edit and to reach the edit form. Grant that key to no other role in code. Role management can still grant it to another role; that is an administrator's deliberate choice, not a defect of the design. Do not gate on `isAdmin`, which is informational only.
- **Admin is the only code-owned role.** Every other role is created and granted keys through role management, not by bootstrap or seed. When a requirement says a non-Admin role must be able to do something, assign the exact key for that case through role management: `section:write` for creation, `section:manage` for editing, and `section:read` only when a read-only role or an explicitly read-gated operation needs it. Viewing a page never requires `section:read` specifically. Do not make a role code-owned (seeded role or seeded grant list) unless the requirement explicitly asks for it.
- **Data shown inside another section is gated by the host section.** Data displayed inside another section's workflow is read under the host section's key. Its own keys, when it has a section, gate only its own pages and actions.
- **Every mutation path carries the action gate.** When a requirement gates an action, the same key check guards every server entry point that performs it: create, edit, status change, bulk or override paths, and every action that calls the same service function. Use `section:write` on every creation path and `section:manage` on every edit path. A conditional gate inside one action must be repeated in every other action that can reach the same change. Resolve the actor's keys on the server from the session; never pass a caller-built flag into a service as the gate.

These are the rules, not a description of the current code. A page, navigation filter, control, or action that does not follow them is a defect to be fixed, never a precedent to copy.
