// @vitest-environment jsdom

import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"

import NewUserPage, { NewUserPageContent } from "@/app/(dashboard)/(admin)/users/new/page"
import { permissionKey } from "@/lib/access-control"

const requireCurrentApplicationAccessMock = vi.hoisted(() => vi.fn())
const redirectMock = vi.hoisted(() => vi.fn())
const createUserActionMock = vi.hoisted(() => vi.fn())

vi.mock("@/app/(dashboard)/admin/_lib/current-application-user", () => ({
  requireCurrentApplicationAccess: requireCurrentApplicationAccessMock,
}))
vi.mock("@/app/(dashboard)/(admin)/actions", () => ({
  createUserAction: createUserActionMock,
}))
vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}))

const READ = permissionKey("users", "read")
const WRITE = permissionKey("users", "write")
const MANAGE = permissionKey("users", "manage")

function grant(keys: string[]) {
  requireCurrentApplicationAccessMock.mockResolvedValue({
    user: { id: "actor-1" },
    effectivePermissionKeys: keys,
  })
}

function throwingRedirect() {
  const redirectError = new Error("NEXT_REDIRECT")
  redirectMock.mockImplementation(() => {
    throw redirectError
  })

  return redirectError
}

describe("NewUserPageContent", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("redirects users with none of the users keys to /dashboard", async () => {
    grant([])
    const redirectError = throwingRedirect()

    await expect(NewUserPageContent()).rejects.toBe(redirectError)
    expect(redirectMock).toHaveBeenCalledWith("/dashboard")
  })

  it("redirects a read-only holder to /dashboard without rendering the form", async () => {
    grant([READ])
    const redirectError = throwingRedirect()

    await expect(NewUserPageContent()).rejects.toBe(redirectError)
    expect(redirectMock).toHaveBeenCalledWith("/dashboard")
    expect(screen.queryByLabelText("Email *")).not.toBeInTheDocument()
  })

  it("redirects a manage-only holder to /dashboard because creation needs users:write", async () => {
    grant([MANAGE])
    const redirectError = throwingRedirect()

    await expect(NewUserPageContent()).rejects.toBe(redirectError)
    expect(redirectMock).toHaveBeenCalledWith("/dashboard")
  })

  it("renders the create form for a write-only holder without redirecting", async () => {
    grant([WRITE])

    render(await NewUserPageContent())

    expect(redirectMock).not.toHaveBeenCalled()
    expect(screen.getByRole("textbox", { name: "Name" })).toBeInTheDocument()
    expect(screen.getByLabelText("Email *")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Create User" })).toBeEnabled()
  })

  it("renders the heading and skeleton of the route shell", () => {
    render(<NewUserPage />)

    expect(screen.getByRole("heading", { name: "New User" })).toBeInTheDocument()
    expect(document.querySelector('[data-slot="skeleton"]')).not.toBeNull()
  })

  it("shows the duplicate email as a field-level message instead of a silent no-op", async () => {
    grant([WRITE])
    createUserActionMock.mockResolvedValue({ ok: false, reason: "duplicate" })
    const user = userEvent.setup()

    render(await NewUserPageContent())
    await user.type(screen.getByLabelText("Email *"), "ana@acme.com")
    await user.click(screen.getByRole("button", { name: "Create User" }))

    expect(
      await screen.findByText("An application user already uses this email")
    ).toBeInTheDocument()
    await waitFor(() =>
      expect(createUserActionMock).toHaveBeenCalledTimes(1)
    )
    const formData = createUserActionMock.mock.calls[0][0] as FormData
    expect(formData.get("email")).toBe("ana@acme.com")
  })
})
