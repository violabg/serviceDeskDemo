import { beforeEach, describe, expect, it, vi } from "vitest"

import {
    ACCESS_OPERATIONS,
    ACCESS_SECTIONS,
    ADMIN_ROLE_NAME,
    INITIAL_PERMISSIONS,
    getDashboardAccessRedirectPath,
    getEffectivePermissionKeys,
    hasAnySectionPermission,
    hasPermission,
    permissionKey,
} from "@/lib/access-control"

const prismaMock = vi.hoisted(() => ({
  permission: {
    upsert: vi.fn(),
    deleteMany: vi.fn(),
    findMany: vi.fn(),
  },
  role: {
    upsert: vi.fn(),
    create: vi.fn(),
    findMany: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  rolePermission: {
    upsert: vi.fn(),
    deleteMany: vi.fn(),
    createMany: vi.fn(),
  },
  user: {
    create: vi.fn(),
    upsert: vi.fn(),
    update: vi.fn(),
    findUnique: vi.fn(),
    findMany: vi.fn(),
  },
  userRole: {
    upsert: vi.fn(),
    delete: vi.fn(),
  },
}))

vi.mock("@/lib/prisma", () => ({
  prisma: prismaMock,
}))

describe("access-control permissions", () => {
  it("includes tickets as a managed access section", () => {
    expect(ACCESS_SECTIONS).toContain("tickets")
  })

  it("generates tickets read/write/manage permissions", () => {
    const ticketPermissions = INITIAL_PERMISSIONS.filter(
      (permission) => permission.section === "tickets"
    )

    expect(ticketPermissions.map((permission) => permission.operation)).toEqual(
      expect.arrayContaining(["read", "write", "manage"])
    )
  })

  it("creates structured permissions for every initial section and operation", () => {
    expect(INITIAL_PERMISSIONS).toHaveLength(
      ACCESS_SECTIONS.length * ACCESS_OPERATIONS.length
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
    expect(INITIAL_PERMISSIONS).toContainEqual({
      section: "tickets",
      operation: "read",
      description: "read access for tickets",
    })
  })

  it("computes effective permissions as an allow-only union of roles", () => {
    const permissions = getEffectivePermissionKeys([
      {
        role: {
          permissions: [
            { permission: { section: "users", operation: "read" } },
            { permission: { section: "users", operation: "write" } },
          ],
        },
      },
      {
        role: {
          permissions: [
            { permission: { section: "roles", operation: "read" } },
            { permission: { section: "users", operation: "read" } },
          ],
        },
      },
    ])

    expect(permissions).toEqual(
      new Set([
        permissionKey("users", "read"),
        permissionKey("users", "write"),
        permissionKey("roles", "read"),
      ])
    )
    expect(hasPermission(permissions, "users", "read")).toBe(true)
    expect(hasPermission(permissions, "users", "manage")).toBe(false)
  })

  it("treats any one of read, write, or manage as section visibility", () => {
    expect(
      hasAnySectionPermission(
        new Set([permissionKey("dashboard", "read")]),
        "dashboard"
      )
    ).toBe(true)
    expect(
      hasAnySectionPermission(
        new Set([permissionKey("dashboard", "write")]),
        "dashboard"
      )
    ).toBe(true)
    expect(
      hasAnySectionPermission(
        new Set([permissionKey("dashboard", "manage")]),
        "dashboard"
      )
    ).toBe(true)
  })

  it("does not treat another section grant as dashboard visibility", () => {
    expect(
      hasAnySectionPermission(
        new Set([permissionKey("users", "write")]),
        "dashboard"
      )
    ).toBe(false)
    expect(hasAnySectionPermission(new Set(), "dashboard")).toBe(false)
  })

  it("keeps effective keys exact when only dashboard write or manage is granted", () => {
    const writeKeys = getEffectivePermissionKeys([
      {
        role: {
          permissions: [
            { permission: { section: "dashboard", operation: "write" } },
          ],
        },
      },
    ])
    const manageKeys = getEffectivePermissionKeys([
      {
        role: {
          permissions: [
            { permission: { section: "dashboard", operation: "manage" } },
          ],
        },
      },
    ])

    expect(writeKeys).toEqual(new Set([permissionKey("dashboard", "write")]))
    expect(writeKeys.has(permissionKey("dashboard", "read"))).toBe(false)
    expect(manageKeys).toEqual(new Set([permissionKey("dashboard", "manage")]))
    expect(manageKeys.has(permissionKey("dashboard", "read"))).toBe(false)
  })

  it("returns dashboard redirect paths for unauthenticated and unauthorized access", () => {
    expect(getDashboardAccessRedirectPath({ isAuthenticated: false })).toBe(
      "/login"
    )
    expect(
      getDashboardAccessRedirectPath({
        isAuthenticated: true,
        canAccessDashboard: false,
      })
    ).toBe("/pending-access")
    expect(
      getDashboardAccessRedirectPath({
        isAuthenticated: true,
        canAccessDashboard: true,
      })
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
      description: "Full access to dashboard, users, and roles",
      isSystem: true,
    })
    prismaMock.permission.deleteMany.mockResolvedValue({ count: 0 })
    prismaMock.rolePermission.upsert.mockResolvedValue({})
    prismaMock.user.upsert.mockResolvedValue({
      id: "user-admin",
      email: "admin@example.com",
    })
    prismaMock.userRole.upsert.mockResolvedValue({})
  })

  it("creates base permissions, admin role, and assigns initial admin", async () => {
    const { bootstrapAccessControl } =
      await import("@/lib/access-control/server")

    const result = await bootstrapAccessControl(" Admin@Example.COM ")

    expect(result.permissionCount).toBe(INITIAL_PERMISSIONS.length)
    expect(result.adminRole.name).toBe(ADMIN_ROLE_NAME)
    expect(result.adminUser?.email).toBe("admin@example.com")
    expect(prismaMock.permission.upsert).toHaveBeenCalledTimes(
      INITIAL_PERMISSIONS.length
    )
    expect(prismaMock.rolePermission.upsert).toHaveBeenCalledTimes(
      INITIAL_PERMISSIONS.length
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
    const { bootstrapAccessControl } =
      await import("@/lib/access-control/server")

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

    const { ensureApplicationUserForSessionUser } =
      await import("@/lib/access-control/server")

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

    const { ensureApplicationUserForSessionUser } =
      await import("@/lib/access-control/server")

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

    const { getDashboardAccessForSessionUser } =
      await import("@/lib/access-control/server")

    const access = await getDashboardAccessForSessionUser({
      id: "neon-user-2",
      email: "pending@example.com",
      name: "Pending User",
      image: null,
    })

    expect(access.canAccessDashboard).toBe(false)
    expect(access.isAdmin).toBe(false)
    expect(access.user.id).toBe("user-zero-role")
  })

  it("allows dashboard access for a user holding only dashboard write", async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce({
      id: "writer-user",
      neonAuthId: "neon-writer",
      email: "writer@example.com",
      name: "Writer User",
      image: null,
    })
    prismaMock.user.findUnique.mockResolvedValueOnce({
      roles: [
        {
          role: {
            name: "Writer",
            permissions: [
              { permission: { section: "dashboard", operation: "write" } },
            ],
          },
        },
      ],
    })

    const { getDashboardAccessForSessionUser } =
      await import("@/lib/access-control/server")

    const access = await getDashboardAccessForSessionUser({
      id: "neon-writer",
      email: "writer@example.com",
      name: "Writer User",
      image: null,
    })

    expect(access.canAccessDashboard).toBe(true)
    expect(access.effectivePermissionKeys).toEqual([
      permissionKey("dashboard", "write"),
    ])
    expect(access.isAdmin).toBe(false)
  })

  it("allows dashboard access for a user holding only dashboard manage", async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce({
      id: "manager-user",
      neonAuthId: "neon-manager",
      email: "manager@example.com",
      name: "Manager User",
      image: null,
    })
    prismaMock.user.findUnique.mockResolvedValueOnce({
      roles: [
        {
          role: {
            name: "Manager",
            permissions: [
              { permission: { section: "dashboard", operation: "manage" } },
            ],
          },
        },
      ],
    })

    const { getDashboardAccessForSessionUser } =
      await import("@/lib/access-control/server")

    const access = await getDashboardAccessForSessionUser({
      id: "neon-manager",
      email: "manager@example.com",
      name: "Manager User",
      image: null,
    })

    expect(access.canAccessDashboard).toBe(true)
    expect(access.effectivePermissionKeys).toEqual([
      permissionKey("dashboard", "manage"),
    ])
    expect(access.isAdmin).toBe(false)
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

    const { getDashboardAccessForSessionUser } =
      await import("@/lib/access-control/server")

    const access = await getDashboardAccessForSessionUser({
      id: "neon-support",
      email: "support@example.com",
      name: "Support User",
      image: null,
    })

    expect(access.canAccessDashboard).toBe(true)
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

    const { getDashboardAccessForSessionUser } =
      await import("@/lib/access-control/server")

    const access = await getDashboardAccessForSessionUser({
      id: "neon-admin",
      email: "admin@example.com",
      name: "Admin User",
      image: null,
    })

    expect(access.canAccessDashboard).toBe(true)
    expect(access.isAdmin).toBe(true)
    expect(access.user.id).toBe("admin-user")
  })
})

describe("management mutations", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("returns management detail with effective permission keys for readable users", async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce({
      roles: [
        {
          role: {
            permissions: [
              { permission: { section: "users", operation: "read" } },
            ],
          },
        },
      ],
    })
    prismaMock.user.findUnique.mockResolvedValueOnce({
      id: "target-user",
      email: "target@example.com",
      roles: [
        {
          role: {
            name: "Technician",
            permissions: [
              { permission: { section: "tickets", operation: "read" } },
              { permission: { section: "tickets", operation: "write" } },
            ],
          },
        },
      ],
    })
    prismaMock.role.findMany.mockResolvedValue([
      { id: "role-technician", name: "Technician", description: "Handles tickets" },
    ])

    const { getUserForManagement } = await import("@/lib/access-control/server")

    const result = await getUserForManagement({
      actorUserId: "actor-manager",
      targetUserId: "target-user",
    })

    expect(result.user.id).toBe("target-user")
    expect(result.availableRoles).toEqual([
      { id: "role-technician", name: "Technician", description: "Handles tickets" },
    ])
    expect(result.effectivePermissionKeys).toEqual([
      permissionKey("tickets", "read"),
      permissionKey("tickets", "write"),
    ])
  })

  it("reads the users list when the actor holds users write only", async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce({
      roles: [
        {
          role: {
            permissions: [
              { permission: { section: "users", operation: "write" } },
            ],
          },
        },
      ],
    })
    prismaMock.user.findMany.mockResolvedValue([
      { id: "user-1", email: "one@example.com" },
    ])

    const { getUsersForManagement } = await import("@/lib/access-control/server")

    const users = await getUsersForManagement({ actorUserId: "actor-writer" })

    expect(users).toEqual([{ id: "user-1", email: "one@example.com" }])
  })

  it("reads the users list when the actor holds users manage only", async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce({
      roles: [
        {
          role: {
            permissions: [
              { permission: { section: "users", operation: "manage" } },
            ],
          },
        },
      ],
    })
    prismaMock.user.findMany.mockResolvedValue([
      { id: "user-1", email: "one@example.com" },
    ])

    const { getUsersForManagement } = await import("@/lib/access-control/server")

    const users = await getUsersForManagement({ actorUserId: "actor-manager" })

    expect(users).toEqual([{ id: "user-1", email: "one@example.com" }])
  })

  it("refuses the users list when the actor holds none of the users keys", async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce({ roles: [] })

    const { getUsersForManagement } = await import("@/lib/access-control/server")

    await expect(
      getUsersForManagement({ actorUserId: "actor-without-users" })
    ).rejects.toThrow(
      "Missing permission: any of users:read, users:write, users:manage"
    )
    expect(prismaMock.user.findMany).not.toHaveBeenCalled()
  })

  it("reads the roles list when the actor holds roles write only", async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce({
      roles: [
        {
          role: {
            permissions: [
              { permission: { section: "roles", operation: "write" } },
            ],
          },
        },
      ],
    })
    prismaMock.role.findMany.mockResolvedValue([{ id: "role-1", name: "Editor" }])

    const { getRolesForManagement } = await import("@/lib/access-control/server")

    const roles = await getRolesForManagement({ actorUserId: "actor-writer" })

    expect(roles).toEqual([{ id: "role-1", name: "Editor" }])
  })

  it("reads the roles list when the actor holds roles manage only", async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce({
      roles: [
        {
          role: {
            permissions: [
              { permission: { section: "roles", operation: "manage" } },
            ],
          },
        },
      ],
    })
    prismaMock.role.findMany.mockResolvedValue([{ id: "role-1", name: "Editor" }])

    const { getRolesForManagement } = await import("@/lib/access-control/server")

    const roles = await getRolesForManagement({ actorUserId: "actor-manager" })

    expect(roles).toEqual([{ id: "role-1", name: "Editor" }])
  })

  it("refuses the roles list when the actor holds none of the roles keys", async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce({ roles: [] })

    const { getRolesForManagement } = await import("@/lib/access-control/server")

    await expect(
      getRolesForManagement({ actorUserId: "actor-without-roles" })
    ).rejects.toThrow(
      "Missing permission: any of roles:read, roles:write, roles:manage"
    )
    expect(prismaMock.role.findMany).not.toHaveBeenCalled()
  })

  it("reads a role detail when the actor holds roles manage only", async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce({
      roles: [
        {
          role: {
            permissions: [
              { permission: { section: "roles", operation: "manage" } },
            ],
          },
        },
      ],
    })
    prismaMock.role.findUnique.mockResolvedValue({
      id: "role-1",
      name: "Editor",
      permissions: [],
    })
    prismaMock.permission.findMany.mockResolvedValue([])

    const { getRoleForManagement } = await import("@/lib/access-control/server")

    const result = await getRoleForManagement({
      actorUserId: "actor-manager",
      roleId: "role-1",
    })

    expect(result.role.id).toBe("role-1")
    expect(result.sections).toEqual(ACCESS_SECTIONS)
  })

  it("requires users write permission before creating a user", async () => {
    prismaMock.user.findUnique.mockResolvedValue({ roles: [] })

    const { createUserForManagement } =
      await import("@/lib/access-control/server")

    await expect(
      createUserForManagement({
        actorUserId: "actor-without-users",
        name: "New User",
        email: "new@example.com",
      })
    ).rejects.toThrow("Missing permission: users:write")
    expect(prismaMock.user.create).not.toHaveBeenCalled()
  })

  it("creates a user with the normalized email when the actor holds users write", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      roles: [
        {
          role: {
            permissions: [
              { permission: { section: "users", operation: "write" } },
            ],
          },
        },
      ],
    })
    prismaMock.user.create.mockResolvedValue({
      id: "user-new",
      email: "new@example.com",
      name: "New User",
    })

    const { createUserForManagement } =
      await import("@/lib/access-control/server")

    const user = await createUserForManagement({
      actorUserId: "actor-writer",
      name: "New User",
      email: "  New@Example.com  ",
    })

    expect(user.id).toBe("user-new")
    expect(prismaMock.user.create).toHaveBeenCalledWith({
      data: { email: "new@example.com", name: "New User" },
    })
  })

  it("requires users manage permission before assigning a role", async () => {
    prismaMock.user.findUnique.mockResolvedValue({ roles: [] })

    const { assignRoleToUser } = await import("@/lib/access-control/server")

    await expect(
      assignRoleToUser({
        actorUserId: "actor-read-only",
        targetUserId: "target-user",
        roleId: "role-technician",
      })
    ).rejects.toThrow("Missing permission: users:manage")
    expect(prismaMock.userRole.upsert).not.toHaveBeenCalled()
  })

  it("assigns an existing role when the actor has users manage permission", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      roles: [
        {
          role: {
            permissions: [
              { permission: { section: "users", operation: "manage" } },
            ],
          },
        },
      ],
    })
    prismaMock.userRole.upsert.mockResolvedValue({})

    const { assignRoleToUser } = await import("@/lib/access-control/server")

    await assignRoleToUser({
      actorUserId: "actor-admin",
      targetUserId: "target-user",
      roleId: "role-technician",
    })

    expect(prismaMock.userRole.upsert).toHaveBeenCalledWith({
      where: {
        userId_roleId: {
          userId: "target-user",
          roleId: "role-technician",
        },
      },
      update: {},
      create: {
        userId: "target-user",
        roleId: "role-technician",
      },
    })
  })

  it("requires roles write permission before creating a role", async () => {
    prismaMock.user.findUnique.mockResolvedValue({ roles: [] })

    const { createRoleForManagement } =
      await import("@/lib/access-control/server")

    await expect(
      createRoleForManagement({
        actorUserId: "actor-read-only",
        name: "User Manager",
        description: "Can read users",
        permissionIds: ["permission-users-read"],
      })
    ).rejects.toThrow("Missing permission: roles:write")
    expect(prismaMock.role.create).not.toHaveBeenCalled()
  })

  it("creates a role with seeded permissions when authorized", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      roles: [
        {
          role: {
            permissions: [
              { permission: { section: "roles", operation: "write" } },
            ],
          },
        },
      ],
    })
    prismaMock.role.create.mockResolvedValue({
      id: "role-user-manager",
      name: "User Manager",
    })
    prismaMock.rolePermission.createMany.mockResolvedValue({ count: 1 })

    const { createRoleForManagement } =
      await import("@/lib/access-control/server")

    await createRoleForManagement({
      actorUserId: "actor-admin",
      name: "User Manager",
      description: "Can read users",
      permissionIds: ["permission-users-read", "permission-users-read"],
    })

    expect(prismaMock.role.create).toHaveBeenCalledWith({
      data: {
        name: "User Manager",
        description: "Can read users",
      },
    })
    expect(prismaMock.rolePermission.createMany).toHaveBeenCalledWith({
      data: [
        {
          roleId: "role-user-manager",
          permissionId: "permission-users-read",
        },
      ],
      skipDuplicates: true,
    })
  })

  it("replaces role permissions for non-system roles when authorized", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      roles: [
        {
          role: {
            permissions: [
              { permission: { section: "roles", operation: "manage" } },
            ],
          },
        },
      ],
    })
    prismaMock.role.findUnique.mockResolvedValue({
      id: "role-user-manager",
      isSystem: false,
    })
    prismaMock.role.update.mockResolvedValue({})
    prismaMock.rolePermission.deleteMany.mockResolvedValue({ count: 2 })
    prismaMock.rolePermission.createMany.mockResolvedValue({ count: 2 })

    const { updateRoleForManagement } =
      await import("@/lib/access-control/server")

    await updateRoleForManagement({
      actorUserId: "actor-admin",
      roleId: "role-user-manager",
      name: "User Manager",
      description: "Can read users",
      permissionIds: ["permission-users-read", "permission-dashboard-read"],
    })

    expect(prismaMock.role.update).toHaveBeenCalledWith({
      where: { id: "role-user-manager" },
      data: {
        description: "Can read users",
      },
    })
    expect(prismaMock.rolePermission.deleteMany).toHaveBeenCalledWith({
      where: { roleId: "role-user-manager" },
    })
    expect(prismaMock.rolePermission.createMany).toHaveBeenCalledWith({
      data: [
        {
          roleId: "role-user-manager",
          permissionId: "permission-users-read",
        },
        {
          roleId: "role-user-manager",
          permissionId: "permission-dashboard-read",
        },
      ],
      skipDuplicates: true,
    })
  })

  it("blocks edits to system roles", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      roles: [
        {
          role: {
            permissions: [
              { permission: { section: "roles", operation: "manage" } },
            ],
          },
        },
      ],
    })
    prismaMock.role.findUnique.mockResolvedValue({
      id: "role-admin",
      isSystem: true,
    })

    const { updateRoleForManagement } = await import("@/lib/access-control/server")

    await expect(
      updateRoleForManagement({
        actorUserId: "actor-admin",
        roleId: "role-admin",
        name: "Administrator",
        description: "Core role",
        permissionIds: ["permission-dashboard-read"],
      })
    ).rejects.toThrow("System roles cannot be edited")
    expect(prismaMock.role.update).not.toHaveBeenCalled()
  })
})
