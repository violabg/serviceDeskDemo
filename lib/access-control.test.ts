import { beforeEach, describe, expect, it, vi } from "vitest"

import {
    ACCESS_OPERATIONS,
    ACCESS_SECTIONS,
    ADMIN_ROLE_NAME,
    INITIAL_PERMISSIONS,
    getDashboardAccessRedirectPath,
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
    create: vi.fn(),
    upsert: vi.fn(),
    update: vi.fn(),
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

  it("returns dashboard redirect paths for unauthenticated and unauthorized access", () => {
    expect(getDashboardAccessRedirectPath({ isAuthenticated: false })).toBe(
      "/login",
    )
    expect(
      getDashboardAccessRedirectPath({
        isAuthenticated: true,
        canReadDashboard: false,
      })
    ).toBe("/pending-access")
    expect(
      getDashboardAccessRedirectPath({
        isAuthenticated: true,
        canReadDashboard: true,
      }),
    ).toBeNull()
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

describe("first-login application user access", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("creates a local application user linked to the Neon Auth identity without roles", async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce(null)
    prismaMock.user.findUnique.mockResolvedValueOnce(null)
    prismaMock.user.create.mockResolvedValue({
      id: "user-local",
      neonAuthId: "neon-user-1",
      email: "new.user@example.com",
      name: "New User",
      image: "https://example.com/avatar.png",
    })

    const { ensureApplicationUserForSessionUser } = await import(
      "@/lib/access-control/server"
    )

    const user = await ensureApplicationUserForSessionUser({
      id: "neon-user-1",
      email: " New.User@Example.COM ",
      name: "New User",
      image: "https://example.com/avatar.png",
    })

    expect(user.id).toBe("user-local")
    expect(prismaMock.user.create).toHaveBeenCalledWith({
      data: {
        neonAuthId: "neon-user-1",
        email: "new.user@example.com",
        name: "New User",
        image: "https://example.com/avatar.png",
      },
    })
    expect(prismaMock.userRole.upsert).not.toHaveBeenCalled()
  })

  it("completes an existing email bootstrap user by attaching Neon Auth identity", async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce(null)
    prismaMock.user.findUnique.mockResolvedValueOnce({
      id: "seed-user",
      email: "admin@example.com",
      neonAuthId: null,
    })
    prismaMock.user.update.mockResolvedValue({
      id: "seed-user",
      neonAuthId: "neon-admin",
      email: "admin@example.com",
      name: "Admin User",
      image: null,
    })

    const { ensureApplicationUserForSessionUser } = await import(
      "@/lib/access-control/server"
    )

    await ensureApplicationUserForSessionUser({
      id: "neon-admin",
      email: "admin@example.com",
      name: "Admin User",
      image: null,
    })

    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { id: "seed-user" },
      data: {
        neonAuthId: "neon-admin",
        email: "admin@example.com",
        name: "Admin User",
        image: null,
      },
    })
  })

  it("denies dashboard access for a newly-created zero-role user", async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce(null)
    prismaMock.user.findUnique.mockResolvedValueOnce(null)
    prismaMock.user.create.mockResolvedValue({
      id: "user-zero-role",
      neonAuthId: "neon-user-2",
      email: "pending@example.com",
      name: "Pending User",
      image: null,
    })
    prismaMock.user.findUnique.mockResolvedValueOnce({
      roles: [],
    })

    const { getDashboardAccessForSessionUser } = await import(
      "@/lib/access-control/server"
    )

    const access = await getDashboardAccessForSessionUser({
      id: "neon-user-2",
      email: "pending@example.com",
      name: "Pending User",
      image: null,
    })

    expect(access.canReadDashboard).toBe(false)
    expect(access.isAdmin).toBe(false)
    expect(access.user.id).toBe("user-zero-role")
  })

  it("does not treat dashboard read permission as administrator access", async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce({
      id: "support-user",
      neonAuthId: "neon-support",
      email: "support@example.com",
      name: "Support User",
      image: null,
    })
    prismaMock.user.update.mockResolvedValue({
      id: "support-user",
      neonAuthId: "neon-support",
      email: "support@example.com",
      name: "Support User",
      image: null,
    })
    prismaMock.user.findUnique.mockResolvedValueOnce({
      roles: [
        {
          role: {
            name: "Support",
            permissions: [
              { permission: { section: "dashboard", operation: "read" } },
            ],
          },
        },
      ],
    })

    const { getDashboardAccessForSessionUser } = await import(
      "@/lib/access-control/server"
    )

    const access = await getDashboardAccessForSessionUser({
      id: "neon-support",
      email: "support@example.com",
      name: "Support User",
      image: null,
    })

    expect(access.canReadDashboard).toBe(true)
    expect(access.isAdmin).toBe(false)
  })

  it("allows site access for a seeded administrator", async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce({
      id: "admin-user",
      neonAuthId: "neon-admin",
      email: "admin@example.com",
      name: "Admin User",
      image: null,
    })
    prismaMock.user.update.mockResolvedValue({
      id: "admin-user",
      neonAuthId: "neon-admin",
      email: "admin@example.com",
      name: "Admin User",
      image: null,
    })
    prismaMock.user.findUnique.mockResolvedValueOnce({
      roles: [
        {
          role: {
            name: ADMIN_ROLE_NAME,
            permissions: [
              { permission: { section: "dashboard", operation: "read" } },
            ],
          },
        },
      ],
    })

    const { getDashboardAccessForSessionUser } = await import(
      "@/lib/access-control/server"
    )

    const access = await getDashboardAccessForSessionUser({
      id: "neon-admin",
      email: "admin@example.com",
      name: "Admin User",
      image: null,
    })

    expect(access.canReadDashboard).toBe(true)
    expect(access.isAdmin).toBe(true)
    expect(access.user.id).toBe("admin-user")
  })
})
