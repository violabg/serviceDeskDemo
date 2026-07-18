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
  getTicketById,
  isIntakeChannel,
  isTicketCategory,
  isTicketPriority,
  isTicketStatus,
  updateTicketPriority,
  updateTicketStatus,
} from "@/lib/tickets/service"
import { revalidateTag } from "next/cache"
import { redirect } from "next/navigation"

type TicketActionResult = {
  success: boolean
  error?: string
}

function getFormString(formData: FormData, name: string) {
  const value = formData.get(name)

  return typeof value === "string" ? value.trim() : ""
}

function getOptionalFormString(formData: FormData, name: string) {
  const value = getFormString(formData, name)

  return value ? value : null
}

function forbiddenResult(): TicketActionResult {
  return {
    success: false,
    error: "Forbidden",
  }
}

function isWriteAllowed(effectivePermissions: ReadonlySet<string>) {
  return hasPermission(effectivePermissions, "tickets", "write")
}

function isManageAllowed(effectivePermissions: ReadonlySet<string>) {
  return hasPermission(effectivePermissions, "tickets", "manage")
}

export async function createTicketAction(formData: FormData) {
  const access = await requireCurrentApplicationAccess()
  const effectivePermissions = new Set(access.effectivePermissionKeys)

  if (!isWriteAllowed(effectivePermissions)) {
    return
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
    return
  }

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

  revalidateTag(ticketListTag(access.user.id), "max")
  revalidateTag(ticketDetailTag(access.user.id, ticket.id), "max")
  redirect(`/tickets/${ticket.id}`)
}

export async function checkDuplicateTicketAction(formData: FormData) {
  const access = await requireCurrentApplicationAccess()
  const effectivePermissions = new Set(access.effectivePermissionKeys)

  if (!isWriteAllowed(effectivePermissions)) {
    return {
      ...forbiddenResult(),
      duplicate: false,
    }
  }

  const customerId = getFormString(formData, "customerId")
  const title = getFormString(formData, "title")
  const duplicate = await checkDuplicateTicket(customerId, title)

  return {
    success: true,
    duplicate,
  }
}

export async function updateTicketStatusAction(formData: FormData) {
  const access = await requireCurrentApplicationAccess()
  const effectivePermissions = new Set(access.effectivePermissionKeys)
  const ticketId = getFormString(formData, "ticketId")
  const status = getFormString(formData, "status")

  if (!ticketId || !isTicketStatus(status)) {
    return
  }

  const currentTicket = await getTicketById(ticketId)

  if (!currentTicket) {
    return
  }

  const isReopen = currentTicket.status === "Closed" && status === "Open"

  if (isReopen) {
    if (!isManageAllowed(effectivePermissions)) {
      return
    }
  } else if (!isWriteAllowed(effectivePermissions)) {
    return
  }

  await updateTicketStatus(ticketId, status, access.user.id)

  revalidateTag(ticketDetailTag(access.user.id, ticketId), "max")
  revalidateTag(ticketListTag(access.user.id), "max")

}

export async function updateTicketPriorityAction(formData: FormData) {
  const access = await requireCurrentApplicationAccess()
  const effectivePermissions = new Set(access.effectivePermissionKeys)

  if (!isWriteAllowed(effectivePermissions)) {
    return
  }

  const ticketId = getFormString(formData, "ticketId")
  const priority = getFormString(formData, "priority")

  if (!ticketId || !isTicketPriority(priority)) {
    return
  }

  await updateTicketPriority(ticketId, priority, access.user.id)

  revalidateTag(ticketDetailTag(access.user.id, ticketId), "max")
  revalidateTag(ticketListTag(access.user.id), "max")

}

export async function assignTechnicianAction(formData: FormData) {
  const access = await requireCurrentApplicationAccess()
  const effectivePermissions = new Set(access.effectivePermissionKeys)

  if (!isWriteAllowed(effectivePermissions)) {
    return
  }

  const ticketId = getFormString(formData, "ticketId")
  const technicianId = getOptionalFormString(formData, "technicianId")

  if (!ticketId) {
    return
  }

  await assignTechnician(ticketId, technicianId, access.user.id)

  revalidateTag(ticketDetailTag(access.user.id, ticketId), "max")
  revalidateTag(ticketListTag(access.user.id), "max")

}

export async function addTicketNoteAction(formData: FormData) {
  const access = await requireCurrentApplicationAccess()
  const effectivePermissions = new Set(access.effectivePermissionKeys)

  if (!isWriteAllowed(effectivePermissions)) {
    return
  }

  const ticketId = getFormString(formData, "ticketId")
  const content = getFormString(formData, "content")

  if (!ticketId || !content) {
    return
  }

  await addTicketNote(ticketId, content, access.user.id)

  revalidateTag(ticketDetailTag(access.user.id, ticketId), "max")
  revalidateTag(ticketListTag(access.user.id), "max")

}
