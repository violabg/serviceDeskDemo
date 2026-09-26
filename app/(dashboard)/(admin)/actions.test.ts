import { beforeEach, describe, expect, it, vi } from "vitest"

import {
  assignUserRoleAction,
  createRoleAction,
  removeUserRoleAction,
  updateRoleAction,
} from "@/app/(dashboard)/(admin)/actions"
import {
  adminRoleDetailTag,
  adminRolesListTag,
  adminUserDetailTag,
  adminUserRoleOptionsTag,
  adminUsersListTag,
} from "@/app/(dashboard)/admin/_lib/cache-tags"

const accessMock = vi.hoisted(() => vi.fn())
const adminServiceMock = vi.hoisted(() => ({
  assignRoleToUser: vi.fn(),
  createRoleForManagement: vi.fn(),
  removeRoleFromUser: vi.fn(),
  updateRoleForManagement: vi.fn(),
}))
const updateTagMock = vi.hoisted(() => vi.fn())
const redirectMock = vi.hoisted(() => vi.fn())

vi.mock("@/app/(dashboard)/admin/_lib/current-application-user", () => ({
  requireCurrentApplicationAccess: accessMock,
}))
vi.mock("@/lib/access-control/server", () => adminServiceMock)
vi.mock("next/cache", () => ({ updateTag: updateTagMock }))
vi.mock("next/navigation", () => ({ redirect: redirectMock }))

function makeFormData(
  values: Record<string, string>,
  permissionIds: string[] = []
) {
  const formData = new FormData()

  for (const [key, value] of Object.entries(values)) {
    formData.set(key, value)
  }

  for (const permissionId of permissionIds) {
    formData.append("permissionIds", permissionId)
  }

  return formData
}

describe("admin actions", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    accessMock.mockResolvedValue({ user: { id: "admin-user" } })
  })

  it("revalidates user detail and list views after role assignment", async () => {
    await assignUserRoleAction(
      makeFormData({ targetUserId: "user-2", roleId: "role-1" })
    )

    expect(adminServiceMock.assignRoleToUser).toHaveBeenCalledWith({
      actorUserId: "admin-user",
      targetUserId: "user-2",
      roleId: "role-1",
    })
    expect(updateTagMock).toHaveBeenCalledWith(adminUserDetailTag("user-2"))
    expect(updateTagMock).toHaveBeenCalledWith(adminUsersListTag())
    expect(updateTagMock).toHaveBeenCalledTimes(2)
  })

  it("revalidates user detail and list views after role removal", async () => {
    await removeUserRoleAction(
      makeFormData({ targetUserId: "user-2", roleId: "role-1" })
    )

    expect(adminServiceMock.removeRoleFromUser).toHaveBeenCalledWith({
      actorUserId: "admin-user",
      targetUserId: "user-2",
      roleId: "role-1",
    })
    expect(updateTagMock).toHaveBeenCalledWith(adminUserDetailTag("user-2"))
    expect(updateTagMock).toHaveBeenCalledWith(adminUsersListTag())
    expect(updateTagMock).toHaveBeenCalledTimes(2)
  })

  it("revalidates the role list and redirects after role creation", async () => {
    adminServiceMock.createRoleForManagement.mockResolvedValue({ id: "role-9" })

    await createRoleAction(
      makeFormData(
        { name: "Operators", description: "Help desk operators" },
        ["perm-1", "perm-2"]
      )
    )

    expect(adminServiceMock.createRoleForManagement).toHaveBeenCalledWith({
      actorUserId: "admin-user",
      name: "Operators",
      description: "Help desk operators",
      permissionIds: ["perm-1", "perm-2"],
    })
    expect(updateTagMock).toHaveBeenCalledWith(adminRolesListTag())
    expect(updateTagMock).toHaveBeenCalledWith(adminUserRoleOptionsTag())
    expect(updateTagMock).toHaveBeenCalledTimes(2)
    expect(redirectMock).toHaveBeenCalledWith("/roles/role-9")
  })

  it("revalidates the role list and detail after updates", async () => {
    await updateRoleAction(
      makeFormData(
        { roleId: "role-1", name: "Operators", description: "Updated role" },
        ["perm-1"]
      )
    )

    expect(adminServiceMock.updateRoleForManagement).toHaveBeenCalledWith({
      actorUserId: "admin-user",
      roleId: "role-1",
      name: "Operators",
      description: "Updated role",
      permissionIds: ["perm-1"],
    })
    expect(updateTagMock).toHaveBeenCalledWith(adminRolesListTag())
    expect(updateTagMock).toHaveBeenCalledWith(adminRoleDetailTag("role-1"))
    expect(updateTagMock).toHaveBeenCalledWith(adminUserRoleOptionsTag())
    expect(updateTagMock).toHaveBeenCalledTimes(3)
  })

  it("expires the same role list tag for writes by different administrators", async () => {
    adminServiceMock.createRoleForManagement.mockResolvedValue({ id: "role-9" })
    const formData = makeFormData({ name: "Operators" })

    await createRoleAction(formData)
    accessMock.mockResolvedValue({ user: { id: "admin-2" } })
    await createRoleAction(formData)

    expect(updateTagMock.mock.calls.map(([tag]) => tag)).toEqual([
      adminRolesListTag(),
      adminUserRoleOptionsTag(),
      adminRolesListTag(),
      adminUserRoleOptionsTag(),
    ])
  })
})