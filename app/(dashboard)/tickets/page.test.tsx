// @vitest-environment jsdom

import { render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { TicketsPageContent } from "@/app/(dashboard)/tickets/page"
import { permissionKey } from "@/lib/access-control"

const requireCurrentApplicationAccessMock = vi.hoisted(() => vi.fn())
const getTicketListMock = vi.hoisted(() => vi.fn())
const getCustomerListMock = vi.hoisted(() => vi.fn())
const redirectMock = vi.hoisted(() => vi.fn())
const routerMock = vi.hoisted(() => ({
  push: vi.fn(),
  replace: vi.fn(),
  refresh: vi.fn(),
}))

vi.mock("@/app/(dashboard)/admin/_lib/current-application-user", () => ({
  requireCurrentApplicationAccess: requireCurrentApplicationAccessMock,
}))
vi.mock("@/lib/tickets/service", () => ({
  getTicketList: getTicketListMock,
  isTicketStatus: (value: string) =>
    ["Open", "InProgress", "Pending", "Resolved", "Closed"].includes(value),
  isTicketPriority: (value: string) =>
    ["Low", "Medium", "High", "Critical"].includes(value),
}))
vi.mock("@/lib/customers/service", () => ({
  getCustomerList: getCustomerListMock,
}))
vi.mock("next/navigation", () => ({
  redirect: redirectMock,
  useRouter: () => routerMock,
}))
vi.mock("next/cache", () => ({
  cacheLife: vi.fn(),
  cacheTag: vi.fn(),
}))

const WRITE = permissionKey("tickets", "write")
const MANAGE = permissionKey("tickets", "manage")

const listPage = {
  items: [
    {
      id: "ticket-1",
      title: "Printer outage",
      status: "Open",
      priority: "High",
      isSlaBreached: false,
      customer: { company: "Acme", name: "Ana Rossi", status: "Active" },
    },
  ],
  page: 1,
  total: 1,
}

function grant(keys: string[]) {
  requireCurrentApplicationAccessMock.mockResolvedValue({
    user: { id: "user-1" },
    effectivePermissionKeys: keys,
  })
}

function renderList(searchParams: Record<string, string> = {}) {
  return TicketsPageContent({ searchParams: Promise.resolve(searchParams) })
}

describe("TicketsPageContent", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getTicketListMock.mockResolvedValue(listPage)
    getCustomerListMock.mockResolvedValue([
      { id: "customer-1", name: "Ana Rossi", company: "Acme", status: "Active" },
    ])
  })

  it("redirects users with none of the tickets keys before the list is read", async () => {
    grant([])
    const redirectError = new Error("NEXT_REDIRECT")
    redirectMock.mockImplementation(() => {
      throw redirectError
    })

    await expect(renderList()).rejects.toBe(redirectError)
    expect(redirectMock).toHaveBeenCalledWith("/dashboard")
    expect(getTicketListMock).not.toHaveBeenCalled()
  })

  it("opens the list for a write-only holder with the create control enabled", async () => {
    grant([WRITE])

    render(await renderList())

    expect(redirectMock).not.toHaveBeenCalled()
    expect(screen.getByText("Printer outage")).toBeInTheDocument()
    const create = screen.getByRole("button", { name: "Nuovo Ticket" })
    expect(create.tagName).toBe("A")
    expect(create).toHaveAttribute("href", "/tickets/new")
  })

  it("opens the list for a manage-only holder with the create control present but disabled", async () => {
    grant([MANAGE])

    render(await renderList())

    expect(redirectMock).not.toHaveBeenCalled()
    expect(screen.getByText("Printer outage")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Nuovo Ticket" })).toBeDisabled()
    expect(document.querySelector('a[href="/tickets/new"]')).toBeNull()
  })

  it("passes the URL filters into the list read and shows the row counts", async () => {
    grant([WRITE])

    render(await renderList({ q: " Printer ", status: "Open", page: "2" }))

    expect(getTicketListMock).toHaveBeenCalledWith(
      { search: "Printer", status: "Open", priority: undefined, customerId: undefined },
      { page: 2, pageSize: 20 }
    )
    expect(
      screen.getByText(/Showing page 1 with 1 of 1/)
    ).toBeInTheDocument()
    expect(screen.getByRole("textbox", { name: "Search" })).toHaveValue(" Printer ")
  })

  it("shows the empty message when the filters match no ticket", async () => {
    grant([WRITE])
    getTicketListMock.mockResolvedValue({ items: [], page: 1, total: 0 })

    render(await renderList())

    expect(screen.getByText("No tickets found.")).toBeInTheDocument()
  })
})
