import { beforeEach, describe, expect, it, vi } from "vitest"

import {
  changeCustomerStatusAction,
  createCustomerAction,
  findDeactivatedMatchesAction,
  updateCustomerAction,
} from "@/app/(dashboard)/customers/actions"
import {
  customerDetailTag,
  customerListTag,
} from "@/app/(dashboard)/customers/_lib/cache-tags"
import { permissionKey } from "@/lib/access-control"
import { ticketDetailTag, ticketListTag, ticketReferenceTag } from "@/app/(dashboard)/tickets/_lib/cache-tags"

const accessMock = vi.hoisted(() => vi.fn())
const serviceMock = vi.hoisted(() => ({
  createCustomer: vi.fn(),
  deactivateCustomer: vi.fn(),
  getCustomerById: vi.fn(),
  getDeactivatedCustomerMatches: vi.fn(),
  reactivateCustomer: vi.fn(),
  updateCustomer: vi.fn(),
}))
const updateTagMock = vi.hoisted(() => vi.fn())

vi.mock("@/app/(dashboard)/admin/_lib/current-application-user", () => ({
  requireCurrentApplicationAccess: accessMock,
}))
vi.mock("@/lib/customers/service", () => serviceMock)
vi.mock("next/cache", () => ({ updateTag: updateTagMock }))

const WRITE = permissionKey("customers", "write")
const MANAGE = permissionKey("customers", "manage")

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
  name: "  Ana Rossi  ",
  company: "  Acme  ",
  email: "  Ana@Acme.com ",
  phone: "   ",
  notes: "",
  status: "Active",
}

const validUpdateForm = {
  customerId: "customer-1",
  ...validCreateForm,
  phone: " 555 ",
  notes: "  VIP  ",
}

const existingCustomer = {
  id: "customer-1",
  tickets: [{ id: "ticket-1" }, { id: "ticket-2" }],
}

describe("customer actions", () => {
  beforeEach(() => {
    vi.resetAllMocks()
    grantPermissions([WRITE, MANAGE])
  })

  describe("createCustomerAction", () => {
    it("returns forbidden and writes nothing without customers:write", async () => {
      grantPermissions([permissionKey("customers", "read")])

      await expect(createCustomerAction(makeFormData(validCreateForm))).resolves.toEqual({
        ok: false,
        reason: "forbidden",
      })
      expect(serviceMock.createCustomer).not.toHaveBeenCalled()
      expect(updateTagMock).not.toHaveBeenCalled()
    })

    it("returns forbidden when only customers:manage is granted", async () => {
      grantPermissions([MANAGE])

      await expect(createCustomerAction(makeFormData(validCreateForm))).resolves.toEqual({
        ok: false,
        reason: "forbidden",
      })
      expect(serviceMock.createCustomer).not.toHaveBeenCalled()
    })

    it("returns invalid and creates nothing when the submitted status is Deactivated", async () => {
      await expect(
        createCustomerAction(makeFormData({ ...validCreateForm, status: "Deactivated" }))
      ).resolves.toEqual({ ok: false, reason: "invalid" })
      expect(serviceMock.createCustomer).not.toHaveBeenCalled()
      expect(updateTagMock).not.toHaveBeenCalled()
    })

    it("returns invalid and creates nothing when the submitted status is any other value", async () => {
      await expect(
        createCustomerAction(makeFormData({ ...validCreateForm, status: "Archived" }))
      ).resolves.toEqual({ ok: false, reason: "invalid" })
      expect(serviceMock.createCustomer).not.toHaveBeenCalled()
    })

    it("creates the customer with the trimmed fields and the literal Active status, then expires the list, ticket list and reference tags", async () => {
      const created = { ok: true, customer: { id: "customer-new" } }
      serviceMock.createCustomer.mockResolvedValue(created)

      await expect(createCustomerAction(makeFormData(validCreateForm))).resolves.toBe(created)

      expect(serviceMock.createCustomer).toHaveBeenCalledWith(
        {
          name: "Ana Rossi",
          company: "Acme",
          email: "Ana@Acme.com",
          phone: null,
          notes: null,
        },
        "Active"
      )
      expect(updateTagMock.mock.calls.map((call) => call[0])).toEqual([
        customerListTag(),
        ticketListTag(),
        ticketReferenceTag(),
      ])
    })

    it("returns the duplicate result and expires no tag", async () => {
      const duplicate = { ok: false, reason: "duplicate" }
      serviceMock.createCustomer.mockResolvedValue(duplicate)

      await expect(createCustomerAction(makeFormData(validCreateForm))).resolves.toBe(duplicate)
      expect(updateTagMock).not.toHaveBeenCalled()
    })

    it("returns the reactivation result with its matches and expires no tag", async () => {
      const reactivation = {
        ok: false,
        reason: "reactivation",
        matches: [{ id: "customer-old" }],
      }
      serviceMock.createCustomer.mockResolvedValue(reactivation)

      await expect(createCustomerAction(makeFormData(validCreateForm))).resolves.toBe(reactivation)
      expect(updateTagMock).not.toHaveBeenCalled()
    })

    it("propagates an error raised by the access resolver and writes nothing", async () => {
      accessMock.mockRejectedValue(new Error("session store unavailable"))

      await expect(createCustomerAction(makeFormData(validCreateForm))).rejects.toThrow(
        "session store unavailable"
      )
      expect(serviceMock.createCustomer).not.toHaveBeenCalled()
    })
  })

  describe("updateCustomerAction", () => {
    it("returns forbidden without customers:write, before any read or write", async () => {
      grantPermissions([MANAGE])

      await expect(updateCustomerAction(makeFormData(validUpdateForm))).resolves.toEqual({
        ok: false,
        reason: "forbidden",
      })
      expect(serviceMock.getCustomerById).not.toHaveBeenCalled()
      expect(serviceMock.updateCustomer).not.toHaveBeenCalled()
    })

    it("returns invalid when the customer id is empty", async () => {
      await expect(
        updateCustomerAction(makeFormData({ ...validUpdateForm, customerId: "   " }))
      ).resolves.toEqual({ ok: false, reason: "invalid" })
      expect(serviceMock.updateCustomer).not.toHaveBeenCalled()
    })

    it("returns not-found and changes nothing when no customer has the id", async () => {
      serviceMock.getCustomerById.mockResolvedValue(null)

      await expect(updateCustomerAction(makeFormData(validUpdateForm))).resolves.toEqual({
        ok: false,
        reason: "not-found",
      })
      expect(serviceMock.getCustomerById).toHaveBeenCalledWith("customer-1")
      expect(serviceMock.updateCustomer).not.toHaveBeenCalled()
      expect(updateTagMock).not.toHaveBeenCalled()
    })

    it("updates with the trimmed fields and expires the list, detail, ticket list, reference and each linked ticket detail tags", async () => {
      serviceMock.getCustomerById.mockResolvedValue(existingCustomer)
      const updated = { ok: true, customer: { id: "customer-1" } }
      serviceMock.updateCustomer.mockResolvedValue(updated)

      await expect(updateCustomerAction(makeFormData(validUpdateForm))).resolves.toBe(updated)

      expect(serviceMock.updateCustomer).toHaveBeenCalledWith("customer-1", {
        name: "Ana Rossi",
        company: "Acme",
        email: "Ana@Acme.com",
        phone: "555",
        notes: "VIP",
      })
      expect(updateTagMock.mock.calls.map((call) => call[0])).toEqual([
        customerListTag(),
        customerDetailTag("customer-1"),
        ticketListTag(),
        ticketReferenceTag(),
        ticketDetailTag("ticket-1"),
        ticketDetailTag("ticket-2"),
      ])
    })

    it("stores null for blank phone and notes", async () => {
      serviceMock.getCustomerById.mockResolvedValue(existingCustomer)
      serviceMock.updateCustomer.mockResolvedValue({ ok: true, customer: { id: "customer-1" } })

      await updateCustomerAction(makeFormData({ ...validUpdateForm, phone: "   ", notes: "" }))

      expect(serviceMock.updateCustomer).toHaveBeenCalledWith(
        "customer-1",
        expect.objectContaining({ phone: null, notes: null })
      )
    })

    it("returns the duplicate result and expires no tag", async () => {
      serviceMock.getCustomerById.mockResolvedValue(existingCustomer)
      const duplicate = { ok: false, reason: "duplicate" }
      serviceMock.updateCustomer.mockResolvedValue(duplicate)

      await expect(updateCustomerAction(makeFormData(validUpdateForm))).resolves.toBe(duplicate)
      expect(updateTagMock).not.toHaveBeenCalled()
    })

    it("propagates a read error from the service", async () => {
      serviceMock.getCustomerById.mockRejectedValue(new Error("query failed"))

      await expect(updateCustomerAction(makeFormData(validUpdateForm))).rejects.toThrow("query failed")
      expect(serviceMock.updateCustomer).not.toHaveBeenCalled()
    })
  })

  describe("changeCustomerStatusAction", () => {
    it("returns forbidden with only customers:write, and changes nothing", async () => {
      grantPermissions([WRITE])

      await expect(
        changeCustomerStatusAction(makeFormData({ customerId: "customer-1", action: "deactivate" }))
      ).resolves.toEqual({ ok: false, reason: "forbidden" })
      expect(serviceMock.getCustomerById).not.toHaveBeenCalled()
      expect(serviceMock.deactivateCustomer).not.toHaveBeenCalled()
      expect(serviceMock.reactivateCustomer).not.toHaveBeenCalled()
      expect(updateTagMock).not.toHaveBeenCalled()
    })

    it("returns invalid when the customer id is empty", async () => {
      await expect(
        changeCustomerStatusAction(makeFormData({ customerId: " ", action: "deactivate" }))
      ).resolves.toEqual({ ok: false, reason: "invalid" })
      expect(serviceMock.deactivateCustomer).not.toHaveBeenCalled()
    })

    it("trims a padded customer id before the lookup and the status change", async () => {
      serviceMock.getCustomerById.mockResolvedValue(existingCustomer)
      serviceMock.deactivateCustomer.mockResolvedValue({ ok: true })

      await expect(
        changeCustomerStatusAction(makeFormData({ customerId: "  customer-1  ", action: "deactivate" }))
      ).resolves.toEqual({ ok: true })

      expect(serviceMock.getCustomerById).toHaveBeenCalledWith("customer-1")
      expect(serviceMock.deactivateCustomer).toHaveBeenCalledWith("customer-1")
      expect(updateTagMock).toHaveBeenCalledWith(customerDetailTag("customer-1"))
    })

    it("returns invalid when the action is neither deactivate nor reactivate", async () => {
      serviceMock.getCustomerById.mockResolvedValue(existingCustomer)

      await expect(
        changeCustomerStatusAction(makeFormData({ customerId: "customer-1", action: "delete" }))
      ).resolves.toEqual({ ok: false, reason: "invalid" })
      expect(serviceMock.deactivateCustomer).not.toHaveBeenCalled()
      expect(serviceMock.reactivateCustomer).not.toHaveBeenCalled()
      expect(updateTagMock).not.toHaveBeenCalled()
    })

    it("returns not-found and changes nothing when no customer has the id", async () => {
      serviceMock.getCustomerById.mockResolvedValue(null)

      await expect(
        changeCustomerStatusAction(makeFormData({ customerId: "missing", action: "deactivate" }))
      ).resolves.toEqual({ ok: false, reason: "not-found" })
      expect(serviceMock.deactivateCustomer).not.toHaveBeenCalled()
      expect(updateTagMock).not.toHaveBeenCalled()
    })

    it("dispatches deactivate to deactivateCustomer and expires the same tags as the update action on success", async () => {
      serviceMock.getCustomerById.mockResolvedValue(existingCustomer)
      serviceMock.deactivateCustomer.mockResolvedValue({ ok: true })

      await expect(
        changeCustomerStatusAction(makeFormData({ customerId: "customer-1", action: "deactivate" }))
      ).resolves.toEqual({ ok: true })

      expect(serviceMock.deactivateCustomer).toHaveBeenCalledWith("customer-1")
      expect(serviceMock.reactivateCustomer).not.toHaveBeenCalled()
      expect(updateTagMock.mock.calls.map((call) => call[0])).toEqual([
        customerListTag(),
        customerDetailTag("customer-1"),
        ticketListTag(),
        ticketReferenceTag(),
        ticketDetailTag("ticket-1"),
        ticketDetailTag("ticket-2"),
      ])
    })

    it("dispatches reactivate to reactivateCustomer", async () => {
      serviceMock.getCustomerById.mockResolvedValue(existingCustomer)
      serviceMock.reactivateCustomer.mockResolvedValue({ ok: true, customer: { id: "customer-1" } })

      await changeCustomerStatusAction(makeFormData({ customerId: "customer-1", action: "reactivate" }))

      expect(serviceMock.reactivateCustomer).toHaveBeenCalledWith("customer-1")
      expect(serviceMock.deactivateCustomer).not.toHaveBeenCalled()
    })

    it("returns the critical-ticket result and expires no tag", async () => {
      serviceMock.getCustomerById.mockResolvedValue(existingCustomer)
      serviceMock.deactivateCustomer.mockResolvedValue({ ok: false, reason: "critical-ticket" })

      await expect(
        changeCustomerStatusAction(makeFormData({ customerId: "customer-1", action: "deactivate" }))
      ).resolves.toEqual({ ok: false, reason: "critical-ticket" })
      expect(updateTagMock).not.toHaveBeenCalled()
    })

    it("propagates an error raised by the access resolver", async () => {
      accessMock.mockRejectedValue(new Error("session store unavailable"))

      await expect(
        changeCustomerStatusAction(makeFormData({ customerId: "customer-1", action: "deactivate" }))
      ).rejects.toThrow("session store unavailable")
      expect(serviceMock.deactivateCustomer).not.toHaveBeenCalled()
    })
  })

  describe("findDeactivatedMatchesAction", () => {
    it("returns forbidden without customers:write and performs no lookup", async () => {
      grantPermissions([permissionKey("customers", "read")])

      await expect(findDeactivatedMatchesAction("Acme", "ana@acme.com")).resolves.toEqual({
        ok: false,
        reason: "forbidden",
      })
      expect(serviceMock.getDeactivatedCustomerMatches).not.toHaveBeenCalled()
    })

    it("returns ok with an empty list and performs no lookup when the company is blank", async () => {
      await expect(findDeactivatedMatchesAction("   ", "ana@acme.com")).resolves.toEqual({
        ok: true,
        matches: [],
      })
      expect(serviceMock.getDeactivatedCustomerMatches).not.toHaveBeenCalled()
    })

    it("returns ok with an empty list and performs no lookup when the email is blank", async () => {
      await expect(findDeactivatedMatchesAction("Acme", "  ")).resolves.toEqual({
        ok: true,
        matches: [],
      })
      expect(serviceMock.getDeactivatedCustomerMatches).not.toHaveBeenCalled()
    })

    it("looks up the trimmed company and the lowercased email and returns the matches", async () => {
      const matches = [{ id: "customer-old", status: "Deactivated" }]
      serviceMock.getDeactivatedCustomerMatches.mockResolvedValue(matches)

      await expect(findDeactivatedMatchesAction("  Acme ", " Ana@ACME.com ")).resolves.toEqual({
        ok: true,
        matches,
      })
      expect(serviceMock.getDeactivatedCustomerMatches).toHaveBeenCalledWith("Acme", "ana@acme.com")
      expect(updateTagMock).not.toHaveBeenCalled()
    })

    it("propagates a lookup failure from the service", async () => {
      serviceMock.getDeactivatedCustomerMatches.mockRejectedValue(new Error("lookup failed"))

      await expect(findDeactivatedMatchesAction("Acme", "ana@acme.com")).rejects.toThrow("lookup failed")
    })
  })
})
