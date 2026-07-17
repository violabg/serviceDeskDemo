# Access Control Workflow

How agents and developers should evolve local application permissions.

## Permission Vocabulary

Application permissions are created from code, not from the admin UI.

When a new application section is introduced:

1. Add the section id to `ACCESS_SECTIONS` in `lib/access-control.ts`.
2. Run the seed workflow.
3. The seed upserts the standard permissions for that section:
   - `<section>:read`
   - `<section>:write`
   - `<section>:manage`
4. Admin users assign those permissions to roles through the role management UI.

Example: adding `tickets` to `ACCESS_SECTIONS` creates `tickets:read`, `tickets:write`, and `tickets:manage`.

Do not create permissions directly from UI input. This avoids typos, orphan sections, and permissions that do not map to real application surfaces.

## User Management First Slice

The first user management implementation should include two protected sections:

- `/users`: list local application users.
- User detail: show email, name, assigned roles, and effective permissions.
- User role assignment: allow an authorized admin user to assign and remove existing roles.
- `/roles`: list roles and create or edit role permission assignments.

Do not expose direct manual creation of base permissions. Base permissions remain code-defined and seed-created from `ACCESS_SECTIONS` and `ACCESS_OPERATIONS`.

Required access gates:

- `users:read` to view users.
- `users:write` to assign or remove user roles.
- `roles:read` to view roles.
- `roles:write` to create roles or edit role permissions.

The `manage` operation is reserved for destructive or high-impact actions, such as deleting non-system roles, when those actions are introduced.

## Future Skill Candidate

Create a repository skill for adding a service desk section. It should update `ACCESS_SECTIONS`, navigation, route scaffolding, tests, and seed validation together.
