# 06 - Assign and revoke user roles

**What to build:** An authorized administrator can assign one or more roles to users and remove roles, changing each user's effective access without deleting the user.

**Blocked by:** 04 - User directory with pending-user visibility; 05 - Role management with permission matrix.

**Status:** ready-for-agent

- [ ] User Management lets an authorized administrator assign roles to an Application User.
- [ ] User Management lets an authorized administrator remove roles from an Application User.
- [ ] A user may hold multiple roles at the same time.
- [ ] Effective permissions update after role assignment and revocation.
- [ ] Removing all roles returns the user to pending/no-access behavior where applicable.
- [ ] Users without user write or manage permission cannot change role assignments.
- [ ] Automated tests cover role assignment, role revocation, multi-role effective access, and unauthorized denial.
