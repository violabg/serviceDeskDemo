// @vitest-environment jsdom

import * as React from "react"

import { render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { RolesPageContent } from "@/app/(dashboard)/(admin)/roles/page"
import { permissionKey } from "@/lib/access-control"

const requireCurrentApplicationAccessMock = vi.hoisted(() => vi.fn())
const getRolesForManagementMock = vi.hoisted(() => vi.fn())
const permissionFindManyMock = vi.hoisted(() => vi.fn())
const redirectMock = vi.hoisted(() => vi.fn())
const createRoleActionMock = vi.hoisted(() => vi.fn())

vi.mock("@/app/(dashboard)/admin/_lib/current-application-user", () => ({
  requireCurrentApplicationAccess: requireCurrentApplicationAccessMock,
}))
vi.mock("@/lib/access-control/server", () => ({
  getRolesForManagement: getRolesForManagementMock,
}))
vi.mock("@/lib/prisma", () => ({
  prisma: { permission: { findMany: permissionFindManyMock } },
}))
vi.mock("@/app/(dashboard)/(admin)/actions", () => ({
  createRoleAction: createRoleActionMock,
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

const roles = [
  {
    id: "role-1",
    name: "Technician",
    description: "Handles tickets",
    isSystem: false,
    permissions: [
      { permission: { section: "tickets", operation: "read" } },
    ],
  },
  {
    id: "role-admin",
    name: "Admin",
    description: "Full access",
    isSystem: true,
    permissions: [],
  },
]

const permissions = [
  { id: "permission-tickets-read", section: "tickets", operation: "read" },
  { id: "permission-users-write", section: "users", operation: "write" },
]

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

async function renderRolesPage() {
  const content = await RolesPageContent()

  return render(await resolveAsyncTree(content) as React.ReactElement)
}

describe("RolesPageContent", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getRolesForManagementMock.mockResolvedValue(roles)
    permissionFindManyMock.mockResolvedValue(permissions)
  })

  it("redirects users with none of the roles keys before the list is read", async () => {
    grant([])
    const redirectError = new Error("NEXT_REDIRECT")
    redirectMock.mockImplementation(() => {
      throw redirectError
    })

    await expect(RolesPageContent()).rejects.toBe(redirectError)
    expect(redirectMock).toHaveBeenCalledWith("/dashboard")
    expect(getRolesForManagementMock).not.toHaveBeenCalled()
  })

  it("opens the list for a write-only holder with the create-role form enabled", async () => {
    grant([WRITE])

    await renderRolesPage()

    expect(redirectMock).not.toHaveBeenCalled()
    expect(getRolesForManagementMock).toHaveBeenCalledWith({
      actorUserId: "actor-1",
    })
    expect(screen.getByText("Technician")).toBeInTheDocument()
    expect(screen.getByLabelText("Name *")).toBeEnabled()
    expect(screen.getByLabelText("Description")).toBeEnabled()
    expect(screen.getByRole("button", { name: "Create Role" })).toBeEnabled()
  })

  it("opens the list for a manage-only holder with the create-role form present but disabled", async () => {
    grant([MANAGE])

    await renderRolesPage()

    expect(redirectMock).not.toHaveBeenCalled()
    expect(screen.getByText("Technician")).toBeInTheDocument()
    expect(screen.getByLabelText("Name *")).toBeDisabled()
    expect(screen.getByLabelText("Description")).toBeDisabled()
    expect(screen.getByRole("button", { name: "Create Role" })).toBeDisabled()
  })

  it("keeps the create-role form present but disabled for a read-only holder", async () => {
    grant([READ])

    await renderRolesPage()

    expect(screen.getByLabelText("Name *")).toBeDisabled()
    expect(screen.getByRole("button", { name: "Create Role" })).toBeDisabled()
  })

  it("renders the permission checkboxes and the System badge of the role list", async () => {
    grant([READ])

    await renderRolesPage()

    const checkbox = document.getElementById(
      "create-role-permission-permission-tickets-read"
    )
    expect(checkbox).not.toBeNull()
    expect(checkbox).toBeDisabled()
    expect(screen.getAllByText(permissionKey("tickets", "read")).length).toBeGreaterThan(0)
    expect(screen.getByText("System")).toBeInTheDocument()
  })
})
