// @vitest-environment jsdom

import { render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { TicketDetailPageContent } from "@/app/(dashboard)/tickets/[id]/page"
import { permissionKey } from "@/lib/access-control"

const requireCurrentApplicationAccessMock = vi.hoisted(() => vi.fn())
const getTicketByIdMock = vi.hoisted(() => vi.fn())
const getAvailableTechniciansMock = vi.hoisted(() => vi.fn())
const redirectMock = vi.hoisted(() => vi.fn())
const notFoundMock = vi.hoisted(() => vi.fn())
const routerMock = vi.hoisted(() => ({ refresh: vi.fn(), push: vi.fn() }))
const actionsMock = vi.hoisted(() => ({
  addTicketNoteAction: vi.fn(),
  assignTechnicianAction: vi.fn(),
  updateTicketPriorityAction: vi.fn(),
  updateTicketStatusAction: vi.fn(),
}))

vi.mock("@/app/(dashboard)/admin/_lib/current-application-user", () => ({
  requireCurrentApplicationAccess: requireCurrentApplicationAccessMock,
}))
vi.mock("@/lib/tickets/service", () => ({
  getTicketById: getTicketByIdMock,
  getAvailableTechnicians: getAvailableTechniciansMock,
}))
vi.mock("@/app/(dashboard)/tickets/actions", () => actionsMock)
vi.mock("next/navigation", () => ({
  redirect: redirectMock,
  notFound: notFoundMock,
  useRouter: () => routerMock,
}))
vi.mock("next/cache", () => ({
  cacheLife: vi.fn(),
  cacheTag: vi.fn(),
}))

const WRITE = permissionKey("tickets", "write")
const MANAGE = permissionKey("tickets", "manage")

const ticket = {
  id: "ticket-1",
  title: "Printer outage",
  status: "Open",
  priority: "High",
  requesterContact: "ana@acme.com",
  category: "Hardware",
  intakeChannel: "Email",
  asset: null,
  description: "The office printer is offline.",
  assignedToId: null,
  customer: {
    id: "customer-1",
    company: "Acme",
    name: "Ana Rossi",
    email: "ana@acme.com",
    status: "Active",
  },
  notes: [],
  activities: [],
}

function grant(keys: string[]) {
  requireCurrentApplicationAccessMock.mockResolvedValue({
    user: { id: "user-1" },
    effectivePermissionKeys: keys,
  })
}

function renderDetail(id = "ticket-1") {
  return TicketDetailPageContent({ params: Promise.resolve({ id }) })
}

function lifecycleControls() {
  return {
    updateStatus: screen.getByRole("button", { name: "Update Status" }),
    updatePriority: screen.getByRole("button", { name: "Update Priority" }),
    assign: screen.getByRole("button", { name: "Assign" }),
    addNote: screen.getByRole("button", { name: "Add Note" }),
    note: screen.getByLabelText(/Add Note/),
    status: document.getElementById("ticket-status"),
    priority: document.getElementById("ticket-priority"),
    technician: document.getElementById("ticket-technician"),
  }
}

describe("TicketDetailPageContent", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getTicketByIdMock.mockResolvedValue(ticket)
    getAvailableTechniciansMock.mockResolvedValue([
      { id: "tech-1", name: "Dana", email: "dana@example.com" },
    ])
  })

  it("redirects users with none of the tickets keys before the ticket is read", async () => {
    grant([])
    const redirectError = new Error("NEXT_REDIRECT")
    redirectMock.mockImplementation(() => {
      throw redirectError
    })

    await expect(renderDetail()).rejects.toBe(redirectError)
    expect(redirectMock).toHaveBeenCalledWith("/dashboard")
    expect(getTicketByIdMock).not.toHaveBeenCalled()
  })

  it("opens the detail view for a write-only holder with every lifecycle control disabled", async () => {
    grant([WRITE])

    render(await renderDetail())

    expect(redirectMock).not.toHaveBeenCalled()
    expect(
      screen.getByRole("heading", { name: "Printer outage" })
    ).toBeInTheDocument()
    expect(screen.getByText(/Ana Rossi · Open · High/)).toBeInTheDocument()
    const controls = lifecycleControls()
    expect(controls.updateStatus).toBeDisabled()
    expect(controls.updatePriority).toBeDisabled()
    expect(controls.assign).toBeDisabled()
    expect(controls.addNote).toBeDisabled()
    expect(controls.note).toBeDisabled()
    expect(controls.status).toBeDisabled()
    expect(controls.priority).toBeDisabled()
    expect(controls.technician).toBeDisabled()
  })

  it("opens the detail view for a manage-only holder with every lifecycle control enabled", async () => {
    grant([MANAGE])

    render(await renderDetail())

    expect(redirectMock).not.toHaveBeenCalled()
    expect(
      screen.getByRole("heading", { name: "Printer outage" })
    ).toBeInTheDocument()
    const controls = lifecycleControls()
    expect(controls.updateStatus).toBeEnabled()
    expect(controls.updatePriority).toBeEnabled()
    expect(controls.assign).toBeEnabled()
    expect(controls.addNote).toBeEnabled()
    expect(controls.note).toBeEnabled()
    expect(controls.status).toBeEnabled()
    expect(controls.priority).toBeEnabled()
    expect(controls.technician).toBeEnabled()
  })

  it("calls notFound for an id with no ticket instead of rendering content", async () => {
    grant([MANAGE])
    getTicketByIdMock.mockResolvedValue(null)
    const notFoundError = new Error("NEXT_NOT_FOUND")
    notFoundMock.mockImplementation(() => {
      throw notFoundError
    })

    await expect(renderDetail("missing")).rejects.toBe(notFoundError)
    expect(notFoundMock).toHaveBeenCalledTimes(1)
  })
})
