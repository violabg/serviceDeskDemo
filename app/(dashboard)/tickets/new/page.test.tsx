// @vitest-environment jsdom

import { render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { NewTicketPageContent } from "@/app/(dashboard)/tickets/new/page"
import { permissionKey } from "@/lib/access-control"

const requireCurrentApplicationAccessMock = vi.hoisted(() => vi.fn())
const getCustomersMock = vi.hoisted(() => vi.fn())
const getAssetsMock = vi.hoisted(() => vi.fn())
const getAvailableTechniciansMock = vi.hoisted(() => vi.fn())
const redirectMock = vi.hoisted(() => vi.fn())

vi.mock("@/app/(dashboard)/admin/_lib/current-application-user", () => ({
  requireCurrentApplicationAccess: requireCurrentApplicationAccessMock,
}))
vi.mock("@/lib/tickets/service", () => ({
  getCustomers: getCustomersMock,
  getAssets: getAssetsMock,
  getAvailableTechnicians: getAvailableTechniciansMock,
}))
vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}))
vi.mock("next/cache", () => ({
  cacheLife: vi.fn(),
  cacheTag: vi.fn(),
}))
vi.mock("@/app/(dashboard)/tickets/new/new-ticket-form", () => ({
  NewTicketForm: ({
    customers,
    assets,
    technicians,
  }: {
    customers: Array<unknown>
    assets: Array<unknown>
    technicians: Array<unknown>
  }) => (
    <div>
      Loaded form with {customers.length} customers, {assets.length} assets, and{" "}
      {technicians.length} technicians
    </div>
  ),
}))

describe("NewTicketPageContent", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("redirects users without tickets:read", async () => {
    const redirectError = new Error("NEXT_REDIRECT")
    requireCurrentApplicationAccessMock.mockResolvedValue({
      user: { id: "user-1" },
      effectivePermissionKeys: [],
    })
    redirectMock.mockImplementation(() => {
      throw redirectError
    })

    await expect(NewTicketPageContent()).rejects.toBe(redirectError)
    expect(redirectMock).toHaveBeenCalledWith("/dashboard")
  })

  it("renders a read-only notice without tickets:write", async () => {
    requireCurrentApplicationAccessMock.mockResolvedValue({
      user: { id: "user-1" },
      effectivePermissionKeys: [permissionKey("tickets", "read")],
    })

    render(await NewTicketPageContent())

    expect(
      screen.getByText(
        /read-only access\. you need tickets:write to create a new ticket\./i
      )
    ).toBeInTheDocument()
  })

  it("loads reference data and renders the form for writable users", async () => {
    requireCurrentApplicationAccessMock.mockResolvedValue({
      user: { id: "user-1" },
      effectivePermissionKeys: [
        permissionKey("tickets", "read"),
        permissionKey("tickets", "write"),
      ],
    })
    getCustomersMock.mockResolvedValue([{ id: "customer-1" }])
    getAssetsMock.mockResolvedValue([{ id: "asset-1" }])
    getAvailableTechniciansMock.mockResolvedValue([{ id: "tech-1" }])

    render(await NewTicketPageContent())

    expect(getCustomersMock).toHaveBeenCalledTimes(1)
    expect(getAssetsMock).toHaveBeenCalledTimes(1)
    expect(getAvailableTechniciansMock).toHaveBeenCalledTimes(1)
    expect(
      screen.getByText(
        "Loaded form with 1 customers, 1 assets, and 1 technicians"
      )
    ).toBeInTheDocument()
  })
})
