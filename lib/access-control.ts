export const ACCESS_SECTIONS = [
  "dashboard",
  "users",
  "roles",
] as const

export const ACCESS_OPERATIONS = ["read", "write", "manage"] as const

export const ADMIN_ROLE_NAME = "Admin"

export type AccessSection = (typeof ACCESS_SECTIONS)[number]
export type AccessOperation = (typeof ACCESS_OPERATIONS)[number]

export type PermissionGrant = {
  section: AccessSection
  operation: AccessOperation
  description: string
}

export type RolePermissionGrant = {
  permission: {
    section: string
    operation: string
  }
}

export type RoleWithPermissions = {
  permissions: RolePermissionGrant[]
}

export type UserRoleWithPermissions = {
  role: RoleWithPermissions
}

export const INITIAL_PERMISSIONS = ACCESS_SECTIONS.flatMap((section) =>
  ACCESS_OPERATIONS.map((operation) => ({
    section,
    operation,
    description: `${operation} access for ${section}`,
  })),
) satisfies PermissionGrant[]

export function permissionKey(
  section: string,
  operation: string,
) {
  return `${section}:${operation}`
}

export function getEffectivePermissionKeys(
  roles: UserRoleWithPermissions[],
) {
  return new Set(
    roles.flatMap(({ role }) =>
      role.permissions.map(({ permission }) =>
        permissionKey(permission.section, permission.operation),
      ),
    ),
  )
}

export function hasPermission(
  effectivePermissions: ReadonlySet<string>,
  section: AccessSection,
  operation: AccessOperation,
) {
  return effectivePermissions.has(permissionKey(section, operation))
}

export function getDashboardAccessRedirectPath({
  isAuthenticated,
  canReadDashboard,
}: {
  isAuthenticated: boolean
  canReadDashboard?: boolean
}) {
  if (!isAuthenticated) {
    return "/login"
  }

  if (!canReadDashboard) {
    return "/pending-access"
  }

  return null
}
