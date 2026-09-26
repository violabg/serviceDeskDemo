"use server"

import {
  adminRoleDetailTag,
  adminRolesListTag,
  adminUserDetailTag,
  adminUserRoleOptionsTag,
  adminUsersListTag,
} from "@/app/(dashboard)/admin/_lib/cache-tags"
import { requireCurrentApplicationAccess } from "@/app/(dashboard)/admin/_lib/current-application-user"
import {
  assignRoleToUser,
  createRoleForManagement,
  removeRoleFromUser,
  updateRoleForManagement,
} from "@/lib/access-control/server"
import { updateTag } from "next/cache"
import { redirect } from "next/navigation"

function getFormString(formData: FormData, name: string) {
  const value = formData.get(name)

  return typeof value === "string" ? value : ""
}

export async function assignUserRoleAction(formData: FormData) {
  const access = await requireCurrentApplicationAccess()
  const targetUserId = getFormString(formData, "targetUserId")
  const roleId = getFormString(formData, "roleId")

  await assignRoleToUser({
    actorUserId: access.user.id,
    targetUserId,
    roleId,
  })

  updateTag(adminUserDetailTag(targetUserId))
  updateTag(adminUsersListTag())
}

export async function removeUserRoleAction(formData: FormData) {
  const access = await requireCurrentApplicationAccess()
  const targetUserId = getFormString(formData, "targetUserId")
  const roleId = getFormString(formData, "roleId")

  await removeRoleFromUser({
    actorUserId: access.user.id,
    targetUserId,
    roleId,
  })

  updateTag(adminUserDetailTag(targetUserId))
  updateTag(adminUsersListTag())
}

export async function createRoleAction(formData: FormData) {
  const access = await requireCurrentApplicationAccess()
  const role = await createRoleForManagement({
    actorUserId: access.user.id,
    name: getFormString(formData, "name"),
    description: getFormString(formData, "description"),
    permissionIds: formData
      .getAll("permissionIds")
      .filter((value): value is string => typeof value === "string"),
  })

  updateTag(adminRolesListTag())
  updateTag(adminUserRoleOptionsTag())
  redirect(`/roles/${role.id}`)
}

export async function updateRoleAction(formData: FormData) {
  const access = await requireCurrentApplicationAccess()
  const roleId = getFormString(formData, "roleId")
  const permissionIds = formData
    .getAll("permissionIds")
    .filter((value): value is string => typeof value === "string")

  await updateRoleForManagement({
    actorUserId: access.user.id,
    roleId,
    name: getFormString(formData, "name"),
    description: getFormString(formData, "description"),
    permissionIds,
  })

  updateTag(adminRolesListTag())
  updateTag(adminRoleDetailTag(roleId))
  updateTag(adminUserRoleOptionsTag())
}
