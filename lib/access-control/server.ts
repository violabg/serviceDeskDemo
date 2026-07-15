import { prisma } from "@/lib/prisma"
import {
  ADMIN_ROLE_NAME,
  INITIAL_PERMISSIONS,
  getEffectivePermissionKeys,
  hasPermission,
  type AccessOperation,
  type AccessSection,
} from "@/lib/access-control"

const ADMIN_ROLE_DESCRIPTION = "Full access to all service desk sections"

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

  const adminRole = await prisma.role.upsert({
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
  })

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

  const normalizedEmail = initialAdminEmail?.trim().toLowerCase()
  const adminUser = normalizedEmail
    ? await prisma.user.upsert({
        where: { email: normalizedEmail },
        update: {},
        create: { email: normalizedEmail },
      })
    : null

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

export async function getUserEffectivePermissionKeys(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      roles: {
        include: {
          role: {
            include: {
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
