# 04 - User directory with pending-user visibility

**What to build:** An authorized administrator can open User Management, see all Application Users, distinguish pending users with no roles, and inspect identity, email, and assigned roles.

**Blocked by:** 03 - Authorized dashboard entry and service-desk navigation.

**Status:** ready-for-agent

- [ ] User Management page is available to users with user read permission.
- [ ] User Management page lists Application Users.
- [ ] Each listed user shows enough identity information to match the local user to the logged-in person.
- [ ] Users with no assigned roles are clearly distinguishable as pending access.
- [ ] Assigned roles are visible for each user.
- [ ] Users without user read permission cannot view the directory.
- [ ] Automated tests cover authorized directory access, pending-user display, and unauthorized denial.
