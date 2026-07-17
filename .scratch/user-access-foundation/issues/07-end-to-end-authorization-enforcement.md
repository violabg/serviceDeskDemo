# 07 - End-to-end authorization enforcement

**What to build:** Non-admin users with assigned roles see only allowed navigation, can read allowed sections, cannot perform unauthorized writes, and multi-role union behavior is verified end to end.

**Blocked by:** 06 - Assign and revoke user roles.

**Status:** ready-for-agent

- [ ] User with read-only permission can view allowed sections but cannot perform write actions.
- [ ] User with multiple roles receives the union of all allowed permissions.
- [ ] User without permission for a section does not see that navigation item.
- [ ] Server-side write checks block unauthorized writes even if UI controls are bypassed.
- [ ] Pending/no-role user remains unable to access dashboard sections.
- [ ] Manual demo flow covers first login, pending access, admin role assignment, and updated access after assignment.
- [ ] Automated tests cover read-only access, write denial, sidebar filtering, and multi-role union behavior.
