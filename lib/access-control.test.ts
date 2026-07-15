import { beforeEach, describe, expect, it, vi } from "vitest"

import {
  ACCESS_OPERATIONS,
  ACCESS_SECTIONS,
  ADMIN_ROLE_NAME,
  INITIAL_PERMISSIONS,
  getEffectivePermissionKeys,
  hasPermission,
  permissionKey,
} from "@/lib/access-control"

const prismaMock = vi.hoisted(() => ({
  permission: {
    upsert: vi.fn(),
  },
  role: {
    upsert: vi.fn(),
  },
  rolePermission: {
    upsert: vi.fn(),
  },
  user: {
    upsert: vi.fn(),
    findUnique: vi.fn(),
  },
  userRole: {
    upsert: vi.fn(),
  },
}))

vi.mock("@/lib/prisma", () => ({
  prisma: prismaMock,
}))

describe("access-control permissions", () => {
  it("creates structured permissions for every initial section and operation", () => {
    expect(INITIAL_PERMISSIONS).toHaveLength(
      ACCESS_SECTIONS.length * ACCESS_OPERATIONS.length,
    )
    expect(INITIAL_PERMISSIONS).toContainEqual({
      section: "users",
      operation: "read",
      description: "read access for users",
    })
    expect(INITIAL_PERMISSIONS).toContainEqual({
      section: "dashboard",
      operation: "manage",
      description: "manage access for dashboard",
    })
  })

  it("computes effective permissions as an allow-only union of roles", () => {
    const permissions = getEffectivePermissionKeys([
      {
        role: {
          permissions: [
            { permission: { section: "tickets", operation: "read" } },
            { permission: { section: "tickets", operation: "write" } },
          ],
        },
      },
      {
        role: {
          permissions: [
            { permission: { section: "reports", operation: "read" } },
            { permission: { section: "tickets", operation: "read" } },
          ],
        },
      },
    ])

    expect(permissions).toEqual(
      new Set([
        permissionKey("tickets", "read"),
        permissionKey("tickets", "write"),
        permissionKey("reports", "read"),
      ]),
    )
    expect(hasPermission(permissions, "tickets", "read")).toBe(true)
    expect(hasPermission(permissions, "tickets", "manage")).toBe(false)
  })
})

describe("bootstrapAccessControl", () => {
  beforeEach(() => {
    vi.clearAllMocks()

    prismaMock.permission.upsert.mockImplementation(async ({ create }) => ({
      id: permissionKey(create.section, create.operation),
      ...create,
    }))
    prismaMock.role.upsert.mockResolvedValue({
      id: "role-admin",
      name: ADMIN_ROLE_NAME,
      description: "Full access to all service desk sections",
      isSystem: true,
    })
    prismaMock.rolePermission.upsert.mockResolvedValue({})
    prismaMock.user.upsert.mockResolvedValue({
      id: "user-admin",
      email: "admin@example.com",
    })
    prismaMock.userRole.upsert.mockResolvedValue({})
  })

  it("creates base permissions, admin role, and assigns initial admin", async () => {
    const { bootstrapAccessControl } = await import(
      "@/lib/access-control/server"
    )

    const result = await bootstrapAccessControl(" Admin@Example.COM ")

    expect(result.permissionCount).toBe(INITIAL_PERMISSIONS.length)
    expect(result.adminRole.name).toBe(ADMIN_ROLE_NAME)
    expect(result.adminUser?.email).toBe("admin@example.com")
    expect(prismaMock.permission.upsert).toHaveBeenCalledTimes(
      INITIAL_PERMISSIONS.length,
    )
    expect(prismaMock.rolePermission.upsert).toHaveBeenCalledTimes(
      INITIAL_PERMISSIONS.length,
    )
    expect(prismaMock.user.upsert).toHaveBeenCalledWith({
      where: { email: "admin@example.com" },
      update: {},
      create: { email: "admin@example.com" },
    })
    expect(prismaMock.userRole.upsert).toHaveBeenCalledWith({
      where: {
        userId_roleId: {
          userId: "user-admin",
          roleId: "role-admin",
        },
      },
      update: {},
      create: {
        userId: "user-admin",
        roleId: "role-admin",
      },
    })
  })

  it("does not assign an initial admin when email is missing", async () => {
    const { bootstrapAccessControl } = await import(
      "@/lib/access-control/server"
    )

    const result = await bootstrapAccessControl("")

    expect(result.adminUser).toBeNull()
    expect(prismaMock.user.upsert).not.toHaveBeenCalled()
    expect(prismaMock.userRole.upsert).not.toHaveBeenCalled()
  })
})
