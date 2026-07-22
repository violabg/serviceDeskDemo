import { beforeEach, describe, expect, it, vi } from "vitest"

import {
    addTicketNote,
    assignTechnician,
    checkDuplicateTicket,
    createTicket,
    getTicketList,
    isIntakeChannel,
    isTicketCategory,
    isTicketPriority,
    isTicketStatus,
    updateTicketPriority,
    updateTicketStatus,
} from "@/lib/tickets/service"

const prismaMock = vi.hoisted(() => ({
  ticket: {
    count: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    findFirst: vi.fn(),
    findUniqueOrThrow: vi.fn(),
    update: vi.fn(),
  },
  ticketActivity: {
    create: vi.fn(),
  },
  ticketNote: {
    create: vi.fn(),
  },
  $transaction: vi.fn(),
}))

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }))

describe("ticket service", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useRealTimers()
    prismaMock.$transaction.mockImplementation(async (callback) =>
      callback(prismaMock)
    )
  })

  it("clamps pagination and maps SLA-breached filters in getTicketList", async () => {
    prismaMock.ticket.count.mockResolvedValue(1)
    prismaMock.ticket.findMany.mockResolvedValue([
      {
        id: "ticket-1",
        title: "VPN issue",
        description: "Client cannot connect",
        slaBreachedAt: new Date("2026-07-18T11:00:00.000Z"),
      },
    ])

    const result = await getTicketList(
      {
        search: "vpn",
        status: "Open",
        priority: "High",
        customerId: "customer-1",
        assignedToId: "tech-1",
        slaBreached: true,
      },
      { page: 0, pageSize: 500 }
    )

    expect(result.page).toBe(1)
    expect(result.pageSize).toBe(100)
    expect(result.items[0]?.isSlaBreached).toBe(true)
    expect(prismaMock.ticket.count).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: expect.arrayContaining([
            { title: { contains: "vpn", mode: "insensitive" } },
            {
              description: {
                contains: "vpn",
                mode: "insensitive",
              },
            },
          ]),
          status: "Open",
          priority: "High",
          customerId: "customer-1",
          assignedToId: "tech-1",
          slaBreachedAt: expect.objectContaining({ lt: expect.any(Date) }),
        }),
      })
    )
    expect(prismaMock.ticket.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 0,
        take: 100,
      })
    )
  })

  it("trims optional IDs and writes activity when creating a ticket", async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-07-18T12:00:00.000Z"))
    prismaMock.ticket.create.mockResolvedValue({
      id: "ticket-1",
      status: "Open",
    })
    prismaMock.ticketActivity.create.mockResolvedValue({})

    await createTicket(
      {
        title: "  Laptop issue  ",
        description: "  Blue screen on boot  ",
        priority: "Critical",
        category: "Hardware",
        intakeChannel: "Portal",
        requesterContact: "  user@example.com  ",
        customerId: "customer-1",
        assetId: "   ",
        assignedToId: " tech-1 ",
      },
      "user-1"
    )

    expect(prismaMock.ticket.create).toHaveBeenCalledWith({
      data: {
        title: "Laptop issue",
        description: "Blue screen on boot",
        priority: "Critical",
        category: "Hardware",
        intakeChannel: "Portal",
        requesterContact: "user@example.com",
        customerId: "customer-1",
        assetId: null,
        assignedToId: "tech-1",
        pendingAssetLink: true,
        slaBreachedAt: new Date("2026-07-18T16:00:00.000Z"),
        createdById: "user-1",
      },
    })
    expect(prismaMock.ticketActivity.create).toHaveBeenCalledWith({
      data: {
        ticketId: "ticket-1",
        actorId: "user-1",
        type: "Created",
        newValue: "Open",
      },
    })
  })

  it("short-circuits duplicate checks for missing customer IDs or blank titles", async () => {
    await expect(checkDuplicateTicket("", "VPN issue")).resolves.toBe(false)
    await expect(checkDuplicateTicket("customer-1", "   ")).resolves.toBe(false)

    expect(prismaMock.ticket.findFirst).not.toHaveBeenCalled()
  })

  it("looks for recent duplicate tickets using a trimmed title", async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-07-20T12:00:00.000Z"))
    prismaMock.ticket.findFirst.mockResolvedValue({ id: "ticket-1" })

    await expect(
      checkDuplicateTicket("customer-1", "  VPN outage  ")
    ).resolves.toBe(true)

    expect(prismaMock.ticket.findFirst).toHaveBeenCalledWith({
      where: {
        customerId: "customer-1",
        title: {
          contains: "VPN outage",
          mode: "insensitive",
        },
        createdAt: {
          gte: new Date("2026-07-19T12:00:00.000Z"),
        },
      },
      select: { id: true },
    })
  })

  it("sets resolvedAt and records the transition when updating status", async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-07-18T15:30:00.000Z"))
    prismaMock.ticket.findUniqueOrThrow.mockResolvedValue({ status: "Pending" })
    prismaMock.ticket.update.mockResolvedValue({ id: "ticket-1", status: "Resolved" })
    prismaMock.ticketActivity.create.mockResolvedValue({})

    await updateTicketStatus("ticket-1", "Resolved", "user-1")

    expect(prismaMock.ticket.update).toHaveBeenCalledWith({
      where: { id: "ticket-1" },
      data: {
        status: "Resolved",
        resolvedAt: new Date("2026-07-18T15:30:00.000Z"),
      },
    })
    expect(prismaMock.ticketActivity.create).toHaveBeenCalledWith({
      data: {
        ticketId: "ticket-1",
        actorId: "user-1",
        type: "StatusChanged",
        previousValue: "Pending",
        newValue: "Resolved",
      },
    })
  })

  it("recomputes SLA and records the transition when updating priority", async () => {
    prismaMock.ticket.findUniqueOrThrow.mockResolvedValue({
      priority: "Low",
      createdAt: new Date("2026-07-18T08:00:00.000Z"),
    })
    prismaMock.ticket.update.mockResolvedValue({ id: "ticket-1", priority: "High" })
    prismaMock.ticketActivity.create.mockResolvedValue({})

    await updateTicketPriority("ticket-1", "High", "user-1")

    expect(prismaMock.ticket.update).toHaveBeenCalledWith({
      where: { id: "ticket-1" },
      data: {
        priority: "High",
        slaBreachedAt: new Date("2026-07-18T16:00:00.000Z"),
      },
    })
    expect(prismaMock.ticketActivity.create).toHaveBeenCalledWith({
      data: {
        ticketId: "ticket-1",
        actorId: "user-1",
        type: "PriorityChanged",
        previousValue: "Low",
        newValue: "High",
      },
    })
  })

  it("normalizes technician IDs and records assignment changes", async () => {
    prismaMock.ticket.findUniqueOrThrow.mockResolvedValue({ assignedToId: "tech-1" })
    prismaMock.ticket.update.mockResolvedValue({ id: "ticket-1", assignedToId: null })
    prismaMock.ticketActivity.create.mockResolvedValue({})

    await assignTechnician("ticket-1", "   ", "user-1")

    expect(prismaMock.ticket.update).toHaveBeenCalledWith({
      where: { id: "ticket-1" },
      data: {
        assignedToId: null,
      },
    })
    expect(prismaMock.ticketActivity.create).toHaveBeenCalledWith({
      data: {
        ticketId: "ticket-1",
        actorId: "user-1",
        type: "AssigneeChanged",
        previousValue: "tech-1",
        newValue: null,
      },
    })
  })

  it("rejects blank notes and trims persisted note content", async () => {
    await expect(addTicketNote("ticket-1", "   ", "user-1")).rejects.toThrow(
      "Note content is required"
    )

    prismaMock.ticketNote.create.mockResolvedValue({ id: "note-1" })
    prismaMock.ticketActivity.create.mockResolvedValue({})

    await addTicketNote("ticket-1", "  Investigating ISP circuit  ", "user-1")

    expect(prismaMock.ticketNote.create).toHaveBeenCalledWith({
      data: {
        ticketId: "ticket-1",
        authorId: "user-1",
        content: "Investigating ISP circuit",
      },
    })
    expect(prismaMock.ticketActivity.create).toHaveBeenCalledWith({
      data: {
        ticketId: "ticket-1",
        actorId: "user-1",
        type: "NoteAdded",
        newValue: "Investigating ISP circuit",
      },
    })
  })

  it("validates ticket enum guard helpers", () => {
    expect(isTicketPriority("High")).toBe(true)
    expect(isTicketPriority("Urgent")).toBe(false)
    expect(isTicketStatus("Closed")).toBe(true)
    expect(isTicketStatus("Archived")).toBe(false)
    expect(isTicketCategory("Software")).toBe(true)
    expect(isTicketCategory("Facilities")).toBe(false)
    expect(isIntakeChannel("Chat")).toBe(true)
    expect(isIntakeChannel("SMS")).toBe(false)
  })
})