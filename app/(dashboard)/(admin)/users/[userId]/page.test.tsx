// @vitest-environment jsdom

import * as React from "react"

import { render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { UserDetailPageContent } from "@/app/(dashboard)/(admin)/users/[userId]/page"
import { permissionKey } from "@/lib/access-control"

const requireCurrentApplicationAccessMock = vi.hoisted(() => vi.fn())
const getUserForManagementMock = vi.hoisted(() => vi.fn())
const redirectMock = vi.hoisted(() => vi.fn())
const actionsMock = vi.hoisted(() => ({
  assignUserRoleAction: vi.fn(),
  removeUserRoleAction: vi.fn(),
}))

vi.mock("@/app/(dashboard)/admin/_lib/current-application-user", () => ({
  requireCurrentApplicationAccess: requireCurrentApplicationAccessMock,
}))
vi.mock("@/lib/access-control/server", () => ({
  getUserForManagement: getUserForManagementMock,
}))
vi.mock("@/app/(dashboard)/(admin)/actions", () => actionsMock)
vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}))
vi.mock("next/cache", () => ({
  cacheLife: vi.fn(),
  cacheTag: vi.fn(),
}))

const READ = permissionKey("users", "read")
const WRITE = permissionKey("users", "write")
const MANAGE = permissionKey("users", "manage")

const detail = {
  user: {
    id: "target-user",
    name: "Ana Rossi",
    email: "ana@acme.com",
    neonAuthId: "auth-1",
    roles: [
      {
        roleId: "role-1",
        role: {
          id: "role-1",
          name: "Technician",
          permissions: [{ permission: { section: "tickets", operation: "read" } }],
        },
      },
    ],
  },
  availableRoles: [{ id: "role-manager", name: "Manager", description: null }],
  effectivePermissionKeys: [permissionKey("tickets", "read")],
}

function grant(keys: string[]) {
  requireCurrentApplicationAccessMock.mockResolvedValue({
    user: { id: "actor-1" },
    effectivePermissionKeys: keys,
  })
}

/**
 * Resolves the async server components the detail page nests inside its content
 * component, so the page output can be rendered in jsdom.
 */
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

async function renderDetail(userId = "target-user") {
  const content = await UserDetailPageContent({
    params: Promise.resolve({ userId }),
  })

  return render(await resolveAsyncTree(content) as React.ReactElement)
}

describe("UserDetailPageContent", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getUserForManagementMock.mockResolvedValue(detail)
  })

  it("redirects users with none of the users keys before the user is read", async () => {
    grant([])
    const redirectError = new Error("NEXT_REDIRECT")
    redirectMock.mockImplementation(() => {
      throw redirectError
    })

    await expect(
      UserDetailPageContent({ params: Promise.resolve({ userId: "target-user" }) })
    ).rejects.toBe(redirectError)
    expect(redirectMock).toHaveBeenCalledWith("/dashboard")
    expect(getUserForManagementMock).not.toHaveBeenCalled()
  })

  it("opens the detail view for a write-only holder with the role controls present but disabled", async () => {
    grant([WRITE])

    await renderDetail()

    expect(redirectMock).not.toHaveBeenCalled()
    expect(getUserForManagementMock).toHaveBeenCalledWith({
      actorUserId: "actor-1",
      targetUserId: "target-user",
    })
    expect(
      screen.getByRole("heading", { name: "Ana Rossi" })
    ).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Remove" })).toBeDisabled()
    expect(screen.getByRole("button", { name: "Assign Role" })).toBeDisabled()
    for (const control of screen.getAllByRole("combobox")) {
      expect(control).toBeDisabled()
    }
    expect(screen.getByText("Read-only access")).toBeInTheDocument()
  })

  it("opens the detail view for a manage-only holder with the role controls enabled", async () => {
    grant([MANAGE])

    await renderDetail()

    expect(redirectMock).not.toHaveBeenCalled()
    expect(
      screen.getByRole("heading", { name: "Ana Rossi" })
    ).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Remove" })).toBeEnabled()
    expect(screen.getByRole("button", { name: "Assign Role" })).toBeEnabled()
    for (const control of screen.getAllByRole("combobox")) {
      expect(control).toBeEnabled()
    }
    expect(screen.queryByText("Read-only access")).not.toBeInTheDocument()
  })

  it("keeps the role controls present but disabled for a read-only holder", async () => {
    grant([READ])

    await renderDetail()

    expect(screen.getByRole("button", { name: "Remove" })).toBeDisabled()
    expect(screen.getByRole("button", { name: "Assign Role" })).toBeDisabled()
    expect(screen.getByRole("button", { name: "Remove" })).toBeInTheDocument()
  })

  it("lists the effective permission keys of the target user", async () => {
    grant([READ])

    await renderDetail()

    expect(screen.getByText(permissionKey("tickets", "read"))).toBeInTheDocument()
  })
})
