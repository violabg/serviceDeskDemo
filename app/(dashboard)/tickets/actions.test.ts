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
  getActiveCustomerById: vi.fn(),
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

const WRITE = permissionKey("tickets", "write")
const MANAGE = permissionKey("tickets", "manage")

function grantPermissions(keys: string[]) {
  accessMock.mockResolvedValue({
    user: { id: "user-1" },
    effectivePermissionKeys: keys,
  })
}

function makeFormData(values: Record<string, string>) {
  const formData = new FormData()

  for (const [key, value] of Object.entries(values)) {
    formData.set(key, value)
  }

  return formData
}

const validCreateForm = {
  title: "Printer outage",
  description: "Offline",
  requesterContact: "user@example.com",
  customerId: "customer-1",
  priority: "High",
  category: "Hardware",
  intakeChannel: "Portal",
}

describe("ticket actions", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    for (const name of [
      "addTicketNote",
      "assignTechnician",
      "checkDuplicateTicket",
      "createTicket",
      "getActiveCustomerById",
      "getTicketById",
      "updateTicketPriority",
      "updateTicketStatus",
    ] as const) {
      serviceMock[name].mockReset()
    }
    grantPermissions([WRITE])
  })

  describe("createTicketAction", () => {
    it("returns forbidden and writes nothing without tickets:write", async () => {
      grantPermissions([])

      await expect(createTicketAction(makeFormData(validCreateForm))).resolves.toEqual({
        ok: false,
        reason: "forbidden",
      })
      expect(serviceMock.getActiveCustomerById).not.toHaveBeenCalled()
      expect(serviceMock.createTicket).not.toHaveBeenCalled()
      expect(updateTagMock).not.toHaveBeenCalled()
    })

    it("returns forbidden before invalid input when the caller lacks tickets:write", async () => {
      grantPermissions([])

      await expect(
        createTicketAction(makeFormData({ ...validCreateForm, priority: "Invalid" }))
      ).resolves.toEqual({ ok: false, reason: "forbidden" })
      expect(serviceMock.createTicket).not.toHaveBeenCalled()
    })

    it("returns invalid for a failed enumerated guard and creates nothing", async () => {
      await expect(
        createTicketAction(makeFormData({ ...validCreateForm, priority: "Invalid" }))
      ).resolves.toEqual({ ok: false, reason: "invalid" })
      expect(serviceMock.getActiveCustomerById).not.toHaveBeenCalled()
      expect(serviceMock.createTicket).not.toHaveBeenCalled()
      expect(updateTagMock).not.toHaveBeenCalled()
    })

    it("returns invalid for an empty required field", async () => {
      await expect(
        createTicketAction(makeFormData({ ...validCreateForm, title: "   " }))
      ).resolves.toEqual({ ok: false, reason: "invalid" })
      expect(serviceMock.createTicket).not.toHaveBeenCalled()
    })

    it("returns not-found when the chosen customer is not active and creates nothing", async () => {
      serviceMock.getActiveCustomerById.mockResolvedValue(null)

      await expect(createTicketAction(makeFormData(validCreateForm))).resolves.toEqual({
        ok: false,
        reason: "not-found",
      })
      expect(serviceMock.getActiveCustomerById).toHaveBeenCalledWith("customer-1")
      expect(serviceMock.createTicket).not.toHaveBeenCalled()
      expect(updateTagMock).not.toHaveBeenCalled()
    })

    it("returns ok true with the created ticket id and expires the list tag on success", async () => {
      serviceMock.getActiveCustomerById.mockResolvedValue({ id: "customer-1" })
      serviceMock.createTicket.mockResolvedValue({ id: "ticket-1" })

      await expect(createTicketAction(makeFormData(validCreateForm))).resolves.toEqual({
        ok: true,
        reason: null,
        ticketId: "ticket-1",
      })
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
      expect(redirectMock).not.toHaveBeenCalled()
    })

    it("propagates a service exception without returning a result or expiring tags", async () => {
      serviceMock.getActiveCustomerById.mockResolvedValue({ id: "customer-1" })
      serviceMock.createTicket.mockRejectedValueOnce(new Error("db down"))

      await expect(createTicketAction(makeFormData(validCreateForm))).rejects.toThrow(
        "db down"
      )
      expect(updateTagMock).not.toHaveBeenCalled()
    })
  })

  describe("checkDuplicateTicketAction", () => {
    it("returns forbidden with duplicate false and checks nothing without tickets:write", async () => {
      grantPermissions([])

      await expect(
        checkDuplicateTicketAction(
          makeFormData({ customerId: "customer-1", title: "Printer outage" })
        )
      ).resolves.toEqual({ ok: false, reason: "forbidden", duplicate: false })
      expect(serviceMock.getActiveCustomerById).not.toHaveBeenCalled()
      expect(serviceMock.checkDuplicateTicket).not.toHaveBeenCalled()
    })

    it("returns invalid for an empty title and does not look up the customer", async () => {
      await expect(
        checkDuplicateTicketAction(makeFormData({ customerId: "customer-1", title: "  " }))
      ).resolves.toEqual({ ok: false, reason: "invalid", duplicate: false })
      expect(serviceMock.getActiveCustomerById).not.toHaveBeenCalled()
      expect(serviceMock.checkDuplicateTicket).not.toHaveBeenCalled()
    })

    it("returns invalid for an empty customerId", async () => {
      await expect(
        checkDuplicateTicketAction(makeFormData({ customerId: "", title: "Printer" }))
      ).resolves.toEqual({ ok: false, reason: "invalid", duplicate: false })
      expect(serviceMock.checkDuplicateTicket).not.toHaveBeenCalled()
    })

    it("returns not-found when no active customer matches and never reports a false duplicate", async () => {
      serviceMock.getActiveCustomerById.mockResolvedValue(null)

      await expect(
        checkDuplicateTicketAction(
          makeFormData({ customerId: "customer-9", title: "Printer outage" })
        )
      ).resolves.toEqual({ ok: false, reason: "not-found", duplicate: false })
      expect(serviceMock.checkDuplicateTicket).not.toHaveBeenCalled()
    })

    it("returns ok true with duplicate true when a similar ticket exists", async () => {
      serviceMock.getActiveCustomerById.mockResolvedValue({ id: "customer-1" })
      serviceMock.checkDuplicateTicket.mockResolvedValue(true)

      await expect(
        checkDuplicateTicketAction(
          makeFormData({ customerId: "customer-1", title: "Printer outage" })
        )
      ).resolves.toEqual({ ok: true, reason: null, duplicate: true })
      expect(serviceMock.checkDuplicateTicket).toHaveBeenCalledWith(
        "customer-1",
        "Printer outage"
      )
    })

    it("returns ok true with duplicate false when no similar ticket exists", async () => {
      serviceMock.getActiveCustomerById.mockResolvedValue({ id: "customer-1" })
      serviceMock.checkDuplicateTicket.mockResolvedValue(false)

      await expect(
        checkDuplicateTicketAction(
          makeFormData({ customerId: "customer-1", title: "Printer outage" })
        )
      ).resolves.toEqual({ ok: true, reason: null, duplicate: false })
    })
  })

  describe("updateTicketStatusAction", () => {
    it("returns forbidden and writes nothing without tickets:write", async () => {
      grantPermissions([])

      await expect(
        updateTicketStatusAction(makeFormData({ ticketId: "ticket-1", status: "Resolved" }))
      ).resolves.toEqual({ ok: false, reason: "forbidden" })
      expect(serviceMock.getTicketById).not.toHaveBeenCalled()
      expect(serviceMock.updateTicketStatus).not.toHaveBeenCalled()
      expect(updateTagMock).not.toHaveBeenCalled()
    })

    it("returns invalid for an unknown status without looking up the ticket", async () => {
      await expect(
        updateTicketStatusAction(makeFormData({ ticketId: "ticket-1", status: "Bogus" }))
      ).resolves.toEqual({ ok: false, reason: "invalid" })
      expect(serviceMock.getTicketById).not.toHaveBeenCalled()
      expect(serviceMock.updateTicketStatus).not.toHaveBeenCalled()
    })

    it("returns invalid for a missing ticketId", async () => {
      await expect(
        updateTicketStatusAction(makeFormData({ ticketId: "", status: "Resolved" }))
      ).resolves.toEqual({ ok: false, reason: "invalid" })
      expect(serviceMock.updateTicketStatus).not.toHaveBeenCalled()
    })

    it("returns not-found for a missing ticket, even when reopening, and writes nothing", async () => {
      serviceMock.getTicketById.mockResolvedValue(null)

      await expect(
        updateTicketStatusAction(makeFormData({ ticketId: "ticket-1", status: "Open" }))
      ).resolves.toEqual({ ok: false, reason: "not-found" })
      expect(serviceMock.updateTicketStatus).not.toHaveBeenCalled()
      expect(updateTagMock).not.toHaveBeenCalled()
    })

    it("returns forbidden when a write-only caller reopens a Closed ticket", async () => {
      serviceMock.getTicketById.mockResolvedValue({ id: "ticket-1", status: "Closed" })

      await expect(
        updateTicketStatusAction(makeFormData({ ticketId: "ticket-1", status: "Open" }))
      ).resolves.toEqual({ ok: false, reason: "forbidden" })
      expect(serviceMock.updateTicketStatus).not.toHaveBeenCalled()
      expect(updateTagMock).not.toHaveBeenCalled()
    })

    it("allows reopening a Closed ticket with tickets:manage and expires its tags", async () => {
      grantPermissions([WRITE, MANAGE])
      serviceMock.getTicketById.mockResolvedValue({ id: "ticket-1", status: "Closed" })

      await expect(
        updateTicketStatusAction(makeFormData({ ticketId: "ticket-1", status: "Open" }))
      ).resolves.toEqual({ ok: true, reason: null })
      expect(serviceMock.updateTicketStatus).toHaveBeenCalledWith(
        "ticket-1",
        "Open",
        "user-1"
      )
      expect(updateTagMock).toHaveBeenCalledWith(ticketDetailTag("ticket-1"))
      expect(updateTagMock).toHaveBeenCalledWith(ticketListTag())
      expect(updateTagMock).toHaveBeenCalledTimes(2)
    })

    it("allows a write-only caller to change a Closed ticket to a status other than Open", async () => {
      serviceMock.getTicketById.mockResolvedValue({ id: "ticket-1", status: "Closed" })

      await expect(
        updateTicketStatusAction(makeFormData({ ticketId: "ticket-1", status: "Resolved" }))
      ).resolves.toEqual({ ok: true, reason: null })
      expect(serviceMock.updateTicketStatus).toHaveBeenCalledWith(
        "ticket-1",
        "Resolved",
        "user-1"
      )
    })

    it("returns ok true and expires the detail and list tags after a successful status update", async () => {
      serviceMock.getTicketById.mockResolvedValue({ id: "ticket-1", status: "Pending" })

      await expect(
        updateTicketStatusAction(makeFormData({ ticketId: "ticket-1", status: "Resolved" }))
      ).resolves.toEqual({ ok: true, reason: null })
      expect(serviceMock.updateTicketStatus).toHaveBeenCalledWith(
        "ticket-1",
        "Resolved",
        "user-1"
      )
      expect(updateTagMock).toHaveBeenCalledWith(ticketDetailTag("ticket-1"))
      expect(updateTagMock).toHaveBeenCalledWith(ticketListTag())
      expect(updateTagMock).toHaveBeenCalledTimes(2)
    })

    it("propagates a service exception without returning a result or expiring tags", async () => {
      serviceMock.getTicketById.mockResolvedValue({ id: "ticket-1", status: "Pending" })
      serviceMock.updateTicketStatus.mockRejectedValueOnce(new Error("db down"))

      await expect(
        updateTicketStatusAction(makeFormData({ ticketId: "ticket-1", status: "Resolved" }))
      ).rejects.toThrow("db down")
      expect(updateTagMock).not.toHaveBeenCalled()
    })
  })

  describe("updateTicketPriorityAction", () => {
    it("returns forbidden and writes nothing without tickets:write", async () => {
      grantPermissions([])

      await expect(
        updateTicketPriorityAction(makeFormData({ ticketId: "ticket-1", priority: "High" }))
      ).resolves.toEqual({ ok: false, reason: "forbidden" })
      expect(serviceMock.getTicketById).not.toHaveBeenCalled()
      expect(serviceMock.updateTicketPriority).not.toHaveBeenCalled()
      expect(updateTagMock).not.toHaveBeenCalled()
    })

    it("returns invalid for a failed priority guard without looking up the ticket", async () => {
      await expect(
        updateTicketPriorityAction(makeFormData({ ticketId: "ticket-1", priority: "Bogus" }))
      ).resolves.toEqual({ ok: false, reason: "invalid" })
      expect(serviceMock.getTicketById).not.toHaveBeenCalled()
      expect(serviceMock.updateTicketPriority).not.toHaveBeenCalled()
    })

    it("returns not-found for a missing ticket and writes nothing", async () => {
      serviceMock.getTicketById.mockResolvedValue(null)

      await expect(
        updateTicketPriorityAction(makeFormData({ ticketId: "ticket-1", priority: "High" }))
      ).resolves.toEqual({ ok: false, reason: "not-found" })
      expect(serviceMock.updateTicketPriority).not.toHaveBeenCalled()
      expect(updateTagMock).not.toHaveBeenCalled()
    })

    it("returns ok true and expires the detail and list tags after a successful change", async () => {
      serviceMock.getTicketById.mockResolvedValue({ id: "ticket-1" })

      await expect(
        updateTicketPriorityAction(makeFormData({ ticketId: "ticket-1", priority: "High" }))
      ).resolves.toEqual({ ok: true, reason: null })
      expect(serviceMock.updateTicketPriority).toHaveBeenCalledWith(
        "ticket-1",
        "High",
        "user-1"
      )
      expect(updateTagMock).toHaveBeenCalledWith(ticketDetailTag("ticket-1"))
      expect(updateTagMock).toHaveBeenCalledWith(ticketListTag())
      expect(updateTagMock).toHaveBeenCalledTimes(2)
    })

    it("expires the same list tag for writes by different users", async () => {
      serviceMock.getTicketById.mockResolvedValue({ id: "ticket-1" })

      await updateTicketPriorityAction(makeFormData({ ticketId: "ticket-1", priority: "High" }))

      accessMock.mockResolvedValue({
        user: { id: "user-2" },
        effectivePermissionKeys: [WRITE],
      })
      await updateTicketPriorityAction(makeFormData({ ticketId: "ticket-1", priority: "High" }))

      expect(updateTagMock.mock.calls.map(([tag]) => tag)).toEqual([
        ticketDetailTag("ticket-1"),
        ticketListTag(),
        ticketDetailTag("ticket-1"),
        ticketListTag(),
      ])
    })
  })

  describe("assignTechnicianAction", () => {
    it("returns forbidden and writes nothing without tickets:write", async () => {
      grantPermissions([])

      await expect(
        assignTechnicianAction(makeFormData({ ticketId: "ticket-1", technicianId: "tech-1" }))
      ).resolves.toEqual({ ok: false, reason: "forbidden" })
      expect(serviceMock.assignTechnician).not.toHaveBeenCalled()
      expect(updateTagMock).not.toHaveBeenCalled()
    })

    it("returns invalid when the technicianId entry is absent from the form data", async () => {
      await expect(
        assignTechnicianAction(makeFormData({ ticketId: "ticket-1" }))
      ).resolves.toEqual({ ok: false, reason: "invalid" })
      expect(serviceMock.getTicketById).not.toHaveBeenCalled()
      expect(serviceMock.assignTechnician).not.toHaveBeenCalled()
    })

    it("returns invalid when the technicianId entry is present but not a string", async () => {
      const formData = new FormData()
      formData.set("ticketId", "ticket-1")
      formData.set(
        "technicianId",
        new File(["tech-1"], "technician.txt", { type: "text/plain" })
      )

      await expect(assignTechnicianAction(formData)).resolves.toEqual({
        ok: false,
        reason: "invalid",
      })
      expect(serviceMock.getTicketById).not.toHaveBeenCalled()
      expect(serviceMock.assignTechnician).not.toHaveBeenCalled()
      expect(updateTagMock).not.toHaveBeenCalled()
    })

    it("returns invalid when the ticketId is missing", async () => {
      await expect(
        assignTechnicianAction(makeFormData({ ticketId: "", technicianId: "tech-1" }))
      ).resolves.toEqual({ ok: false, reason: "invalid" })
      expect(serviceMock.assignTechnician).not.toHaveBeenCalled()
    })

    it("returns not-found for a missing ticket and writes nothing", async () => {
      serviceMock.getTicketById.mockResolvedValue(null)

      await expect(
        assignTechnicianAction(makeFormData({ ticketId: "ticket-1", technicianId: "tech-1" }))
      ).resolves.toEqual({ ok: false, reason: "not-found" })
      expect(serviceMock.assignTechnician).not.toHaveBeenCalled()
      expect(updateTagMock).not.toHaveBeenCalled()
    })

    it("returns ok true and assigns the technician, then expires the tags", async () => {
      serviceMock.getTicketById.mockResolvedValue({ id: "ticket-1" })

      await expect(
        assignTechnicianAction(makeFormData({ ticketId: "ticket-1", technicianId: "tech-1" }))
      ).resolves.toEqual({ ok: true, reason: null })
      expect(serviceMock.assignTechnician).toHaveBeenCalledWith(
        "ticket-1",
        "tech-1",
        "user-1"
      )
      expect(updateTagMock).toHaveBeenCalledWith(ticketDetailTag("ticket-1"))
      expect(updateTagMock).toHaveBeenCalledWith(ticketListTag())
      expect(updateTagMock).toHaveBeenCalledTimes(2)
    })

    it("treats an empty technicianId as a clear and passes null to the service", async () => {
      serviceMock.getTicketById.mockResolvedValue({ id: "ticket-1" })

      await expect(
        assignTechnicianAction(makeFormData({ ticketId: "ticket-1", technicianId: "" }))
      ).resolves.toEqual({ ok: true, reason: null })
      expect(serviceMock.assignTechnician).toHaveBeenCalledWith("ticket-1", null, "user-1")
    })
  })

  describe("addTicketNoteAction", () => {
    it("returns forbidden and writes nothing without tickets:write", async () => {
      grantPermissions([])

      await expect(
        addTicketNoteAction(makeFormData({ ticketId: "ticket-1", content: "Note" }))
      ).resolves.toEqual({ ok: false, reason: "forbidden" })
      expect(serviceMock.getTicketById).not.toHaveBeenCalled()
      expect(serviceMock.addTicketNote).not.toHaveBeenCalled()
      expect(updateTagMock).not.toHaveBeenCalled()
    })

    it("returns invalid for blank content without looking up the ticket", async () => {
      await expect(
        addTicketNoteAction(makeFormData({ ticketId: "ticket-1", content: "   " }))
      ).resolves.toEqual({ ok: false, reason: "invalid" })
      expect(serviceMock.getTicketById).not.toHaveBeenCalled()
      expect(serviceMock.addTicketNote).not.toHaveBeenCalled()
    })

    it("returns not-found for a missing ticket and writes nothing", async () => {
      serviceMock.getTicketById.mockResolvedValue(null)

      await expect(
        addTicketNoteAction(makeFormData({ ticketId: "ticket-1", content: "Note" }))
      ).resolves.toEqual({ ok: false, reason: "not-found" })
      expect(serviceMock.addTicketNote).not.toHaveBeenCalled()
      expect(updateTagMock).not.toHaveBeenCalled()
    })

    it("returns ok true, adds the note and expires only the detail tag on success", async () => {
      serviceMock.getTicketById.mockResolvedValue({ id: "ticket-1" })

      await expect(
        addTicketNoteAction(
          makeFormData({ ticketId: "ticket-1", content: "Investigating outage" })
        )
      ).resolves.toEqual({ ok: true, reason: null })
      expect(serviceMock.addTicketNote).toHaveBeenCalledWith(
        "ticket-1",
        "Investigating outage",
        "user-1"
      )
      expect(updateTagMock).toHaveBeenCalledWith(ticketDetailTag("ticket-1"))
      expect(updateTagMock).toHaveBeenCalledTimes(1)
    })

    it("propagates a service exception without returning a result or expiring tags", async () => {
      serviceMock.getTicketById.mockResolvedValue({ id: "ticket-1" })
      serviceMock.addTicketNote.mockRejectedValueOnce(new Error("db down"))

      await expect(
        addTicketNoteAction(makeFormData({ ticketId: "ticket-1", content: "Note" }))
      ).rejects.toThrow("db down")
      expect(updateTagMock).not.toHaveBeenCalled()
    })
  })
})
