# Access Control Reference

## When to read this

Use this reference for existing roles, permission assignments, operation policy, seed behavior, or effective permissions. For a new application access boundary, use `dashboard-section-permission-flow-checklist.md`; read both documents when the task also changes existing role assignments.

## Last verified

2026-07-29, commit unavailable, dirty worktree.

## Evidence

- `lib/access-control.ts` defines code-owned sections, operations, and generated base permissions.
- `lib/access-control/server.ts` bootstraps permissions, binds them to the Admin role, and resolves effective permissions from user roles.
- `prisma/seed.ts` runs the bootstrap flow and reports whether the configured initial administrator received the Admin role.

## Permission Vocabulary

Application permissions are created from code, not from the admin UI.

- Base permissions come from `ACCESS_SECTIONS` and `ACCESS_OPERATIONS` in `lib/access-control.ts`.
- `read`, `write`, and `manage` are the canonical operation set. Do not add ad hoc operations for an existing section.
- Assign existing base permissions to roles through role management. Do not create base permissions from UI input.
