import {
    ACCESS_SECTIONS,
    ADMIN_ROLE_NAME,
    INITIAL_PERMISSIONS,
    getEffectivePermissionKeys,
    hasPermission,
    permissionKey,
    type AccessOperation,
    type AccessSection,
} from "@/lib/access-control"
import { prisma } from "@/lib/prisma"

const ADMIN_ROLE_DESCRIPTION = "Full access to dashboard, users, and roles"

type ManagementActorInput = {
  actorUserId: string
}

type UserRoleMutationInput = ManagementActorInput & {
  targetUserId: string
  roleId: string
}

type RoleMutationInput = ManagementActorInput & {
  name: string
  description?: string | null
  permissionIds?: string[]
}

type RoleUpdateInput = RoleMutationInput & {
  roleId: string
  permissionIds: string[]
}

export type AuthenticatedSessionUser = {
  id: string
  email?: string | null
  name?: string | null
  image?: string | null
}

function getApplicationUserData(sessionUser: AuthenticatedSessionUser) {
  const email = sessionUser.email?.trim().toLowerCase()

  if (!email) {
    throw new Error("Authenticated user must have an email address")
  }

  return {
    neonAuthId: sessionUser.id,
    email,
    name: sessionUser.name ?? null,
    image: sessionUser.image ?? null,
  }
}

function shouldUpdateApplicationUser(
  user: {
    neonAuthId: string | null
    email: string
    name: string | null
    image: string | null
  },
  data: {
    neonAuthId: string
    email: string
    name: string | null
    image: string | null
  },
) {
  return (
    user.neonAuthId !== data.neonAuthId ||
    user.email !== data.email ||
    user.name !== data.name ||
    user.image !== data.image
  )
}

function normalizeOptionalText(value: string | null | undefined) {
  const normalized = value?.trim()

  return normalized ? normalized : null
}

function normalizeRequiredName(name: string) {
  const normalized = name.trim()

  if (!normalized) {
    throw new Error("Role name is required")
  }

  return normalized
}

function getUniquePermissionIds(permissionIds: string[]) {
  return [...new Set(permissionIds)].filter(Boolean)
}

async function requireUserPermission(
  userId: string,
  section: AccessSection,
  operation: AccessOperation,
) {
  const allowed = await userHasPermission(userId, section, operation)

  if (!allowed) {
    throw new Error(`Missing permission: ${permissionKey(section, operation)}`)
  }
}

export async function bootstrapAccessControl(
  initialAdminEmail = process.env.INITIAL_ADMIN_EMAIL,
) {
  await prisma.permission.deleteMany({
    where: {
      section: {
        notIn: [...ACCESS_SECTIONS],
      },
    },
  })

  const permissions = await Promise.all(
    INITIAL_PERMISSIONS.map((permission) =>
      prisma.permission.upsert({
        where: {
          section_operation: {
            section: permission.section,
            operation: permission.operation,
          },
        },
        update: {
          description: permission.description,
        },
        create: permission,
      }),
    ),
  )

  const normalizedEmail = initialAdminEmail?.trim().toLowerCase()
  const [adminRole, adminUser] = await Promise.all([
    prisma.role.upsert({
      where: { name: ADMIN_ROLE_NAME },
      update: {
        description: ADMIN_ROLE_DESCRIPTION,
        isSystem: true,
      },
      create: {
        name: ADMIN_ROLE_NAME,
        description: ADMIN_ROLE_DESCRIPTION,
        isSystem: true,
      },
    }),
    normalizedEmail
      ? prisma.user.upsert({
          where: { email: normalizedEmail },
          update: {},
          create: { email: normalizedEmail },
        })
      : Promise.resolve(null),
  ])

  await Promise.all(
    permissions.map((permission) =>
      prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: adminRole.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          roleId: adminRole.id,
          permissionId: permission.id,
        },
      }),
    ),
  )

  if (adminUser) {
    await prisma.userRole.upsert({
      where: {
        userId_roleId: {
          userId: adminUser.id,
          roleId: adminRole.id,
        },
      },
      update: {},
      create: {
        userId: adminUser.id,
        roleId: adminRole.id,
      },
    })
  }

  return {
    adminRole,
    adminUser,
    permissionCount: permissions.length,
  }
}

export async function ensureApplicationUserForSessionUser(
  sessionUser: AuthenticatedSessionUser,
) {
  const data = getApplicationUserData(sessionUser)
  const existingByAuthId = await prisma.user.findUnique({
    where: { neonAuthId: data.neonAuthId },
  })

  if (existingByAuthId) {
    if (!shouldUpdateApplicationUser(existingByAuthId, data)) {
      return existingByAuthId
    }

    return prisma.user.update({
      where: { id: existingByAuthId.id },
      data,
    })
  }

  const existingByEmail = await prisma.user.findUnique({
    where: { email: data.email },
  })

  if (existingByEmail) {
    if (!shouldUpdateApplicationUser(existingByEmail, data)) {
      return existingByEmail
    }

    return prisma.user.update({
      where: { id: existingByEmail.id },
      data,
    })
  }

  return prisma.user.create({ data })
}

export async function getDashboardAccessForSessionUser(
  sessionUser: AuthenticatedSessionUser,
) {
  const user = await ensureApplicationUserForSessionUser(sessionUser)
  const userWithRoles = await getUserRolesWithPermissions(user.id)
  const effectivePermissionKeys = getEffectivePermissionKeys(
    userWithRoles?.roles ?? [],
  )
  const canReadDashboard = hasPermission(
    effectivePermissionKeys,
    "dashboard",
    "read",
  )
  const isAdmin =
    userWithRoles?.roles.some(({ role }) => role.name === ADMIN_ROLE_NAME) ??
    false

  return {
    user,
    canReadDashboard,
    isAdmin,
    effectivePermissionKeys: [...effectivePermissionKeys],
  }
}

async function getUserRolesWithPermissions(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    include: {
      roles: {
        include: {
          role: {
            select: {
              name: true,
              permissions: {
                include: {
                  permission: {
                    select: {
                      section: true,
                      operation: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  })
}

export async function getUserEffectivePermissionKeys(userId: string) {
  const user = await getUserRolesWithPermissions(userId)

  return getEffectivePermissionKeys(user?.roles ?? [])
}

export async function userHasPermission(
  userId: string,
  section: AccessSection,
  operation: AccessOperation,
) {
  const effectivePermissions = await getUserEffectivePermissionKeys(userId)

  return hasPermission(effectivePermissions, section, operation)
}

export async function getUsersForManagement({
  actorUserId,
}: ManagementActorInput) {
  await requireUserPermission(actorUserId, "users", "read")

  return prisma.user.findMany({
    orderBy: [{ email: "asc" }],
    include: {
      roles: {
        include: {
          role: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          role: {
            name: "asc",
          },
        },
      },
    },
  })
}

export async function getUserForManagement({
  actorUserId,
  targetUserId,
}: ManagementActorInput & { targetUserId: string }) {
  await requireUserPermission(actorUserId, "users", "read")

  const [user, availableRoles] = await Promise.all([
    prisma.user.findUnique({
      where: { id: targetUserId },
      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
          orderBy: {
            role: {
              name: "asc",
            },
          },
        },
      },
    }),
    prisma.role.findMany({
      orderBy: [{ name: "asc" }],
      select: {
        id: true,
        name: true,
        description: true,
      },
    }),
  ])

  if (!user) {
    throw new Error("User not found")
  }

  return {
    user,
    availableRoles,
    effectivePermissionKeys: [
      ...getEffectivePermissionKeys(user.roles),
    ].sort(),
  }
}

export async function assignRoleToUser({
  actorUserId,
  targetUserId,
  roleId,
}: UserRoleMutationInput) {
  await requireUserPermission(actorUserId, "users", "write")

  return prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: targetUserId,
        roleId,
      },
    },
    update: {},
    create: {
      userId: targetUserId,
      roleId,
    },
  })
}

export async function removeRoleFromUser({
  actorUserId,
  targetUserId,
  roleId,
}: UserRoleMutationInput) {
  await requireUserPermission(actorUserId, "users", "write")

  return prisma.userRole.delete({
    where: {
      userId_roleId: {
        userId: targetUserId,
        roleId,
      },
    },
  })
}

export async function getRolesForManagement({
  actorUserId,
}: ManagementActorInput) {
  await requireUserPermission(actorUserId, "roles", "read")

  return prisma.role.findMany({
    orderBy: [{ name: "asc" }],
    include: {
      permissions: {
        include: {
          permission: true,
        },
        orderBy: {
          permission: {
            section: "asc",
          },
        },
      },
    },
  })
}

export async function getRoleForManagement({
  actorUserId,
  roleId,
}: ManagementActorInput & { roleId: string }) {
  await requireUserPermission(actorUserId, "roles", "read")

  const [role, permissions] = await Promise.all([
    prisma.role.findUnique({
      where: { id: roleId },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    }),
    prisma.permission.findMany({
      orderBy: [{ section: "asc" }, { operation: "asc" }],
    }),
  ])

  if (!role) {
    throw new Error("Role not found")
  }

  return {
    role,
    permissions,
    sections: ACCESS_SECTIONS,
  }
}

export async function createRoleForManagement({
  actorUserId,
  name,
  description,
  permissionIds = [],
}: RoleMutationInput) {
  await requireUserPermission(actorUserId, "roles", "write")

  const role = await prisma.role.create({
    data: {
      name: normalizeRequiredName(name),
      description: normalizeOptionalText(description),
    },
  })

  const uniquePermissionIds = getUniquePermissionIds(permissionIds)

  if (uniquePermissionIds.length > 0) {
    await prisma.rolePermission.createMany({
      data: uniquePermissionIds.map((permissionId) => ({
        roleId: role.id,
        permissionId,
      })),
      skipDuplicates: true,
    })
  }

  return role
}

export async function updateRoleForManagement({
  actorUserId,
  roleId,
  description,
  permissionIds,
}: RoleUpdateInput) {
  await requireUserPermission(actorUserId, "roles", "write")

  const role = await prisma.role.findUnique({
    where: { id: roleId },
    select: {
      id: true,
      isSystem: true,
    },
  })

  if (!role) {
    throw new Error("Role not found")
  }

  if (role.isSystem) {
    throw new Error("System roles cannot be edited")
  }

  await prisma.role.update({
    where: { id: role.id },
    data: {
      description: normalizeOptionalText(description),
    },
  })

  await prisma.rolePermission.deleteMany({
    where: { roleId: role.id },
  })

  const uniquePermissionIds = getUniquePermissionIds(permissionIds)

  if (uniquePermissionIds.length > 0) {
    await prisma.rolePermission.createMany({
      data: uniquePermissionIds.map((permissionId) => ({
        roleId: role.id,
        permissionId,
      })),
      skipDuplicates: true,
    })
  }
}
