export function adminRolesListTag() {
  return "admin:roles"
}

export function adminRoleDetailTag(roleId: string) {
  return `admin:roles:${roleId}`
}

export function adminUsersListTag() {
  return "admin:users"
}

export function adminUserDetailTag(targetUserId: string) {
  return `admin:users:${targetUserId}`
}

export function adminUserRoleOptionsTag() {
  return "admin:user-role-options"
}
