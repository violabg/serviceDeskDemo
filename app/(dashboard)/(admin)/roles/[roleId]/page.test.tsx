// @vitest-environment jsdom

import * as React from "react"

import { render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { RoleDetailPageContent } from "@/app/(dashboard)/(admin)/roles/[roleId]/page"
import { permissionKey } from "@/lib/access-control"

const requireCurrentApplicationAccessMock = vi.hoisted(() => vi.fn())
const getRoleForManagementMock = vi.hoisted(() => vi.fn())
const redirectMock = vi.hoisted(() => vi.fn())
const updateRoleActionMock = vi.hoisted(() => vi.fn())

vi.mock("@/app/(dashboard)/admin/_lib/current-application-user", () => ({
  requireCurrentApplicationAccess: requireCurrentApplicationAccessMock,
}))
vi.mock("@/lib/access-control/server", () => ({
  getRoleForManagement: getRoleForManagementMock,
}))
vi.mock("@/app/(dashboard)/(admin)/actions", () => ({
  updateRoleAction: updateRoleActionMock,
}))
vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}))
vi.mock("next/cache", () => ({
  cacheLife: vi.fn(),
  cacheTag: vi.fn(),
}))

const READ = permissionKey("roles", "read")
const WRITE = permissionKey("roles", "write")
const MANAGE = permissionKey("roles", "manage")

const permissions = [
  { id: "permission-tickets-read", section: "tickets", operation: "read" },
  { id: "permission-users-write", section: "users", operation: "write" },
]

function detailFor(isSystem: boolean) {
  return {
    role: {
      id: "role-1",
      name: "Editor",
      description: "Edits records",
      isSystem,
      permissions: [{ permissionId: "permission-tickets-read" }],
    },
    permissions,
    sections: ["dashboard", "users", "roles", "tickets", "customers"],
  }
}

function grant(keys: string[]) {
  requireCurrentApplicationAccessMock.mockResolvedValue({
    user: { id: "actor-1" },
    effectivePermissionKeys: keys,
  })
}

async function resolveAsyncTree(node: React.ReactNode): Promise<React.ReactNode> {
  if (Array.isArray(node)) {
    return Promise.all(node.map((child) => resolveAsyncTree(child)))
  }

  if (!React.isValidElement(node)) {
    return node
  }

  const element = node as React.ReactElement<{ children?: React.ReactNode }>
  const children = await resolveAsyncTree(element.props.children)
  const props = { ...element.props, children }

  if (
    typeof element.type === "function" &&
    element.type.constructor.name === "AsyncFunction"
  ) {
    const AsyncComponent = element.type as unknown as (
      props: Record<string, unknown>
    ) => Promise<React.ReactNode>

    return resolveAsyncTree(await AsyncComponent(props))
  }

  return React.cloneElement(element, props)
}

async function renderDetail(roleId = "role-1") {
  const content = await RoleDetailPageContent({
    params: Promise.resolve({ roleId }),
  })

  return render(await resolveAsyncTree(content) as React.ReactElement)
}

describe("RoleDetailPageContent", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getRoleForManagementMock.mockResolvedValue(detailFor(false))
  })

  it("redirects users with none of the roles keys before the role is read", async () => {
    grant([])
    const redirectError = new Error("NEXT_REDIRECT")
    redirectMock.mockImplementation(() => {
      throw redirectError
    })

    await expect(
      RoleDetailPageContent({ params: Promise.resolve({ roleId: "role-1" }) })
    ).rejects.toBe(redirectError)
    expect(redirectMock).toHaveBeenCalledWith("/dashboard")
    expect(getRoleForManagementMock).not.toHaveBeenCalled()
  })

  it("opens the detail view for a write-only holder with the save control present but disabled", async () => {
    grant([WRITE])

    await renderDetail()

    expect(redirectMock).not.toHaveBeenCalled()
    expect(getRoleForManagementMock).toHaveBeenCalledWith({
      actorUserId: "actor-1",
      roleId: "role-1",
    })
    expect(screen.getByRole("heading", { name: "Editor" })).toBeInTheDocument()
    expect(screen.getByLabelText("Description")).toBeDisabled()
    expect(screen.getByRole("button", { name: "Save Role" })).toBeDisabled()
    expect(
      document.getElementById("role-permission-permission-tickets-read")
    ).toBeDisabled()
  })

  it("opens the detail view for a manage-only holder with the save control enabled", async () => {
    grant([MANAGE])

    await renderDetail()

    expect(redirectMock).not.toHaveBeenCalled()
    expect(screen.getByRole("heading", { name: "Editor" })).toBeInTheDocument()
    expect(screen.getByLabelText("Description")).toBeEnabled()
    expect(screen.getByRole("button", { name: "Save Role" })).toBeEnabled()
    expect(
      document.getElementById("role-permission-permission-tickets-read")
    ).toBeEnabled()
  })

  it("keeps the save control present but disabled for a read-only holder", async () => {
    grant([READ])

    await renderDetail()

    expect(screen.getByRole("button", { name: "Save Role" })).toBeDisabled()
    expect(screen.getByLabelText("Description")).toBeDisabled()
  })

  it("keeps the save control disabled for a system role even with roles:manage", async () => {
    grant([MANAGE])
    getRoleForManagementMock.mockResolvedValue(detailFor(true))

    await renderDetail()

    expect(screen.getByRole("button", { name: "Save Role" })).toBeDisabled()
  })
})
