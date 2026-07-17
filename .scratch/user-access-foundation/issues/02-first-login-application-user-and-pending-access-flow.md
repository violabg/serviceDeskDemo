# 02 - First-login Application User and pending access flow

**What to build:** A GitHub/Neon-authenticated person gets a local Application User automatically, receives zero roles by default, cannot enter the dashboard, and sees a pending-access page outside the dashboard shell.

**Blocked by:** 01 - Access model spine and admin bootstrap.

**Status:** ready-for-agent

- [ ] First successful login creates or completes a local Application User linked to the Neon Auth identity.
- [ ] New Application Users receive no roles by default.
- [ ] Logged-in users without dashboard read access are redirected to pending access.
- [ ] Pending-access page is outside the dashboard shell and does not reveal sidebar navigation.
- [ ] Existing Neon Auth login, auth, account, and auth API flows remain intact.
- [ ] Automated tests cover first-login user creation and zero-role dashboard denial.
- [ ] Manual verification confirms a newly logged-in GitHub user lands on pending access.
