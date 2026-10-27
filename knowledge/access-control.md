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

## Independent Entity Privileges

A database entity does not automatically create a permission. When a new entity needs its own read/write/manage boundary, add it to `ACCESS_SECTIONS` and let `INITIAL_PERMISSIONS` generate its operation keys. Customer is the current example: it has its own `customers` section, so its existing pages use the section visibility rule below and its actions use `customers:write` for creation and `customers:manage` for edits. Asset has no section of its own; its reads and writes inside ticket workflows are gated by tickets permissions. An entity accessed only inside an existing gated workflow can use that workflow's section. Never reuse an unrelated section merely to avoid defining an independent boundary. Gate new routes and mutations on the server; add permission-filtered navigation when users need to browse the section.

## Admin Grants and Seed Verification

`bootstrapAccessControl` upserts every generated base permission and grants each one to the system Admin role through `RolePermission`. Users already holding Admin inherit its expanded privileges. When `INITIAL_ADMIN_EMAIL` is nonblank, bootstrap also upserts that application user and assigns Admin through `UserRole`; without it, seed logs that no initial administrator role was assigned. Do not claim the administrator has the new access merely because the Admin role or the database model exists. Use the runbook in `dashboard-section-permission-flow-checklist.md` to seed the authorized database, verify the Admin grants and intended administrator's effective permissions, and test the read/write/manage gates. This repository does not grant new base permissions directly to a single administrator user.

Bootstrap deletes permissions whose sections are no longer in `ACCESS_SECTIONS` before upserting the current set. Review changes to the section list and the target database before running seed.

## Operation and Assignment Gates

`getEffectivePermissionKeys` unions the grants held by all of the user's roles. It adds nothing else: the resolved set contains exactly the `section:operation` keys that are stored as grants. `hasPermission` checks one exact `section:operation` key against that resolved set. Page visibility is a separate policy check and does not add or imply any permission key.

## Page Visibility and Operation Access

Each section has three independent grants: `read`, `write`, and `manage`. No grant implies another. Existing section pages and their sidebar entries are visible when the user has any one of the section's exact `read`, `write`, or `manage` grants.

- A user with `section:read`, `section:write`, or `section:manage` may view existing pages and their content for that section. Do not require `section:read` solely to make an existing page or its navigation entry visible.
- A new-content page and its link or call to action require `section:write`. A user with only `section:read` or only `section:manage` cannot access the new-content page or use its entry point.
- `section:write` authorizes creating a new entity. `section:manage` authorizes editing an existing entity, including managing its enabled or disabled state when that action applies.
- The view rule does not synthesize grants. A user with `section:write` or `section:manage` but without `section:read` still has no `section:read` key. Keep server actions gated by the exact key for the operation they perform.
- `section:read` alone is valid: it permits viewing existing pages but not creating new entities or editing existing ones.
- Removing a role's `section:read` grant does not remove its visibility of existing pages if the role still has `section:write` or `section:manage`. It still removes the read key from the effective grant set.
- Bootstrap grants every generated key to Admin, including each section's read key.
- Test that effective permission keys remain exact and do not acquire implied operations. Separately test that each of `section:read`, `section:write`, and `section:manage` permits existing-page visibility, that only `section:write` permits new-content pages and their calls to action, that creation requires `section:write`, and that edits to existing entities require `section:manage`.
- The dashboard page follows the same existing-page visibility rule for `dashboard`. Action access remains operation-specific: creating an entity requires its section's write key, and editing an existing entity requires its section's manage key.
- Keep the actor identity derived from the server session and gate writes on the server.

## Requirement Roles and Permission Keys

User stories and bugs name roles ("only Admin can ...", "Operator can ..."). The application never gates on a role name. Action gates check an exact `section:operation` key through `hasPermission`; existing-page visibility accepts any one of the section's exact read, write, or manage keys; new-content pages require the section's write key. Translate each role statement into keys before designing; never add a role-name check.

- **A role named in a requirement is the set of keys that role holds.** Creating a new entity requires `section:write`, and its new-content page and call to action also require `section:write`. Editing an existing entity requires `section:manage`. Existing section pages are visible to a holder of any one of `section:read`, `section:write`, or `section:manage`. Do not add `section:read` just to make a page visible, and do not treat visibility as an implied grant.
- **"Admin" means admin privileges, not the `Admin` role alone.** Bootstrap creates the `Admin` role as a system role (`isSystem`) and grants it every generated key. `isSystem` marks a role as code-owned and locked against editing in role management; it is not a privilege marker. Any other role an administrator grants the same keys has the same admin privileges, and a key gate already covers it. Do not gate on the role name or on `isSystem`.
- **"Only Admin" means keys that only Admin receives from code.** Gate the action on its required key: use `section:write` for creating a new entity and `section:manage` for editing an existing entity. Grant that key to no other role in code. Role management can still grant it to another role; that is an administrator's deliberate choice, not a defect of the design. Do not gate on `isAdmin`, which is informational only.
- **Admin is the only code-owned role.** Every other role is created and granted keys through role management, not by bootstrap or seed. When a requirement says a non-Admin role must be able to do something, assign the exact key for the required operation through role management: `section:write` for creation, `section:manage` for editing, and `section:read` when read-only access or an explicitly read-gated operation is needed. Existing-page visibility does not require adding read alongside write or manage. Do not make a role code-owned (seeded role or seeded grant list) unless the requirement explicitly asks for it.
- **Data shown inside another section is gated by the host section.** An entity displayed inside another section's workflow is read under the host section's key. The entity's own keys, when it has a section, gate only its own pages and actions.
- **Every mutation path carries the action gate.** When a requirement gates an action, the same key check guards every server entry point that performs it: create, edit, status change, bulk or override paths, and every action that calls the same service function. Use write for creating a new entity and manage for editing an existing entity. A conditional gate inside one action must be repeated in every other action that can reach the same change. Resolve the actor's keys on the server from the session; never pass a caller-built flag into a service as the gate.

These are policy rules, not proof that every current page, navigation filter, or action already implements them. Inspect and update all affected server-side page checks, navigation visibility, calls to action, mutation gates, and tests before claiming the runtime behavior is aligned.
