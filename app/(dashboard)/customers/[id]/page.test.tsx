// @vitest-environment jsdom

import { fireEvent, render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { CustomerDetailContent } from "@/app/(dashboard)/customers/[id]/page"
import { permissionKey } from "@/lib/access-control"

const requireCurrentApplicationAccessMock = vi.hoisted(() => vi.fn())
const getCustomerByIdMock = vi.hoisted(() => vi.fn())
const redirectMock = vi.hoisted(() => vi.fn())
const notFoundMock = vi.hoisted(() => vi.fn())
const routerMock = vi.hoisted(() => ({ push: vi.fn(), refresh: vi.fn() }))
const searchParamsMock = vi.hoisted(() => ({ current: new URLSearchParams() }))
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
  useSearchParams: () => searchParamsMock.current,
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
  return CustomerDetailContent({
    params: Promise.resolve({ id }),
    searchParams: Promise.resolve(currentEditSearchParams()),
  })
}

function currentEditSearchParams(): { edit?: string } {
  const edit = searchParamsMock.current.get("edit")

  return edit === null ? {} : { edit }
}

function expectValueUnderLabel(label: string, value: string) {
  const labelElement = screen.getByText(label, { selector: "dt" })
  const row = labelElement.parentElement
  if (!row) throw new Error(`label ${label} has no row`)
  expect(row.querySelector("dd")).not.toBeNull()
  expect(within(row).getByText(value).closest("dd")).not.toBeNull()
  expect(labelElement.nextElementSibling?.tagName).toBe("DD")
}

function addressWithEdit(value: string) {
  searchParamsMock.current = new URLSearchParams({ edit: value })
}

describe("CustomerDetailContent", () => {
  beforeEach(() => {
    vi.resetAllMocks()
    searchParamsMock.current = new URLSearchParams()
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

  it("shows the six customer values each under its own visible label in the read-only view", async () => {
    grant([READ])

    render(await renderDetail("customer-1"))

    expectValueUnderLabel("Company", "Acme")
    expectValueUnderLabel("Name", "Ana Rossi")
    expectValueUnderLabel("Email", "ana@acme.com")
    expectValueUnderLabel("Status", "Active")
    expectValueUnderLabel("Phone", "555-0100")
    expectValueUnderLabel("Notes", "VIP account")
  })

  it("shows the fallback text under the Company, Email, Phone and Notes labels for missing values", async () => {
    grant([READ])
    getCustomerByIdMock.mockResolvedValue({
      ...activeCustomer,
      company: null,
      email: null,
      phone: null,
      notes: null,
    })

    render(await renderDetail("customer-1"))

    expect(screen.getByText("Company missing")).toBeInTheDocument()
    expect(screen.getByText("Email missing")).toBeInTheDocument()
    expect(screen.getByText("No phone")).toBeInTheDocument()
    expect(screen.getByText("No operational notes")).toBeInTheDocument()
  })

  it("opens the detail view for a write-only holder with both controls present but disabled", async () => {
    grant([WRITE])

    render(await renderDetail("customer-1"))

    expect(redirectMock).not.toHaveBeenCalled()
    expectValueUnderLabel("Company", "Acme")
    expect(screen.getByRole("button", { name: "Edit" })).toBeDisabled()
    expect(document.querySelector('a[href="/customers/customer-1?edit=true"]')).toBeNull()
    expect(screen.getByRole("button", { name: "Deactivate Customer" })).toBeDisabled()
    expect(screen.queryByLabelText("Company name *")).not.toBeInTheDocument()
  })

  it("opens the detail view for a manage-only holder with the edit control enabled", async () => {
    grant([MANAGE])

    render(await renderDetail("customer-1"))

    expect(redirectMock).not.toHaveBeenCalled()
    expectValueUnderLabel("Company", "Acme")
    const edit = screen.getByRole("button", { name: "Edit" })
    expect(edit.tagName).toBe("A")
    expect(edit).toHaveAttribute("href", "/customers/customer-1?edit=true")
    expect(screen.getByRole("button", { name: "Deactivate Customer" })).toBeEnabled()
  })

  it("shows the read-only view without the edit form when the address has no edit parameter", async () => {
    grant([READ])

    render(await renderDetail("customer-1"))

    expect(screen.queryByLabelText("Company name *")).not.toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Save Customer" })).not.toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Cancel" })).not.toBeInTheDocument()
  })

  it("shows the read-only view when the edit parameter is present with any value other than true", async () => {
    grant([READ, WRITE])
    addressWithEdit("false")

    render(await renderDetail("customer-1"))

    expect(screen.queryByLabelText("Company name *")).not.toBeInTheDocument()
    expect(screen.getByText("Ana Rossi")).toBeInTheDocument()
  })

  it("renders the Edit control disabled for users without customers:manage", async () => {
    grant([READ, WRITE])

    render(await renderDetail("customer-1"))

    expect(screen.getByRole("button", { name: "Edit" })).toBeDisabled()
    expect(document.querySelector('a[href="/customers/customer-1?edit=true"]')).toBeNull()
  })

  it("renders the Edit control as a link to the same customer with edit=true for users with customers:manage", async () => {
    grant([READ, WRITE, MANAGE])

    render(await renderDetail("customer-1"))

    const edit = screen.getByRole("button", { name: "Edit" })
    expect(edit.tagName).toBe("A")
    expect(edit).toHaveAttribute("href", "/customers/customer-1?edit=true")
    expect(screen.queryByLabelText("Company name *")).not.toBeInTheDocument()
  })

  it("redirects to the detail path without the edit parameter when write alone opens the edit address", async () => {
    grant([READ, WRITE])
    addressWithEdit("true")
    const redirectError = new Error("NEXT_REDIRECT")
    redirectMock.mockImplementation(() => {
      throw redirectError
    })

    await expect(renderDetail("customer-1")).rejects.toBe(redirectError)
    expect(redirectMock).toHaveBeenCalledWith("/customers/customer-1")
    expect(getCustomerByIdMock).not.toHaveBeenCalled()
  })

  it("renders the edit form with the stored values and the Cancel link when the address has edit=true", async () => {
    grant([READ, WRITE, MANAGE])
    addressWithEdit("true")

    render(await renderDetail("customer-1"))

    expect(screen.getByText("Edit Customer")).toBeInTheDocument()
    expect(screen.getByLabelText("Company name *")).toHaveValue("Acme")
    expect(screen.getByLabelText("Primary contact *")).toHaveValue("Ana Rossi")
    expect(screen.getByLabelText("Contact email *")).toHaveValue("ana@acme.com")
    expect(screen.getByRole("button", { name: "Save Customer" })).toBeEnabled()
    expect(screen.queryByRole("button", { name: "Edit" })).not.toBeInTheDocument()
  })

  it("renders a Cancel link to the path without the edit parameter in the edit view", async () => {
    grant([READ, WRITE, MANAGE])
    addressWithEdit("true")

    render(await renderDetail("customer-1"))

    const cancel = screen.getByRole("button", { name: "Cancel" })
    expect(cancel.tagName).toBe("A")
    expect(cancel).toHaveAttribute("href", "/customers/customer-1")
    expect(cancel).not.toHaveAttribute("type", "button")
  })

  it("returns to the read-only view through the save redirect after the form saves successfully", async () => {
    grant([READ, WRITE, MANAGE])
    addressWithEdit("true")
    actionsMock.updateCustomerAction.mockResolvedValue({ ok: true, customer: { id: "customer-1" } })
    const user = userEvent.setup()

    render(await renderDetail("customer-1"))
    await user.click(screen.getByRole("button", { name: "Save Customer" }))

    await waitFor(() => expect(routerMock.push).toHaveBeenCalledWith("/customers/customer-1"))
    expect(routerMock.refresh).toHaveBeenCalled()
    const formData = actionsMock.updateCustomerAction.mock.calls[0][0] as FormData
    expect(formData.get("customerId")).toBe("customer-1")
  })

  it("runs the duplicate lookup on blur in edit mode and never returns the customer being edited", async () => {
    grant([READ, WRITE, MANAGE])
    addressWithEdit("true")
    actionsMock.findDeactivatedMatchesAction.mockResolvedValue({
      ok: true,
      matches: [
        { id: "customer-1", company: "Acme", name: "Ana Rossi", email: "ana@acme.com" },
        { id: "customer-old", company: "Acme Old", name: "Old Contact", email: "old@acme.com" },
      ],
    })

    render(await renderDetail("customer-1"))
    fireEvent.blur(screen.getByLabelText("Company name *"))

    expect(await screen.findByText("Acme Old · Old Contact · old@acme.com")).toBeInTheDocument()
    expect(actionsMock.findDeactivatedMatchesAction).toHaveBeenCalledWith("Acme", "ana@acme.com")
    expect(screen.queryByText("Acme · Ana Rossi · ana@acme.com")).not.toBeInTheDocument()
    expect(screen.getAllByRole("button", { name: "Reactivate" })).toHaveLength(1)
  })

  it("still refreshes the route when the push after a successful save throws", async () => {
    grant([READ, WRITE, MANAGE])
    addressWithEdit("true")
    actionsMock.updateCustomerAction.mockResolvedValue({ ok: true, customer: { id: "customer-1" } })
    routerMock.push.mockImplementation(() => {
      throw new Error("push failed")
    })
    // The push error is rethrown by the finally block, as designed; it is observed here, not swallowed.
    const suppressRethrownPushError = (event: ErrorEvent) => event.preventDefault()
    window.addEventListener("error", suppressRethrownPushError)
    const user = userEvent.setup()

    try {
      render(await renderDetail("customer-1"))
      await user.click(screen.getByRole("button", { name: "Save Customer" }))

      await waitFor(() => expect(routerMock.refresh).toHaveBeenCalled())
      expect(routerMock.push).toHaveBeenCalledWith("/customers/customer-1")
    } finally {
      window.removeEventListener("error", suppressRethrownPushError)
    }
  })

  it("keeps the edit form open and shows the duplicate message without redirecting when the update is refused", async () => {
    grant([READ, WRITE, MANAGE])
    addressWithEdit("true")
    actionsMock.updateCustomerAction.mockResolvedValue({ ok: false, reason: "duplicate" })
    const user = userEvent.setup()

    render(await renderDetail("customer-1"))
    await user.click(screen.getByRole("button", { name: "Save Customer" }))

    expect(
      await screen.findByText("An active Customer already uses this company and email.")
    ).toBeInTheDocument()
    expect(screen.getByLabelText("Company name *")).toBeInTheDocument()
    expect(routerMock.push).not.toHaveBeenCalled()
  })

  it("shows the status control to users with customers:manage in both the read-only and the edit view", async () => {
    grant([READ, WRITE, MANAGE])

    const { unmount } = render(await renderDetail("customer-1"))
    expect(screen.getByRole("button", { name: "Deactivate Customer" })).toBeInTheDocument()
    unmount()

    addressWithEdit("true")
    render(await renderDetail("customer-1"))
    expect(screen.getByRole("button", { name: "Deactivate Customer" })).toBeInTheDocument()
  })

  it("renders the status control disabled for users without customers:manage", async () => {
    grant([READ, WRITE])

    render(await renderDetail("customer-1"))

    expect(screen.getByRole("button", { name: "Deactivate Customer" })).toBeDisabled()
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
