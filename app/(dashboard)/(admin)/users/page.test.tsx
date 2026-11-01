// @vitest-environment jsdom

import { render, screen, within } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { UsersPageContent } from "@/app/(dashboard)/(admin)/users/page"
import { permissionKey } from "@/lib/access-control"

const requireCurrentApplicationAccessMock = vi.hoisted(() => vi.fn())
const getUsersForManagementMock = vi.hoisted(() => vi.fn())
const redirectMock = vi.hoisted(() => vi.fn())

vi.mock("@/app/(dashboard)/admin/_lib/current-application-user", () => ({
  requireCurrentApplicationAccess: requireCurrentApplicationAccessMock,
}))
vi.mock("@/lib/access-control/server", () => ({
  getUsersForManagement: getUsersForManagementMock,
}))
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

const users = [
  {
    id: "user-1",
    name: "Ana Rossi",
    email: "ana@acme.com",
    neonAuthId: "auth-1",
    roles: [{ role: { id: "role-1", name: "Technician" } }],
  },
  {
    id: "user-2",
    name: null,
    email: "luca@acme.com",
    neonAuthId: null,
    roles: [],
  },
]

function grant(keys: string[]) {
  requireCurrentApplicationAccessMock.mockResolvedValue({
    user: { id: "actor-1" },
    effectivePermissionKeys: keys,
  })
}

describe("UsersPageContent", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getUsersForManagementMock.mockResolvedValue(users)
  })

  it("redirects users with none of the users keys before the list is read", async () => {
    grant([])
    const redirectError = new Error("NEXT_REDIRECT")
    redirectMock.mockImplementation(() => {
      throw redirectError
    })

    await expect(UsersPageContent()).rejects.toBe(redirectError)
    expect(redirectMock).toHaveBeenCalledWith("/dashboard")
    expect(getUsersForManagementMock).not.toHaveBeenCalled()
  })

  it("opens the list for a write-only holder with the create control enabled", async () => {
    grant([WRITE])

    render(await UsersPageContent())

    expect(redirectMock).not.toHaveBeenCalled()
    expect(getUsersForManagementMock).toHaveBeenCalledWith({
      actorUserId: "actor-1",
    })
    const rows = screen.getAllByRole("article")
    expect(rows).toHaveLength(2)
    expect(within(rows[0]).getByText("Ana Rossi")).toBeInTheDocument()
    expect(within(rows[0]).getByText("Technician")).toBeInTheDocument()
    expect(within(rows[1]).getAllByText("luca@acme.com").length).toBeGreaterThan(0)
    const create = screen.getByRole("button", { name: "New User" })
    expect(create.tagName).toBe("A")
    expect(create).toHaveAttribute("href", "/users/new")
  })

  it("opens the list for a manage-only holder with the create control present but disabled", async () => {
    grant([MANAGE])

    render(await UsersPageContent())

    expect(redirectMock).not.toHaveBeenCalled()
    expect(screen.getByText("Ana Rossi")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "New User" })).toBeDisabled()
    expect(document.querySelector('a[href="/users/new"]')).toBeNull()
  })

  it("keeps the create control present but disabled for a read-only holder", async () => {
    grant([READ])

    render(await UsersPageContent())

    expect(screen.getByRole("button", { name: "New User" })).toBeDisabled()
    expect(screen.getByText("Ana Rossi")).toBeInTheDocument()
  })

  it("renders the Seeded marker for a user without a linked auth account", async () => {
    grant([READ])

    render(await UsersPageContent())

    expect(screen.getByText("Seeded")).toBeInTheDocument()
    expect(screen.getByText("Linked")).toBeInTheDocument()
  })
})
