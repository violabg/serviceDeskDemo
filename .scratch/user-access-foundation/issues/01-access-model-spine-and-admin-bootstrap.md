# 01 - Access model spine and admin bootstrap

**What to build:** Application authorization exists in the local database and can be verified without UI. Base service-desk sections, standard operations, structured permissions, an Admin role, `INITIAL_ADMIN_EMAIL` bootstrap, and effective-permission calculation all work together.

**Blocked by:** None - can start immediately.

**Status:** ready-for-agent

**GitHub issue:** https://github.com/violabg/serviceDeskDemo/issues/1

- [ ] Base service-desk sections and standard operations are represented as structured permissions.
- [ ] Admin role is created with full access to all initial permissions.
- [ ] `INITIAL_ADMIN_EMAIL` can bootstrap the first administrator without a public setup screen.
- [ ] Application User, Role, Permission, user-role assignment, and role-permission assignment support the agreed access model.
- [ ] Effective permissions are computed as an allow-only union across all assigned roles.
- [ ] Access helper can answer whether a user has a given section and operation permission.
- [ ] Automated tests cover admin bootstrap, structured permission lookup, and multi-role permission union.
