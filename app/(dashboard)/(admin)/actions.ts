"use server"

import {
  adminRoleDetailTag,
  adminRolesListTag,
  adminUserDetailTag,
  adminUserRoleOptionsTag,
  adminUsersListTag,
} from "@/app/(dashboard)/admin/_lib/cache-tags"
import { requireCurrentApplicationAccess } from "@/app/(dashboard)/admin/_lib/current-application-user"
import { hasPermission } from "@/lib/access-control"
import {
  assignRoleToUser,
  createRoleForManagement,
  createUserForManagement,
  removeRoleFromUser,
  updateRoleForManagement,
} from "@/lib/access-control/server"
import { Prisma } from "@/lib/generated/prisma/client"
import { updateTag } from "next/cache"
import { redirect } from "next/navigation"

function getFormString(formData: FormData, name: string) {
  const value = formData.get(name)

  return typeof value === "string" ? value : ""
}

function isDuplicateEmailError(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  )
}

export async function createUserAction(formData: FormData) {
  const access = await requireCurrentApplicationAccess()

  if (
    !hasPermission(new Set(access.effectivePermissionKeys), "users", "write")
  ) {
    return { ok: false as const, reason: "forbidden" as const }
  }

  const name = getFormString(formData, "name").trim()
  const email = getFormString(formData, "email").trim()

  if (!email) {
    return { ok: false as const, reason: "invalid" as const }
  }

  const user = await createUserForManagement({
    actorUserId: access.user.id,
    name,
    email,
  }).catch((error: unknown) => {
    if (isDuplicateEmailError(error)) {
      return null
    }

    throw error
  })

  if (!user) {
    return { ok: false as const, reason: "duplicate" as const }
  }

  updateTag(adminUsersListTag())

  redirect(`/users/${user.id}`)
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
