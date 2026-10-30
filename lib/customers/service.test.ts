import { beforeEach, describe, expect, it, vi } from "vitest"

import {
  createCustomer,
  deactivateCustomer,
  getCustomerById,
  getCustomerList,
  getDeactivatedCustomerMatches,
  reactivateCustomer,
  updateCustomer,
} from "@/lib/customers/service"
import { Prisma } from "@/lib/generated/prisma/client"

const prismaMock = vi.hoisted(() => ({
  customer: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    findUniqueOrThrow: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  ticket: {
    findFirst: vi.fn(),
  },
  $transaction: vi.fn(),
}))

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }))

const validInput = {
  name: "  Ana Rossi  ",
  company: "  Acme  ",
  email: "  Ana@Acme.COM ",
  phone: "   ",
  notes: "",
}

function uniqueViolation() {
  return new Prisma.PrismaClientKnownRequestError("Unique constraint failed", {
    code: "P2002",
    clientVersion: "7.10.0",
  })
}

describe("customer service", () => {
  beforeEach(() => {
    vi.resetAllMocks()
    prismaMock.$transaction.mockImplementation(async (callback: (tx: typeof prismaMock) => unknown) =>
      callback(prismaMock)
    )
  })

  describe("getCustomerList", () => {
    it("returns every customer in company and name order when no term is given", async () => {
      prismaMock.customer.findMany.mockResolvedValue([{ id: "c1" }, { id: "c2" }])

      const rows = await getCustomerList()

      expect(rows).toEqual([{ id: "c1" }, { id: "c2" }])
      const args = prismaMock.customer.findMany.mock.calls[0][0]
      expect(args.where).toBeUndefined()
      expect(args.orderBy).toEqual([{ company: "asc" }, { name: "asc" }])
      expect(args.include).toEqual({ _count: { select: { tickets: true } } })
    })

    it("treats a blank term as no term and applies no condition", async () => {
      prismaMock.customer.findMany.mockResolvedValue([])

      await getCustomerList("   ")

      expect(prismaMock.customer.findMany.mock.calls[0][0].where).toBeUndefined()
    })

    it("matches the trimmed term case-insensitively against company, primary contact and email", async () => {
      prismaMock.customer.findMany.mockResolvedValue([{ id: "c1" }])

      const rows = await getCustomerList("  Acme ")

      expect(rows).toEqual([{ id: "c1" }])
      const args = prismaMock.customer.findMany.mock.calls[0][0]
      expect(args.where).toEqual({
        OR: [
          { company: { contains: "Acme", mode: "insensitive" } },
          { name: { contains: "Acme", mode: "insensitive" } },
          { email: { contains: "Acme", mode: "insensitive" } },
        ],
      })
      expect(args.orderBy).toEqual([{ company: "asc" }, { name: "asc" }])
    })

    it("returns an empty array when the query matches nothing", async () => {
      prismaMock.customer.findMany.mockResolvedValue([])

      await expect(getCustomerList("zzz-no-match")).resolves.toEqual([])
    })
  })

  describe("getCustomerById", () => {
    it("returns the customer with its tickets ordered newest first", async () => {
      const customer = { id: "c1", tickets: [{ id: "t2" }, { id: "t1" }] }
      prismaMock.customer.findUnique.mockResolvedValue(customer)

      await expect(getCustomerById("c1")).resolves.toBe(customer)
      expect(prismaMock.customer.findUnique).toHaveBeenCalledWith({
        where: { id: "c1" },
        include: { tickets: { orderBy: [{ createdAt: "desc" }] } },
      })
    })

    it("returns null when no customer has the id", async () => {
      prismaMock.customer.findUnique.mockResolvedValue(null)

      await expect(getCustomerById("missing")).resolves.toBeNull()
    })
  })

  describe("getDeactivatedCustomerMatches", () => {
    it("looks up Deactivated customers with the same company and email case-insensitively", async () => {
      const matches = [{ id: "c9", status: "Deactivated" }]
      prismaMock.customer.findMany.mockResolvedValue(matches)

      await expect(getDeactivatedCustomerMatches("Acme", "ana@acme.com")).resolves.toBe(matches)
      expect(prismaMock.customer.findMany).toHaveBeenCalledWith({
        where: {
          company: { equals: "Acme", mode: "insensitive" },
          email: { equals: "ana@acme.com", mode: "insensitive" },
          status: "Deactivated",
        },
        orderBy: [{ createdAt: "asc" }],
      })
    })
  })

  describe("createCustomer", () => {
    it("stores trimmed values, a lowercase email, null for blank optional fields and the given status", async () => {
      prismaMock.customer.findFirst.mockResolvedValue(null)
      prismaMock.customer.findMany.mockResolvedValue([])
      prismaMock.customer.create.mockResolvedValue({ id: "c1" })

      const result = await createCustomer(validInput, "Active")

      expect(result).toEqual({ ok: true, customer: { id: "c1" } })
      expect(prismaMock.customer.create).toHaveBeenCalledWith({
        data: {
          name: "Ana Rossi",
          company: "Acme",
          email: "ana@acme.com",
          phone: null,
          notes: null,
          status: "Active",
        },
      })
    })

    it("returns invalid without any read or write when the company is blank", async () => {
      await expect(createCustomer({ ...validInput, company: "   " }, "Active")).resolves.toEqual({
        ok: false,
        reason: "invalid",
      })
      expect(prismaMock.customer.findFirst).not.toHaveBeenCalled()
      expect(prismaMock.customer.create).not.toHaveBeenCalled()
    })

    it("returns invalid without any write when the primary contact is blank", async () => {
      await expect(createCustomer({ ...validInput, name: "  " }, "Active")).resolves.toEqual({
        ok: false,
        reason: "invalid",
      })
      expect(prismaMock.customer.create).not.toHaveBeenCalled()
    })

    it("returns invalid without any write when the email does not match local@domain.tld", async () => {
      await expect(createCustomer({ ...validInput, email: "ana@acme" }, "Active")).resolves.toEqual({
        ok: false,
        reason: "invalid",
      })
      expect(prismaMock.customer.findFirst).not.toHaveBeenCalled()
      expect(prismaMock.customer.create).not.toHaveBeenCalled()
    })

    it("returns duplicate when an Active customer has the same company and email in another letter case, and creates nothing", async () => {
      prismaMock.customer.findFirst.mockResolvedValue({ id: "c-active" })

      await expect(createCustomer(validInput, "Active")).resolves.toEqual({
        ok: false,
        reason: "duplicate",
      })
      expect(prismaMock.customer.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            company: { equals: "Acme", mode: "insensitive" },
            email: { equals: "ana@acme.com", mode: "insensitive" },
            status: "Active",
          }),
        })
      )
      expect(prismaMock.customer.create).not.toHaveBeenCalled()
    })

    it("returns reactivation with the matching Deactivated records and creates nothing", async () => {
      const inactive = [{ id: "c-old", status: "Deactivated" }]
      prismaMock.customer.findFirst.mockResolvedValue(null)
      prismaMock.customer.findMany.mockResolvedValue(inactive)

      await expect(createCustomer(validInput, "Active")).resolves.toEqual({
        ok: false,
        reason: "reactivation",
        matches: inactive,
      })
      expect(prismaMock.customer.create).not.toHaveBeenCalled()
    })

    it("gives duplicate precedence over reactivation when an Active customer also matches", async () => {
      prismaMock.customer.findFirst.mockResolvedValue({ id: "c-active" })
      prismaMock.customer.findMany.mockResolvedValue([{ id: "c-old" }])

      await expect(createCustomer(validInput, "Active")).resolves.toEqual({
        ok: false,
        reason: "duplicate",
      })
      expect(prismaMock.customer.findMany).not.toHaveBeenCalled()
      expect(prismaMock.customer.create).not.toHaveBeenCalled()
    })

    it("maps a unique constraint violation during the write to duplicate", async () => {
      prismaMock.customer.findFirst.mockResolvedValue(null)
      prismaMock.customer.findMany.mockResolvedValue([])
      prismaMock.customer.create.mockRejectedValue(uniqueViolation())

      await expect(createCustomer(validInput, "Active")).resolves.toEqual({
        ok: false,
        reason: "duplicate",
      })
    })

    it("rethrows a write error that is not a unique constraint violation", async () => {
      prismaMock.customer.findFirst.mockResolvedValue(null)
      prismaMock.customer.findMany.mockResolvedValue([])
      prismaMock.customer.create.mockRejectedValue(new Error("database unavailable"))

      await expect(createCustomer(validInput, "Active")).rejects.toThrow("database unavailable")
    })
  })

  describe("updateCustomer", () => {
    it("returns invalid and writes nothing when the company is blank", async () => {
      await expect(updateCustomer("c1", { ...validInput, company: " " })).resolves.toEqual({
        ok: false,
        reason: "invalid",
      })
      expect(prismaMock.customer.update).not.toHaveBeenCalled()
    })

    it("returns invalid and writes nothing when the email is malformed", async () => {
      await expect(updateCustomer("c1", { ...validInput, email: "not-an-email" })).resolves.toEqual({
        ok: false,
        reason: "invalid",
      })
      expect(prismaMock.customer.update).not.toHaveBeenCalled()
    })

    it("runs the duplicate check for an Active customer, excluding itself, and returns duplicate without changing anything", async () => {
      prismaMock.customer.findUniqueOrThrow.mockResolvedValue({ status: "Active" })
      prismaMock.customer.findFirst.mockResolvedValue({ id: "c-other" })

      await expect(updateCustomer("c1", validInput)).resolves.toEqual({
        ok: false,
        reason: "duplicate",
      })
      expect(prismaMock.customer.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            id: { not: "c1" },
            status: "Active",
          }),
        })
      )
      expect(prismaMock.customer.update).not.toHaveBeenCalled()
    })

    it("skips the duplicate check for a Deactivated customer and saves the update", async () => {
      prismaMock.customer.findUniqueOrThrow.mockResolvedValue({ status: "Deactivated" })
      prismaMock.customer.update.mockResolvedValue({ id: "c1", company: "Acme" })

      await expect(updateCustomer("c1", validInput)).resolves.toEqual({
        ok: true,
        customer: { id: "c1", company: "Acme" },
      })
      expect(prismaMock.customer.findFirst).not.toHaveBeenCalled()
      expect(prismaMock.customer.update).toHaveBeenCalledTimes(1)
    })

    it("saves an Active customer when no other Active customer has the same company and email", async () => {
      prismaMock.customer.findUniqueOrThrow.mockResolvedValue({ status: "Active" })
      prismaMock.customer.findFirst.mockResolvedValue(null)
      prismaMock.customer.update.mockResolvedValue({ id: "c1" })

      await expect(updateCustomer("c1", validInput)).resolves.toEqual({
        ok: true,
        customer: { id: "c1" },
      })
    })

    it("stores trimmed values, a lowercase email and null for blank optional fields", async () => {
      prismaMock.customer.findUniqueOrThrow.mockResolvedValue({ status: "Deactivated" })
      prismaMock.customer.update.mockResolvedValue({ id: "c1" })

      await updateCustomer("c1", { ...validInput, phone: " 555 ", notes: "  " })

      expect(prismaMock.customer.update).toHaveBeenCalledWith({
        where: { id: "c1" },
        data: expect.objectContaining({
          name: "Ana Rossi",
          company: "Acme",
          email: "ana@acme.com",
          phone: "555",
          notes: null,
        }),
      })
    })

    it("maps a unique constraint violation during the write to duplicate", async () => {
      prismaMock.customer.findUniqueOrThrow.mockResolvedValue({ status: "Deactivated" })
      prismaMock.customer.update.mockRejectedValue(uniqueViolation())

      await expect(updateCustomer("c1", validInput)).resolves.toEqual({
        ok: false,
        reason: "duplicate",
      })
    })
  })

  describe("reactivateCustomer", () => {
    it("runs in a Serializable transaction", async () => {
      prismaMock.customer.findUniqueOrThrow.mockResolvedValue({
        company: "Acme",
        email: "ana@acme.com",
        status: "Deactivated",
      })
      prismaMock.customer.findFirst.mockResolvedValue(null)
      prismaMock.customer.update.mockResolvedValue({ id: "c1", status: "Active" })

      await reactivateCustomer("c1")

      expect(prismaMock.$transaction).toHaveBeenCalledWith(expect.any(Function), {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      })
    })

    it("returns invalid and keeps the status Deactivated when the stored company is empty", async () => {
      prismaMock.customer.findUniqueOrThrow.mockResolvedValue({
        company: "",
        email: "ana@acme.com",
        status: "Deactivated",
      })

      await expect(reactivateCustomer("c1")).resolves.toEqual({ ok: false, reason: "invalid" })
      expect(prismaMock.customer.update).not.toHaveBeenCalled()
    })

    it("returns invalid and keeps the status Deactivated when the stored email is malformed", async () => {
      prismaMock.customer.findUniqueOrThrow.mockResolvedValue({
        company: "Acme",
        email: "ana@acme",
        status: "Deactivated",
      })

      await expect(reactivateCustomer("c1")).resolves.toEqual({ ok: false, reason: "invalid" })
      expect(prismaMock.customer.update).not.toHaveBeenCalled()
    })

    it("returns duplicate when another Active customer has the same company and email, and keeps the status Deactivated", async () => {
      prismaMock.customer.findUniqueOrThrow.mockResolvedValue({
        company: "Acme",
        email: "Ana@Acme.com",
        status: "Deactivated",
      })
      prismaMock.customer.findFirst.mockResolvedValue({ id: "c-active" })

      await expect(reactivateCustomer("c1")).resolves.toEqual({ ok: false, reason: "duplicate" })
      expect(prismaMock.customer.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            id: { not: "c1" },
            company: { equals: "Acme", mode: "insensitive" },
            email: { equals: "ana@acme.com", mode: "insensitive" },
            status: "Active",
          }),
        })
      )
      expect(prismaMock.customer.update).not.toHaveBeenCalled()
    })

    it("sets the status to Active and returns ok when no Active match exists", async () => {
      prismaMock.customer.findUniqueOrThrow.mockResolvedValue({
        company: "Acme",
        email: "ana@acme.com",
        status: "Deactivated",
      })
      prismaMock.customer.findFirst.mockResolvedValue(null)
      prismaMock.customer.update.mockResolvedValue({ id: "c1", status: "Active" })

      await expect(reactivateCustomer("c1")).resolves.toEqual({
        ok: true,
        customer: { id: "c1", status: "Active" },
      })
      expect(prismaMock.customer.update).toHaveBeenCalledWith({
        where: { id: "c1" },
        data: { status: "Active" },
      })
    })

    it("maps a unique constraint violation during the status write to duplicate", async () => {
      prismaMock.customer.findUniqueOrThrow.mockResolvedValue({
        company: "Acme",
        email: "ana@acme.com",
        status: "Deactivated",
      })
      prismaMock.customer.findFirst.mockResolvedValue(null)
      prismaMock.customer.update.mockRejectedValue(uniqueViolation())

      await expect(reactivateCustomer("c1")).resolves.toEqual({ ok: false, reason: "duplicate" })
    })
  })

  describe("deactivateCustomer", () => {
    it("refuses with critical-ticket when a linked Critical ticket is open and keeps the customer Active", async () => {
      prismaMock.ticket.findFirst.mockResolvedValue({ id: "t1" })

      await expect(deactivateCustomer("c1")).resolves.toEqual({
        ok: false,
        reason: "critical-ticket",
      })
      expect(prismaMock.customer.update).not.toHaveBeenCalled()
    })

    it("looks for Critical tickets only in the Open, InProgress and Pending statuses", async () => {
      prismaMock.ticket.findFirst.mockResolvedValue(null)
      prismaMock.customer.update.mockResolvedValue({ id: "c1" })

      await deactivateCustomer("c1")

      expect(prismaMock.ticket.findFirst).toHaveBeenCalledWith({
        where: {
          customerId: "c1",
          priority: "Critical",
          status: { in: ["Open", "InProgress", "Pending"] },
        },
        select: { id: true },
      })
    })

    it("does not block on Critical tickets that are Resolved or Closed and writes the Deactivated status", async () => {
      prismaMock.ticket.findFirst.mockResolvedValue(null)
      prismaMock.customer.update.mockResolvedValue({ id: "c1", status: "Deactivated" })

      await expect(deactivateCustomer("c1")).resolves.toEqual({ ok: true })

      const statuses = prismaMock.ticket.findFirst.mock.calls[0][0].where.status.in
      expect(statuses).not.toContain("Resolved")
      expect(statuses).not.toContain("Closed")
      expect(prismaMock.customer.update).toHaveBeenCalledWith({
        where: { id: "c1" },
        data: { status: "Deactivated" },
      })
    })

    it("sets the status to Deactivated and returns ok when no blocking ticket exists", async () => {
      prismaMock.ticket.findFirst.mockResolvedValue(null)
      prismaMock.customer.update.mockResolvedValue({ id: "c1", status: "Deactivated" })

      await expect(deactivateCustomer("c1")).resolves.toEqual({ ok: true })
      expect(prismaMock.customer.update).toHaveBeenCalledWith({
        where: { id: "c1" },
        data: { status: "Deactivated" },
      })
      expect(prismaMock.$transaction).toHaveBeenCalledWith(expect.any(Function), {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      })
    })
  })
})
