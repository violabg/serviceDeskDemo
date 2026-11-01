// @vitest-environment jsdom

import { render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { NewTicketPageContent } from "@/app/(dashboard)/tickets/new/page"
import { permissionKey } from "@/lib/access-control"

const requireCurrentApplicationAccessMock = vi.hoisted(() => vi.fn())
const getActiveCustomersMock = vi.hoisted(() => vi.fn())
const getAssetsMock = vi.hoisted(() => vi.fn())
const getAvailableTechniciansMock = vi.hoisted(() => vi.fn())
const redirectMock = vi.hoisted(() => vi.fn())

vi.mock("@/app/(dashboard)/admin/_lib/current-application-user", () => ({
  requireCurrentApplicationAccess: requireCurrentApplicationAccessMock,
}))
vi.mock("@/lib/tickets/service", () => ({
  getActiveCustomers: getActiveCustomersMock,
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

  it("redirects users with none of the ticket keys to /dashboard", async () => {
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

  it("redirects a read-only holder to /dashboard instead of rendering a panel", async () => {
    const redirectError = new Error("NEXT_REDIRECT")
    requireCurrentApplicationAccessMock.mockResolvedValue({
      user: { id: "user-1" },
      effectivePermissionKeys: [permissionKey("tickets", "read")],
    })
    redirectMock.mockImplementation(() => {
      throw redirectError
    })

    await expect(NewTicketPageContent()).rejects.toBe(redirectError)
    expect(redirectMock).toHaveBeenCalledWith("/dashboard")
    expect(getActiveCustomersMock).not.toHaveBeenCalled()
  })

  it("loads reference data and renders the form for a write-only holder", async () => {
    requireCurrentApplicationAccessMock.mockResolvedValue({
      user: { id: "user-1" },
      effectivePermissionKeys: [permissionKey("tickets", "write")],
    })
    getActiveCustomersMock.mockResolvedValue([{ id: "customer-1" }])
    getAssetsMock.mockResolvedValue([{ id: "asset-1" }])
    getAvailableTechniciansMock.mockResolvedValue([{ id: "tech-1" }])

    render(await NewTicketPageContent())

    expect(getActiveCustomersMock).toHaveBeenCalledTimes(1)
    expect(
      screen.getByText(
        "Loaded form with 1 customers, 1 assets, and 1 technicians"
      )
    ).toBeInTheDocument()
  })

  it("redirects a manage-only holder to /dashboard because the new page requires tickets:write", async () => {
    const redirectError = new Error("NEXT_REDIRECT")
    requireCurrentApplicationAccessMock.mockResolvedValue({
      user: { id: "user-1" },
      effectivePermissionKeys: [permissionKey("tickets", "manage")],
    })
    redirectMock.mockImplementation(() => {
      throw redirectError
    })

    await expect(NewTicketPageContent()).rejects.toBe(redirectError)
    expect(redirectMock).toHaveBeenCalledWith("/dashboard")
    expect(getActiveCustomersMock).not.toHaveBeenCalled()
  })

  it("loads reference data and renders the form for writable users", async () => {
    requireCurrentApplicationAccessMock.mockResolvedValue({
      user: { id: "user-1" },
      effectivePermissionKeys: [
        permissionKey("tickets", "read"),
        permissionKey("tickets", "write"),
      ],
    })
    getActiveCustomersMock.mockResolvedValue([{ id: "customer-1" }])
    getAssetsMock.mockResolvedValue([{ id: "asset-1" }])
    getAvailableTechniciansMock.mockResolvedValue([{ id: "tech-1" }])

    render(await NewTicketPageContent())

    expect(getActiveCustomersMock).toHaveBeenCalledTimes(1)
    expect(getAssetsMock).toHaveBeenCalledTimes(1)
    expect(getAvailableTechniciansMock).toHaveBeenCalledTimes(1)
    expect(
      screen.getByText(
        "Loaded form with 1 customers, 1 assets, and 1 technicians"
      )
    ).toBeInTheDocument()
  })
})
