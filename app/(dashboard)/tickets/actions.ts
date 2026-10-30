"use server"

import { requireCurrentApplicationAccess } from "@/app/(dashboard)/admin/_lib/current-application-user"
import {
  ticketDetailTag,
  ticketListTag,
} from "@/app/(dashboard)/tickets/_lib/cache-tags"
import { hasPermission } from "@/lib/access-control"
import {
  addTicketNote,
  assignTechnician,
  checkDuplicateTicket,
  createTicket,
  getActiveCustomerById,
  getTicketById,
  isIntakeChannel,
  isTicketCategory,
  isTicketPriority,
  isTicketStatus,
  updateTicketPriority,
  updateTicketStatus,
} from "@/lib/tickets/service"
import { updateTag } from "next/cache"

type TicketActionFailureReason = "forbidden" | "invalid" | "not-found"

type FailureResult = {
  ok: false
  reason: TicketActionFailureReason
}

type TicketActionResult = { ok: true; reason: null } | FailureResult

type CreateTicketResult =
  | { ok: true; reason: null; ticketId: string }
  | FailureResult

type DuplicateCheckResult =
  | { ok: true; reason: null; duplicate: boolean }
  | (FailureResult & { duplicate: false })

function getFormString(formData: FormData, name: string) {
  const value = formData.get(name)

  return typeof value === "string" ? value.trim() : ""
}

function getOptionalFormString(formData: FormData, name: string) {
  const value = getFormString(formData, name)

  return value ? value : null
}

function failureResult(reason: TicketActionFailureReason): FailureResult {
  return { ok: false, reason }
}

function duplicateFailureResult(
  reason: TicketActionFailureReason
): DuplicateCheckResult {
  return { ok: false, reason, duplicate: false }
}

function successResult(): TicketActionResult {
  return { ok: true, reason: null }
}

function isWriteAllowed(effectivePermissions: ReadonlySet<string>) {
  return hasPermission(effectivePermissions, "tickets", "write")
}

function isManageAllowed(effectivePermissions: ReadonlySet<string>) {
  return hasPermission(effectivePermissions, "tickets", "manage")
}

export async function createTicketAction(
  formData: FormData
): Promise<CreateTicketResult> {
  const access = await requireCurrentApplicationAccess()
  const effectivePermissions = new Set(access.effectivePermissionKeys)

  if (!isWriteAllowed(effectivePermissions)) {
    return failureResult("forbidden")
  }

  const title = getFormString(formData, "title")
  const description = getFormString(formData, "description")
  const requesterContact = getFormString(formData, "requesterContact")
  const customerId = getFormString(formData, "customerId")
  const priority = getFormString(formData, "priority")
  const category = getFormString(formData, "category")
  const intakeChannel = getFormString(formData, "intakeChannel")
  const assetId = getOptionalFormString(formData, "assetId")
  const assignedToId = getOptionalFormString(formData, "assignedToId")

  if (
    !title ||
    !description ||
    !requesterContact ||
    !customerId ||
    !isTicketPriority(priority) ||
    !isTicketCategory(category) ||
    !isIntakeChannel(intakeChannel)
  ) {
    return failureResult("invalid")
  }

  const customer = await getActiveCustomerById(customerId)
  if (!customer) return failureResult("not-found")

  const ticket = await createTicket(
    {
      title,
      description,
      requesterContact,
      customerId,
      priority,
      category,
      intakeChannel,
      assetId,
      assignedToId,
    },
    access.user.id
  )

  updateTag(ticketListTag())

  return { ok: true, reason: null, ticketId: ticket.id }
}

export async function checkDuplicateTicketAction(
  formData: FormData
): Promise<DuplicateCheckResult> {
  const access = await requireCurrentApplicationAccess()
  const effectivePermissions = new Set(access.effectivePermissionKeys)

  if (!isWriteAllowed(effectivePermissions)) {
    return duplicateFailureResult("forbidden")
  }

  const customerId = getFormString(formData, "customerId")
  const title = getFormString(formData, "title")

  if (!customerId || !title) {
    return duplicateFailureResult("invalid")
  }

  const customer = await getActiveCustomerById(customerId)
  if (!customer) return duplicateFailureResult("not-found")

  const duplicate = await checkDuplicateTicket(customerId, title)

  return { ok: true, reason: null, duplicate }
}

export async function updateTicketStatusAction(
  formData: FormData
): Promise<TicketActionResult> {
  const access = await requireCurrentApplicationAccess()
  const effectivePermissions = new Set(access.effectivePermissionKeys)

  if (!isWriteAllowed(effectivePermissions)) {
    return failureResult("forbidden")
  }

  const ticketId = getFormString(formData, "ticketId")
  const status = getFormString(formData, "status")

  if (!ticketId || !isTicketStatus(status)) {
    return failureResult("invalid")
  }

  const currentTicket = await getTicketById(ticketId)

  if (!currentTicket) {
    return failureResult("not-found")
  }

  const isReopen = currentTicket.status === "Closed" && status === "Open"

  if (isReopen && !isManageAllowed(effectivePermissions)) {
    return failureResult("forbidden")
  }

  await updateTicketStatus(ticketId, status, access.user.id)

  updateTag(ticketDetailTag(ticketId))
  updateTag(ticketListTag())

  return successResult()
}

export async function updateTicketPriorityAction(
  formData: FormData
): Promise<TicketActionResult> {
  const access = await requireCurrentApplicationAccess()
  const effectivePermissions = new Set(access.effectivePermissionKeys)

  if (!isWriteAllowed(effectivePermissions)) {
    return failureResult("forbidden")
  }

  const ticketId = getFormString(formData, "ticketId")
  const priority = getFormString(formData, "priority")

  if (!ticketId || !isTicketPriority(priority)) {
    return failureResult("invalid")
  }

  const currentTicket = await getTicketById(ticketId)
  if (!currentTicket) return failureResult("not-found")

  await updateTicketPriority(ticketId, priority, access.user.id)

  updateTag(ticketDetailTag(ticketId))
  updateTag(ticketListTag())

  return successResult()
}

export async function assignTechnicianAction(
  formData: FormData
): Promise<TicketActionResult> {
  const access = await requireCurrentApplicationAccess()
  const effectivePermissions = new Set(access.effectivePermissionKeys)

  if (!isWriteAllowed(effectivePermissions)) {
    return failureResult("forbidden")
  }

  const ticketId = getFormString(formData, "ticketId")
  const rawTechnicianId = formData.get("technicianId")

  if (!ticketId || typeof rawTechnicianId !== "string") {
    return failureResult("invalid")
  }

  const technicianId = getOptionalFormString(formData, "technicianId")

  const currentTicket = await getTicketById(ticketId)
  if (!currentTicket) return failureResult("not-found")

  await assignTechnician(ticketId, technicianId, access.user.id)

  updateTag(ticketDetailTag(ticketId))
  updateTag(ticketListTag())

  return successResult()
}

export async function addTicketNoteAction(
  formData: FormData
): Promise<TicketActionResult> {
  const access = await requireCurrentApplicationAccess()
  const effectivePermissions = new Set(access.effectivePermissionKeys)

  if (!isWriteAllowed(effectivePermissions)) {
    return failureResult("forbidden")
  }

  const ticketId = getFormString(formData, "ticketId")
  const content = getFormString(formData, "content")

  if (!ticketId || !content) {
    return failureResult("invalid")
  }

  const currentTicket = await getTicketById(ticketId)
  if (!currentTicket) return failureResult("not-found")

  await addTicketNote(ticketId, content, access.user.id)

  updateTag(ticketDetailTag(ticketId))

  return successResult()
}
