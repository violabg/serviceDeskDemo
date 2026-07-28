# Access Control And Navigation Checklist

Use this knowledge before changing application access rules, role management, permission-gated navigation, or the pending-access flow.

## When to read

- Before adding a new protected dashboard or admin section.
- Before changing permission checks, role assignment flows, or permission vocabulary.
- Before changing sidebar or grouped navigation visibility.
- Before changing login redirect behavior, dashboard access gating, or the `/pending-access` route.

## Do not read when

- The task is limited to styling, static copy, or components with no access-control behavior.
- The task changes public routes only and does not touch dashboard access rules.

## Rule Inventory

1. Application permissions are code-defined. Add new protected route or section identifiers in `ACCESS_SECTIONS`; do not create base permissions from admin UI input.
2. Base permissions follow fixed shape `<section>:read`, `<section>:write`, and `<section>:manage` from `ACCESS_SECTIONS` × `ACCESS_OPERATIONS`.
3. When a new protected route or section is introduced, run the seed/bootstrap access-control workflow so the initial permission keys are upserted and attached to the Admin role, with the initial admin user inheriting them through that role assignment.
4. Effective permissions are an allow-only union of assigned role permissions and should be treated as permission keys, not ad hoc booleans.
5. Navigation visibility is permission-gated. `SERVICE_DESK_NAVIGATION` is filtered by each item's `requiredPermission`, and empty groups are removed.
6. Protected dashboard access uses two redirects only: unauthenticated users go to `/login`; authenticated users without dashboard read access go to `/pending-access`.
7. `/pending-access` is holding state for signed-in users who lack dashboard access. It is not generic auth failure page, and users who gain dashboard access should redirect to `/dashboard`.
8. User and role management first slice uses fixed access gates: `users:read`, `users:write`, `roles:read`, `roles:write`. Reserve `manage` for destructive or high-impact actions when introduced.
9. When adding a new protected section, update both permission model and visible navigation model together so route surfaces, permissions, and navigation stay aligned.

## Key Evidence Anchors

- `lib/access-control.ts` defines sections, operations, permission keys, effective permission union, and dashboard redirect path.
- `lib/service-desk-navigation.ts` defines grouped navigation and permission-based filtering.
- `app/(dashboard)/admin/_lib/current-application-user.ts` enforces authenticated dashboard access and redirects to `/pending-access`.
- `app/pending-access/page.tsx` defines pending-access behavior for authenticated users without dashboard read access.
- `docs/agents/access-control.md` defines code-first permission creation and initial user/role management slice.
- `lib/access-control/server.ts` bootstraps permissions, Admin role permissions, and initial admin user-role assignment.

## Planning Checklist

- If task adds protected section, confirm section id belongs in `ACCESS_SECTIONS`.
- Confirm required read/write/manage permissions exist or will be seed-created.
- Confirm seed/bootstrap access-control runs so new permission keys are added to the Admin role and therefore available to the initial admin user.
- Confirm route gate, action gate, and navigation gate use same permission vocabulary.
- Confirm pending-access and login redirects still separate unauthenticated from authenticated-without-access cases.
- Confirm any new admin capability uses `manage` only for destructive or high-impact actions.
