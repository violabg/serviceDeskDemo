// @vitest-environment jsdom

import { render, screen, within } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { CustomersPageContent } from "@/app/(dashboard)/customers/page"
import { permissionKey } from "@/lib/access-control"

const requireCurrentApplicationAccessMock = vi.hoisted(() => vi.fn())
const getCustomerListMock = vi.hoisted(() => vi.fn())
const redirectMock = vi.hoisted(() => vi.fn())

vi.mock("@/app/(dashboard)/admin/_lib/current-application-user", () => ({
  requireCurrentApplicationAccess: requireCurrentApplicationAccessMock,
}))
vi.mock("@/lib/customers/service", () => ({
  getCustomerList: getCustomerListMock,
}))
vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}))
vi.mock("next/cache", () => ({
  cacheLife: vi.fn(),
  cacheTag: vi.fn(),
}))

const READ = permissionKey("customers", "read")
const WRITE = permissionKey("customers", "write")

const customers = [
  { id: "customer-1", company: "Acme", name: "Ana Rossi", status: "Active", _count: { tickets: 2 } },
  { id: "customer-2", company: null, name: "Luca Bianchi", status: "Deactivated", _count: { tickets: 0 } },
]

function grant(keys: string[]) {
  requireCurrentApplicationAccessMock.mockResolvedValue({
    user: { id: "user-1" },
    effectivePermissionKeys: keys,
  })
}

function renderList(q?: string) {
  return CustomersPageContent({ searchParams: Promise.resolve({ q }) })
}

describe("CustomersPageContent", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getCustomerListMock.mockResolvedValue(customers)
  })

  it("redirects users without customers:read before any customer is read", async () => {
    grant([])
    const redirectError = new Error("NEXT_REDIRECT")
    redirectMock.mockImplementation(() => {
      throw redirectError
    })

    await expect(renderList()).rejects.toBe(redirectError)
    expect(redirectMock).toHaveBeenCalledWith("/dashboard")
    expect(getCustomerListMock).not.toHaveBeenCalled()
  })

  it("renders a search form with a q input above the table, submitted to /customers", async () => {
    grant([READ])

    const { container } = render(await renderList())

    const form = container.querySelector("form")
    expect(form).not.toBeNull()
    expect(form).toHaveAttribute("action", "/customers")
    expect(form).toHaveAttribute("method", "get")
    const input = screen.getByRole("textbox", { name: "Search customers" })
    expect(input).toHaveAttribute("name", "q")
    expect(form?.contains(input)).toBe(true)
    const table = screen.getByText("Primary contact").closest("section")
    expect(table).not.toBeNull()
    if (!form || !table) throw new Error("search form or table not rendered")
    expect(form.compareDocumentPosition(table) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it("shows the trimmed q value in the input and passes the trimmed term to the service", async () => {
    grant([READ])

    render(await renderList("  Acme  "))

    expect(getCustomerListMock).toHaveBeenCalledWith("Acme")
    expect(screen.getByRole("textbox", { name: "Search customers" })).toHaveValue("Acme")
  })

  it("passes an empty term to the service when no q is present", async () => {
    grant([READ])

    render(await renderList())

    expect(getCustomerListMock).toHaveBeenCalledWith("")
  })

  it("renders one row per customer, each with a View link to its details page", async () => {
    grant([READ])

    render(await renderList())

    const rows = screen.getAllByRole("article")
    expect(rows).toHaveLength(2)
    expect(within(rows[0]).getByText("Acme")).toBeInTheDocument()
    expect(within(rows[0]).getByText("Ana Rossi")).toBeInTheDocument()
    expect(within(rows[0]).getByText("Active")).toBeInTheDocument()
    const firstView = within(rows[0]).getByRole("button", { name: "View" })
    expect(firstView.tagName).toBe("A")
    expect(firstView).toHaveAttribute("href", "/customers/customer-1")
    expect(within(rows[1]).getByText("Company missing")).toBeInTheDocument()
    const secondView = within(rows[1]).getByRole("button", { name: "View" })
    expect(secondView.tagName).toBe("A")
    expect(secondView).toHaveAttribute("href", "/customers/customer-2")
  })

  it("shows the No Customers found. message when the term matches no customer", async () => {
    grant([READ])
    getCustomerListMock.mockResolvedValue([])

    render(await renderList("zzz-no-match"))

    expect(screen.getByText("No Customers found.")).toBeInTheDocument()
    expect(screen.queryAllByRole("article")).toHaveLength(0)
  })

  it("shows the New Customer link to /customers/new for users with customers:write", async () => {
    grant([READ, WRITE])

    render(await renderList())

    const newCustomer = screen.getByRole("button", { name: "New Customer" })
    expect(newCustomer.tagName).toBe("A")
    expect(newCustomer).toHaveAttribute("href", "/customers/new")
    expect(screen.queryByText("Read-only access.")).not.toBeInTheDocument()
  })

  it("shows a disabled New Customer button with no link and the read-only note for read-only users", async () => {
    grant([READ])

    render(await renderList())

    expect(screen.getByRole("button", { name: "New Customer" })).toBeDisabled()
    expect(screen.queryByRole("link", { name: "New Customer" })).not.toBeInTheDocument()
    expect(document.querySelector('a[href="/customers/new"]')).toBeNull()
    expect(screen.getByText("Read-only access.")).toBeInTheDocument()
  })

  it("propagates a service failure and renders no partial table", async () => {
    grant([READ])
    getCustomerListMock.mockRejectedValue(new Error("query failed"))

    await expect(renderList()).rejects.toThrow("query failed")
  })
})
