"use server"

import { customerDetailTag, customerListTag } from "@/app/(dashboard)/customers/_lib/cache-tags"
import { requireCurrentApplicationAccess } from "@/app/(dashboard)/admin/_lib/current-application-user"
import { hasPermission } from "@/lib/access-control"
import {
  createCustomer,
  deactivateCustomer,
  getCustomerById,
  getDeactivatedCustomerMatches,
  reactivateCustomer,
  updateCustomer,
} from "@/lib/customers/service"
import { ticketDetailTag, ticketListTag, ticketReferenceTag } from "@/app/(dashboard)/tickets/_lib/cache-tags"
import { updateTag } from "next/cache"

export async function createCustomerAction(formData: FormData) {
  const access = await requireCurrentApplicationAccess()
  if (!hasPermission(new Set(access.effectivePermissionKeys), "customers", "write")) return { ok: false, reason: "forbidden" as const }
  if (readString(formData, "status") !== "Active") return { ok: false, reason: "invalid" as const }
  const result = await createCustomer(readCustomerInput(formData), "Active")
  if (result.ok) {
    updateTag(customerListTag())
    updateTag(ticketListTag())
    updateTag(ticketReferenceTag())
  }
  return result
}

export async function updateCustomerAction(formData: FormData) {
  const access = await requireCurrentApplicationAccess()
  if (!hasPermission(new Set(access.effectivePermissionKeys), "customers", "manage")) return { ok: false, reason: "forbidden" as const }
  const id = readString(formData, "customerId")
  if (!id) return { ok: false, reason: "invalid" as const }
  const current = await getCustomerById(id)
  if (!current) return { ok: false, reason: "not-found" as const }
  const result = await updateCustomer(id, readCustomerInput(formData))
  if (result.ok) {
    updateTag(customerListTag())
    updateTag(customerDetailTag(id))
    updateTag(ticketListTag())
    updateTag(ticketReferenceTag())
    for (const ticket of current.tickets) updateTag(ticketDetailTag(ticket.id))
  }
  return result
}

export async function changeCustomerStatusAction(formData: FormData) {
  const access = await requireCurrentApplicationAccess()
  if (!hasPermission(new Set(access.effectivePermissionKeys), "customers", "manage")) return { ok: false, reason: "forbidden" as const }
  const id = readString(formData, "customerId")
  if (!id) return { ok: false, reason: "invalid" as const }
  const current = await getCustomerById(id)
  if (!current) return { ok: false, reason: "not-found" as const }
  const action = readString(formData, "action")
  const result = action === "deactivate" ? await deactivateCustomer(id) : action === "reactivate" ? await reactivateCustomer(id) : { ok: false as const, reason: "invalid" as const }
  if (result.ok) {
    updateTag(customerListTag())
    updateTag(customerDetailTag(id))
    updateTag(ticketListTag())
    updateTag(ticketReferenceTag())
    for (const ticket of current.tickets) updateTag(ticketDetailTag(ticket.id))
  }
  return result
}

function readString(formData: FormData, key: string) {
  const value = formData.get(key)
  return typeof value === "string" ? value.trim() : ""
}

function readCustomerInput(formData: FormData) {
  const phone = readString(formData, "phone")
  const notes = readString(formData, "notes")
  return {
    name: readString(formData, "name"),
    company: readString(formData, "company"),
    email: readString(formData, "email"),
    phone: phone || null,
    notes: notes || null,
  }
}

export async function findDeactivatedMatchesAction(
  company: string,
  email: string
): Promise<
  | { ok: true; matches: Awaited<ReturnType<typeof getDeactivatedCustomerMatches>> }
  | { ok: false; reason: "forbidden" }
> {
  const access = await requireCurrentApplicationAccess()
  if (!hasPermission(new Set(access.effectivePermissionKeys), "customers", "write")) return { ok: false, reason: "forbidden" }
  const trimmedCompany = company.trim()
  const normalizedEmail = email.trim().toLowerCase()
  if (!trimmedCompany || !normalizedEmail) return { ok: true, matches: [] }
  return { ok: true, matches: await getDeactivatedCustomerMatches(trimmedCompany, normalizedEmail) }
}
