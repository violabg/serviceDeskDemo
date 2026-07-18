export function adminRolesListTag(actorUserId: string) {
  return `admin:roles:${actorUserId}`
}

export function adminRoleDetailTag(actorUserId: string, roleId: string) {
  return `admin:roles:${actorUserId}:${roleId}`
}

export function adminUsersListTag(actorUserId: string) {
  return `admin:users:${actorUserId}`
}

export function adminUserDetailTag(actorUserId: string, targetUserId: string) {
  return `admin:users:${actorUserId}:${targetUserId}`
}
