import { prisma } from "@/lib/prisma"
import {
    computeSlaBreachAt,
    isSlaBreached,
    TICKET_PRIORITIES,
    type TicketPriority,
} from "@/lib/tickets/sla"

export { TICKET_PRIORITIES }

export const TICKET_STATUSES = [
  "Open",
  "InProgress",
  "Pending",
  "Resolved",
  "Closed",
] as const

export const TICKET_CATEGORIES = [
  "Hardware",
  "Software",
  "Network",
  "Account",
  "Other",
] as const

export const INTAKE_CHANNELS = [
  "Email",
  "Phone",
  "Portal",
  "Chat",
  "WalkIn",
] as const

export type TicketStatus = (typeof TICKET_STATUSES)[number]
export type TicketCategory = (typeof TICKET_CATEGORIES)[number]
export type IntakeChannel = (typeof INTAKE_CHANNELS)[number]

export type TicketListFilters = {
  search?: string
  status?: TicketStatus
  priority?: TicketPriority
  customerId?: string
  assignedToId?: string
  slaBreached?: boolean
}

export type TicketListPagination = {
  page: number
  pageSize: number
}

export type CreateTicketInput = {
  title: string
  description: string
  priority: TicketPriority
  category: TicketCategory
  intakeChannel: IntakeChannel
  requesterContact: string
  customerId: string
  assetId?: string | null
  assignedToId?: string | null
}

function toNullableId(value?: string | null) {
  const normalized = value?.trim()

  return normalized ? normalized : null
}

export async function getTicketList(
  filters: TicketListFilters,
  pagination: TicketListPagination
) {
  const page = Math.max(1, pagination.page)
  const pageSize = Math.min(Math.max(1, pagination.pageSize), 100)
  const skip = (page - 1) * pageSize
  const now = new Date()

  const where = {
    ...(filters.search
      ? {
          OR: [
            { title: { contains: filters.search, mode: "insensitive" as const } },
            {
              description: {
                contains: filters.search,
                mode: "insensitive" as const,
              },
            },
          ],
        }
      : null),
    ...(filters.status ? { status: filters.status } : null),
    ...(filters.priority ? { priority: filters.priority } : null),
    ...(filters.customerId ? { customerId: filters.customerId } : null),
    ...(filters.assignedToId ? { assignedToId: filters.assignedToId } : null),
    ...(filters.slaBreached ? { slaBreachedAt: { lt: now } } : null),
  }

  const [total, items] = await Promise.all([
    prisma.ticket.count({ where }),
    prisma.ticket.findMany({
      where,
      orderBy: [{ createdAt: "desc" }],
      skip,
      take: pageSize,
      include: {
        customer: true,
        asset: true,
        assignedTo: true,
      },
    }),
  ])

  return {
    total,
    page,
    pageSize,
    items: items.map((item) => ({
      ...item,
      isSlaBreached: isSlaBreached(item.slaBreachedAt),
    })),
  }
}

export function getTicketById(id: string) {
  return prisma.ticket.findUnique({
    where: { id },
    include: {
      customer: true,
      asset: true,
      assignedTo: true,
      createdBy: true,
      notes: {
        include: { author: true },
        orderBy: [{ createdAt: "desc" }],
      },
      activities: {
        include: { actor: true },
        orderBy: [{ createdAt: "desc" }],
      },
    },
  })
}

export async function createTicket(data: CreateTicketInput, actorId: string) {
  const createdAt = new Date()
  const assetId = toNullableId(data.assetId)
  const assignedToId = toNullableId(data.assignedToId)

  return prisma.$transaction(async (tx) => {
    const ticket = await tx.ticket.create({
      data: {
        title: data.title.trim(),
        description: data.description.trim(),
        priority: data.priority,
        category: data.category,
        intakeChannel: data.intakeChannel,
        requesterContact: data.requesterContact.trim(),
        customerId: data.customerId,
        assetId,
        assignedToId,
        pendingAssetLink: !assetId,
        slaBreachedAt: computeSlaBreachAt(data.priority, createdAt),
        createdById: actorId,
      },
    })

    await tx.ticketActivity.create({
      data: {
        ticketId: ticket.id,
        actorId,
        type: "Created",
        newValue: ticket.status,
      },
    })

    return ticket
  })
}

export async function checkDuplicateTicket(customerId: string, title: string) {
  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
  const normalizedTitle = title.trim()

  if (!customerId || !normalizedTitle) {
    return false
  }

  const duplicate = await prisma.ticket.findFirst({
    where: {
      customerId,
      title: {
        contains: normalizedTitle,
        mode: "insensitive",
      },
      createdAt: {
        gte: dayAgo,
      },
    },
    select: { id: true },
  })

  return Boolean(duplicate)
}

export async function updateTicketStatus(
  ticketId: string,
  status: TicketStatus,
  actorId: string
) {
  return prisma.$transaction(async (tx) => {
    const currentTicket = await tx.ticket.findUniqueOrThrow({
      where: { id: ticketId },
      select: {
        status: true,
      },
    })

    const now = new Date()
    const resolvedAt = status === "Resolved" || status === "Closed" ? now : null

    const updated = await tx.ticket.update({
      where: { id: ticketId },
      data: {
        status,
        resolvedAt,
      },
    })

    await tx.ticketActivity.create({
      data: {
        ticketId,
        actorId,
        type: "StatusChanged",
        previousValue: currentTicket.status,
        newValue: status,
      },
    })

    return updated
  })
}

export async function updateTicketPriority(
  ticketId: string,
  priority: TicketPriority,
  actorId: string
) {
  return prisma.$transaction(async (tx) => {
    const currentTicket = await tx.ticket.findUniqueOrThrow({
      where: { id: ticketId },
      select: {
        priority: true,
        createdAt: true,
      },
    })

    const updated = await tx.ticket.update({
      where: { id: ticketId },
      data: {
        priority,
        slaBreachedAt: computeSlaBreachAt(priority, currentTicket.createdAt),
      },
    })

    await tx.ticketActivity.create({
      data: {
        ticketId,
        actorId,
        type: "PriorityChanged",
        previousValue: currentTicket.priority,
        newValue: priority,
      },
    })

    return updated
  })
}

export async function assignTechnician(
  ticketId: string,
  technicianId: string | null,
  actorId: string
) {
  const assignedToId = toNullableId(technicianId)

  return prisma.$transaction(async (tx) => {
    const currentTicket = await tx.ticket.findUniqueOrThrow({
      where: { id: ticketId },
      select: {
        assignedToId: true,
      },
    })

    const updated = await tx.ticket.update({
      where: { id: ticketId },
      data: {
        assignedToId,
      },
    })

    await tx.ticketActivity.create({
      data: {
        ticketId,
        actorId,
        type: "AssigneeChanged",
        previousValue: currentTicket.assignedToId,
        newValue: assignedToId,
      },
    })

    return updated
  })
}

export async function addTicketNote(
  ticketId: string,
  content: string,
  authorId: string
) {
  const normalizedContent = content.trim()

  if (!normalizedContent) {
    throw new Error("Note content is required")
  }

  return prisma.$transaction(async (tx) => {
    const note = await tx.ticketNote.create({
      data: {
        ticketId,
        authorId,
        content: normalizedContent,
      },
    })

    await tx.ticketActivity.create({
      data: {
        ticketId,
        actorId: authorId,
        type: "NoteAdded",
        newValue: normalizedContent.slice(0, 120),
      },
    })

    return note
  })
}

export function getAvailableTechnicians() {
  return prisma.user.findMany({
    orderBy: [{ email: "asc" }],
    select: {
      id: true,
      name: true,
      email: true,
    },
  })
}

export function getCustomers() {
  return prisma.customer.findMany({
    orderBy: [{ name: "asc" }],
    select: {
      id: true,
      name: true,
      email: true,
      company: true,
    },
  })
}

export function getAssets() {
  return prisma.asset.findMany({
    orderBy: [{ name: "asc" }],
    select: {
      id: true,
      name: true,
      serialNumber: true,
      category: true,
    },
  })
}

export function isTicketPriority(value: string): value is TicketPriority {
  return (TICKET_PRIORITIES as readonly string[]).includes(value)
}

export function isTicketStatus(value: string): value is TicketStatus {
  return (TICKET_STATUSES as readonly string[]).includes(value)
}

export function isTicketCategory(value: string): value is TicketCategory {
  return (TICKET_CATEGORIES as readonly string[]).includes(value)
}

export function isIntakeChannel(value: string): value is IntakeChannel {
  return (INTAKE_CHANNELS as readonly string[]).includes(value)
}
