import {
  ADMIN_ROLE_NAME,
  INITIAL_PERMISSIONS,
  getEffectivePermissionKeys,
  hasPermission,
  type AccessOperation,
  type AccessSection,
} from "@/lib/access-control"
import { prisma } from "@/lib/prisma"

const ADMIN_ROLE_DESCRIPTION = "Full access to all service desk sections"

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

export async function bootstrapAccessControl(
  initialAdminEmail = process.env.INITIAL_ADMIN_EMAIL,
) {
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
    return prisma.user.update({
      where: { id: existingByAuthId.id },
      data,
    })
  }

  const existingByEmail = await prisma.user.findUnique({
    where: { email: data.email },
  })

  if (existingByEmail) {
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
