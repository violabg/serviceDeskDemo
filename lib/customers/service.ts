import { prisma } from "@/lib/prisma"
import { Prisma } from "@/lib/generated/prisma/client"
import type { CustomerStatus } from "@/lib/generated/prisma/enums"

export type CustomerProfileInput = {
  name: string
  company: string
  email: string
  phone: string | null
  notes: string | null
}

export function getCustomerList() {
  return prisma.customer.findMany({
    orderBy: [{ company: "asc" }, { name: "asc" }],
    include: { _count: { select: { tickets: true } } },
  })
}

export function getCustomerById(id: string) {
  return prisma.customer.findUnique({
    where: { id },
    include: { tickets: { orderBy: [{ createdAt: "desc" }] } },
  })
}

export function getDeactivatedCustomerMatches(company: string, email: string) {
  return prisma.customer.findMany({
    where: { company: { equals: company, mode: "insensitive" }, email: { equals: email, mode: "insensitive" }, status: "Deactivated" },
    orderBy: [{ createdAt: "asc" }],
  })
}

export async function createCustomer(input: CustomerProfileInput, status: CustomerStatus) {
  const company = input.company.trim()
  const name = input.name.trim()
  const email = input.email.trim().toLowerCase()
  if (!company || !name || !isValidEmail(email)) return { ok: false as const, reason: "invalid" as const }
  const match = await prisma.customer.findFirst({
    where: { company: { equals: company, mode: "insensitive" }, email: { equals: email, mode: "insensitive" }, status: "Active" },
    select: { id: true },
  })
  if (match) return { ok: false as const, reason: "duplicate" as const }
  const inactive = await getDeactivatedCustomerMatches(company, email)
  if (inactive.length > 0) return { ok: false as const, reason: "reactivation" as const, matches: inactive }
  try {
    const customer = await prisma.customer.create({
      data: { ...input, name, company, email, phone: normalizeOptional(input.phone), notes: normalizeOptional(input.notes), status },
    })
    return { ok: true as const, customer }
  } catch (error) {
    if (isUniqueConstraintError(error)) return { ok: false as const, reason: "duplicate" as const }
    throw error
  }
}

export async function updateCustomer(id: string, input: CustomerProfileInput) {
  const company = input.company.trim()
  const name = input.name.trim()
  const email = input.email.trim().toLowerCase()
  if (!company || !name || !isValidEmail(email)) return { ok: false as const, reason: "invalid" as const }
  const current = await prisma.customer.findUniqueOrThrow({ where: { id }, select: { status: true } })
  if (current.status === "Active") {
    const duplicate = await prisma.customer.findFirst({
      where: { id: { not: id }, company: { equals: company, mode: "insensitive" }, email: { equals: email, mode: "insensitive" }, status: "Active" },
      select: { id: true },
    })
    if (duplicate) return { ok: false as const, reason: "duplicate" as const }
  }
  try {
    const customer = await prisma.customer.update({
      where: { id },
      data: { ...input, name, company, email, phone: normalizeOptional(input.phone), notes: normalizeOptional(input.notes) },
    })
    return { ok: true as const, customer }
  } catch (error) {
    if (isUniqueConstraintError(error)) return { ok: false as const, reason: "duplicate" as const }
    throw error
  }
}

export async function reactivateCustomer(id: string) {
  try {
    return await prisma.$transaction(async (tx) => {
    const current = await tx.customer.findUniqueOrThrow({ where: { id } })
    if (!current.company || !current.email || !isValidEmail(current.email)) return { ok: false as const, reason: "invalid" as const }
    const duplicate = await tx.customer.findFirst({
      where: {
        id: { not: id },
        company: { equals: current.company, mode: "insensitive" },
        email: { equals: current.email.toLowerCase(), mode: "insensitive" },
        status: "Active",
      },
      select: { id: true },
    })
    if (duplicate) return { ok: false as const, reason: "duplicate" as const }
    const customer = await tx.customer.update({ where: { id }, data: { status: "Active" } })
    return { ok: true as const, customer }
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable })
  } catch (error) {
    if (isUniqueConstraintError(error)) return { ok: false as const, reason: "duplicate" as const }
    throw error
  }
}

export async function deactivateCustomer(id: string) {
  return prisma.$transaction(async (tx) => {
    const blocking = await tx.ticket.findFirst({
      where: { customerId: id, priority: "Critical", status: { in: ["Open", "InProgress", "Pending"] } },
      select: { id: true },
    })
    if (blocking) return { ok: false as const, reason: "critical-ticket" as const }
    await tx.customer.update({ where: { id }, data: { status: "Deactivated" } })
    return { ok: true as const }
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable })
}

function normalizeOptional(value: string | null) {
  const normalized = value?.trim()
  return normalized || null
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function isUniqueConstraintError(error: unknown): error is Prisma.PrismaClientKnownRequestError {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002"
}
