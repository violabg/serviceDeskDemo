// @vitest-environment jsdom

import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { CustomerDetailContent } from "@/app/(dashboard)/customers/[id]/page"
import { permissionKey } from "@/lib/access-control"

const requireCurrentApplicationAccessMock = vi.hoisted(() => vi.fn())
const getCustomerByIdMock = vi.hoisted(() => vi.fn())
const redirectMock = vi.hoisted(() => vi.fn())
const notFoundMock = vi.hoisted(() => vi.fn())
const routerMock = vi.hoisted(() => ({ push: vi.fn(), refresh: vi.fn() }))
const actionsMock = vi.hoisted(() => ({
  createCustomerAction: vi.fn(),
  updateCustomerAction: vi.fn(),
  changeCustomerStatusAction: vi.fn(),
  findDeactivatedMatchesAction: vi.fn(),
}))

vi.mock("@/app/(dashboard)/admin/_lib/current-application-user", () => ({
  requireCurrentApplicationAccess: requireCurrentApplicationAccessMock,
}))
vi.mock("@/lib/customers/service", () => ({
  getCustomerById: getCustomerByIdMock,
}))
vi.mock("@/app/(dashboard)/customers/actions", () => actionsMock)
vi.mock("next/navigation", () => ({
  redirect: redirectMock,
  notFound: notFoundMock,
  useRouter: () => routerMock,
}))
vi.mock("next/cache", () => ({
  cacheLife: vi.fn(),
  cacheTag: vi.fn(),
}))

const READ = permissionKey("customers", "read")
const WRITE = permissionKey("customers", "write")
const MANAGE = permissionKey("customers", "manage")

function grant(keys: string[]) {
  requireCurrentApplicationAccessMock.mockResolvedValue({
    user: { id: "user-1" },
    effectivePermissionKeys: keys,
  })
}

const activeCustomer = {
  id: "customer-1",
  company: "Acme",
  name: "Ana Rossi",
  email: "ana@acme.com",
  phone: "555-0100",
  notes: "VIP account",
  status: "Active",
  tickets: [
    { id: "ticket-2", title: "Printer outage", status: "Open", priority: "High" },
    { id: "ticket-1", title: "VPN issue", status: "Closed", priority: "Low" },
  ],
}

function renderDetail(id: string) {
  return CustomerDetailContent({ params: Promise.resolve({ id }) })
}

describe("CustomerDetailContent", () => {
  beforeEach(() => {
    vi.resetAllMocks()
    getCustomerByIdMock.mockResolvedValue(activeCustomer)
  })

  it("redirects users without customers:read to /dashboard before reading the customer", async () => {
    grant([])
    const redirectError = new Error("NEXT_REDIRECT")
    redirectMock.mockImplementation(() => {
      throw redirectError
    })

    await expect(renderDetail("customer-1")).rejects.toBe(redirectError)
    expect(redirectMock).toHaveBeenCalledWith("/dashboard")
    expect(getCustomerByIdMock).not.toHaveBeenCalled()
  })

  it("calls notFound for an id with no customer and renders no detail", async () => {
    grant([READ, WRITE, MANAGE])
    getCustomerByIdMock.mockResolvedValue(null)
    const notFoundError = new Error("NEXT_NOT_FOUND")
    notFoundMock.mockImplementation(() => {
      throw notFoundError
    })

    await expect(renderDetail("missing")).rejects.toBe(notFoundError)
    expect(getCustomerByIdMock).toHaveBeenCalledWith("missing")
    expect(notFoundMock).toHaveBeenCalledTimes(1)
  })

  it("shows the customer information read-only first, without the edit form", async () => {
    grant([READ])

    render(await renderDetail("customer-1"))

    expect(screen.getByRole("heading", { name: "Acme" })).toBeInTheDocument()
    expect(screen.getByText("Ana Rossi · ana@acme.com · Active")).toBeInTheDocument()
    expect(screen.getByText("555-0100")).toBeInTheDocument()
    expect(screen.getByText("VIP account")).toBeInTheDocument()
    expect(screen.queryByLabelText("Company name *")).not.toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Save Customer" })).not.toBeInTheDocument()
  })

  it("shows no Edit action for users without customers:write", async () => {
    grant([READ])

    render(await renderDetail("customer-1"))

    expect(screen.queryByRole("button", { name: "Edit" })).not.toBeInTheDocument()
  })

  it("shows the Edit action for users with customers:write and renders the edit form in place only after Edit", async () => {
    grant([READ, WRITE])
    const user = userEvent.setup()

    render(await renderDetail("customer-1"))

    expect(screen.queryByLabelText("Company name *")).not.toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Edit" }))

    expect(screen.getByLabelText("Company name *")).toHaveValue("Acme")
    expect(screen.getByLabelText("Primary contact *")).toHaveValue("Ana Rossi")
    expect(screen.getByRole("button", { name: "Save Customer" })).toBeEnabled()
    expect(screen.queryByRole("button", { name: "Edit" })).not.toBeInTheDocument()
  })

  it("returns the information section to read-only after the edit form saves successfully", async () => {
    grant([READ, WRITE])
    actionsMock.updateCustomerAction.mockResolvedValue({ ok: true, customer: { id: "customer-1" } })
    const user = userEvent.setup()

    render(await renderDetail("customer-1"))
    await user.click(screen.getByRole("button", { name: "Edit" }))
    await user.click(screen.getByRole("button", { name: "Save Customer" }))

    await waitFor(() => expect(screen.queryByLabelText("Company name *")).not.toBeInTheDocument())
    expect(screen.getByRole("button", { name: "Edit" })).toBeInTheDocument()
    expect(routerMock.refresh).toHaveBeenCalled()
    const formData = actionsMock.updateCustomerAction.mock.calls[0][0] as FormData
    expect(formData.get("customerId")).toBe("customer-1")
  })

  it("keeps the edit form open and shows the duplicate message when the update is refused", async () => {
    grant([READ, WRITE])
    actionsMock.updateCustomerAction.mockResolvedValue({ ok: false, reason: "duplicate" })
    const user = userEvent.setup()

    render(await renderDetail("customer-1"))
    await user.click(screen.getByRole("button", { name: "Edit" }))
    await user.click(screen.getByRole("button", { name: "Save Customer" }))

    expect(
      await screen.findByText("An active Customer already uses this company and email.")
    ).toBeInTheDocument()
    expect(screen.getByLabelText("Company name *")).toBeInTheDocument()
  })

  it("shows the status control to users with customers:manage in both the read-only and the editing state", async () => {
    grant([READ, WRITE, MANAGE])
    const user = userEvent.setup()

    render(await renderDetail("customer-1"))

    expect(screen.getByRole("button", { name: "Deactivate Customer" })).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Edit" }))
    expect(screen.getByRole("button", { name: "Deactivate Customer" })).toBeInTheDocument()
  })

  it("does not render the status control for users without customers:manage", async () => {
    grant([READ, WRITE])

    render(await renderDetail("customer-1"))

    expect(screen.queryByRole("button", { name: "Deactivate Customer" })).not.toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Reactivate Customer" })).not.toBeInTheDocument()
  })

  it("deactivates an Active customer through changeCustomerStatusAction and refreshes the page", async () => {
    grant([READ, MANAGE])
    actionsMock.changeCustomerStatusAction.mockResolvedValue({ ok: true })
    const user = userEvent.setup()

    render(await renderDetail("customer-1"))
    await user.click(screen.getByRole("button", { name: "Deactivate Customer" }))

    await waitFor(() => expect(routerMock.refresh).toHaveBeenCalled())
    const formData = actionsMock.changeCustomerStatusAction.mock.calls[0][0] as FormData
    expect(formData.get("customerId")).toBe("customer-1")
    expect(formData.get("action")).toBe("deactivate")
  })

  it("shows the Critical-ticket message when deactivation is refused and keeps the customer Active", async () => {
    grant([READ, MANAGE])
    actionsMock.changeCustomerStatusAction.mockResolvedValue({ ok: false, reason: "critical-ticket" })
    const user = userEvent.setup()

    render(await renderDetail("customer-1"))
    await user.click(screen.getByRole("button", { name: "Deactivate Customer" }))

    expect(
      await screen.findByText("Resolve or close all Critical Tickets before deactivating this Customer.")
    ).toBeInTheDocument()
    expect(routerMock.refresh).not.toHaveBeenCalled()
  })

  it("lists the related tickets newest first, each as a link to its ticket route", async () => {
    grant([READ])

    render(await renderDetail("customer-1"))

    const ticketsSection = screen.getByRole("heading", { name: "Tickets" }).closest("section")
    expect(ticketsSection).not.toBeNull()
    const links = Array.from((ticketsSection as HTMLElement).querySelectorAll("a"))
    expect(links).toHaveLength(2)
    expect(links[0]).toHaveAttribute("href", "/tickets/ticket-2")
    expect(links[0]).toHaveTextContent("Printer outage · Open · High")
    expect(links[1]).toHaveAttribute("href", "/tickets/ticket-1")
    expect(links[1]).toHaveTextContent("VPN issue · Closed · Low")
  })

  it("propagates a failure of the customer query and renders no partial page", async () => {
    grant([READ])
    getCustomerByIdMock.mockRejectedValue(new Error("query failed"))

    await expect(renderDetail("customer-1")).rejects.toThrow("query failed")
  })
})
