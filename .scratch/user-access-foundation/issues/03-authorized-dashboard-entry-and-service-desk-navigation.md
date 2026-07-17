# 03 - Authorized dashboard entry and service-desk navigation

**What to build:** A seeded administrator can enter the dashboard, dashboard access requires dashboard read permission, and sidebar navigation shows service-desk sections filtered by effective read permissions.

**Blocked by:** 01 - Access model spine and admin bootstrap; 02 - First-login Application User and pending access flow.

**Status:** ready-for-agent

- [ ] Dashboard access requires an authenticated identity and a local Application User with dashboard read permission.
- [ ] Seeded administrator can enter the dashboard after login.
- [ ] Logged-in users without dashboard read permission continue to pending access.
- [ ] Sidebar navigation uses service-desk sections instead of placeholder demo links.
- [ ] Sidebar shows only sections for which the user has read permission.
- [ ] User Management is visible only to users with the required user-management permission.
- [ ] Automated tests cover authorized dashboard access, unauthorized redirect, and navigation filtering.
