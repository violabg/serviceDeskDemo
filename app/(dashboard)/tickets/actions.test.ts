import { beforeEach, describe, expect, it, vi } from "vitest"

import {
  ticketDetailTag,
  ticketListTag,
} from "@/app/(dashboard)/tickets/_lib/cache-tags"
import {
  addTicketNoteAction,
  assignTechnicianAction,
  checkDuplicateTicketAction,
  createTicketAction,
  updateTicketPriorityAction,
  updateTicketStatusAction,
} from "@/app/(dashboard)/tickets/actions"
import { permissionKey } from "@/lib/access-control"

const accessMock = vi.hoisted(() => vi.fn())
const serviceMock = vi.hoisted(() => ({
  addTicketNote: vi.fn(),
  assignTechnician: vi.fn(),
  checkDuplicateTicket: vi.fn(),
  createTicket: vi.fn(),
  getTicketById: vi.fn(),
  isIntakeChannel: vi.fn((value: string) => value === "Portal"),
  isTicketCategory: vi.fn((value: string) => value === "Hardware"),
  isTicketPriority: vi.fn((value: string) => value === "High"),
  isTicketStatus: vi.fn((value: string) =>
    ["Open", "Closed", "Resolved", "Pending"].includes(value)
  ),
  updateTicketPriority: vi.fn(),
  updateTicketStatus: vi.fn(),
}))
const updateTagMock = vi.hoisted(() => vi.fn())
const redirectMock = vi.hoisted(() => vi.fn())

vi.mock("@/app/(dashboard)/admin/_lib/current-application-user", () => ({
  requireCurrentApplicationAccess: accessMock,
}))
vi.mock("@/lib/tickets/service", () => serviceMock)
vi.mock("next/cache", () => ({ updateTag: updateTagMock }))
vi.mock("next/navigation", () => ({ redirect: redirectMock }))

function makeFormData(values: Record<string, string>) {
  const formData = new FormData()

  for (const [key, value] of Object.entries(values)) {
    formData.set(key, value)
  }

  return formData
}

describe("ticket actions", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    accessMock.mockResolvedValue({
      user: { id: "user-1" },
      effectivePermissionKeys: [permissionKey("tickets", "write")],
    })
  })

  it("returns early when tickets:write is missing during ticket creation", async () => {
    accessMock.mockResolvedValue({
      user: { id: "user-1" },
      effectivePermissionKeys: [],
    })

    await createTicketAction(
      makeFormData({
        title: "Printer outage",
        description: "Offline",
        requesterContact: "user@example.com",
        customerId: "customer-1",
        priority: "High",
        category: "Hardware",
        intakeChannel: "Portal",
      })
    )

    expect(serviceMock.createTicket).not.toHaveBeenCalled()
    expect(updateTagMock).not.toHaveBeenCalled()
    expect(redirectMock).not.toHaveBeenCalled()
  })

  it("returns a forbidden duplicate-check result without tickets:write", async () => {
    accessMock.mockResolvedValue({
      user: { id: "user-1" },
      effectivePermissionKeys: [],
    })

    await expect(
      checkDuplicateTicketAction(
        makeFormData({ customerId: "customer-1", title: "Printer outage" })
      )
    ).resolves.toEqual({
      success: false,
      error: "Forbidden",
      duplicate: false,
    })
    expect(serviceMock.checkDuplicateTicket).not.toHaveBeenCalled()
  })

  it("rejects invalid create-ticket form data before calling the service", async () => {
    await createTicketAction(
      makeFormData({
        title: "Printer outage",
        description: "Offline",
        requesterContact: "user@example.com",
        customerId: "customer-1",
        priority: "Invalid",
        category: "Hardware",
        intakeChannel: "Portal",
      })
    )

    expect(serviceMock.createTicket).not.toHaveBeenCalled()
  })

  it("revalidates and redirects after successful ticket creation", async () => {
    serviceMock.createTicket.mockResolvedValue({ id: "ticket-1" })

    await createTicketAction(
      makeFormData({
        title: "Printer outage",
        description: "Offline",
        requesterContact: "user@example.com",
        customerId: "customer-1",
        priority: "High",
        category: "Hardware",
        intakeChannel: "Portal",
      })
    )

    expect(serviceMock.createTicket).toHaveBeenCalledWith(
      {
        title: "Printer outage",
        description: "Offline",
        requesterContact: "user@example.com",
        customerId: "customer-1",
        priority: "High",
        category: "Hardware",
        intakeChannel: "Portal",
        assetId: null,
        assignedToId: null,
      },
      "user-1"
    )
    expect(updateTagMock).toHaveBeenCalledWith(ticketListTag())
    expect(updateTagMock).toHaveBeenCalledTimes(1)
    expect(redirectMock).toHaveBeenCalledWith("/tickets/ticket-1")
  })

  it("requires tickets:manage to reopen a closed ticket", async () => {
    serviceMock.getTicketById.mockResolvedValue({ id: "ticket-1", status: "Closed" })

    await updateTicketStatusAction(
      makeFormData({ ticketId: "ticket-1", status: "Open" })
    )

    expect(serviceMock.updateTicketStatus).not.toHaveBeenCalled()
    expect(updateTagMock).not.toHaveBeenCalled()
  })

  it("revalidates after a successful status update", async () => {
    serviceMock.getTicketById.mockResolvedValue({ id: "ticket-1", status: "Pending" })

    await updateTicketStatusAction(
      makeFormData({ ticketId: "ticket-1", status: "Resolved" })
    )

    expect(serviceMock.updateTicketStatus).toHaveBeenCalledWith(
      "ticket-1",
      "Resolved",
      "user-1"
    )
    expect(updateTagMock).toHaveBeenCalledWith(ticketDetailTag("ticket-1"))
    expect(updateTagMock).toHaveBeenCalledWith(ticketListTag())
    expect(updateTagMock).toHaveBeenCalledTimes(2)
  })

  it("revalidates after priority, assignee, and note mutations", async () => {
    await updateTicketPriorityAction(
      makeFormData({ ticketId: "ticket-1", priority: "High" })
    )
    await assignTechnicianAction(
      makeFormData({ ticketId: "ticket-1", technicianId: "tech-1" })
    )
    await addTicketNoteAction(
      makeFormData({ ticketId: "ticket-1", content: "Investigating outage" })
    )

    expect(serviceMock.updateTicketPriority).toHaveBeenCalledWith(
      "ticket-1",
      "High",
      "user-1"
    )
    expect(serviceMock.assignTechnician).toHaveBeenCalledWith(
      "ticket-1",
      "tech-1",
      "user-1"
    )
    expect(serviceMock.addTicketNote).toHaveBeenCalledWith(
      "ticket-1",
      "Investigating outage",
      "user-1"
    )
    expect(updateTagMock).toHaveBeenCalledWith(ticketDetailTag("ticket-1"))
    expect(updateTagMock).toHaveBeenCalledWith(ticketListTag())
    expect(updateTagMock).toHaveBeenCalledTimes(5)
  })

  it("expires the same list tag for writes by different users", async () => {
    await updateTicketPriorityAction(
      makeFormData({ ticketId: "ticket-1", priority: "High" })
    )

    accessMock.mockResolvedValue({
      user: { id: "user-2" },
      effectivePermissionKeys: [permissionKey("tickets", "write")],
    })
    await updateTicketPriorityAction(
      makeFormData({ ticketId: "ticket-1", priority: "High" })
    )

    expect(updateTagMock.mock.calls.map(([tag]) => tag)).toEqual([
      ticketDetailTag("ticket-1"),
      ticketListTag(),
      ticketDetailTag("ticket-1"),
      ticketListTag(),
    ])
  })
})