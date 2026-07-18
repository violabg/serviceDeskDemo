import { adminRoleDetailTag } from "@/app/(dashboard)/admin/_lib/cache-tags"
import { requireCurrentApplicationAccess } from "@/app/(dashboard)/admin/_lib/current-application-user"
import { updateRoleAction } from "@/app/(dashboard)/admin/actions"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import {
  ACCESS_OPERATIONS,
  hasPermission,
  permissionKey,
} from "@/lib/access-control"
import { getRoleForManagement } from "@/lib/access-control/server"
import { cacheLife, cacheTag } from "next/cache"
import { redirect } from "next/navigation"
import { Suspense } from "react"

const operationOrder = new Map<string, number>(
  ACCESS_OPERATIONS.map((operation, index) => [operation, index])
)

async function getRoleDetailData(actorUserId: string, roleId: string) {
  "use cache"

  cacheLife("days")
  cacheTag(adminRoleDetailTag(actorUserId, roleId))

  return getRoleForManagement({
    actorUserId,
    roleId,
  })
}

export default function RoleDetailPage({
  params,
}: {
  params: Promise<{ roleId: string }>
}) {
  return (
    <main className="flex flex-1 flex-col gap-6 p-4 pt-0">
      <div className="space-y-1">
        <p className="text-sm font-medium text-muted-foreground">Roles</p>
      </div>
      <Suspense fallback={<RoleDetailPageSkeleton />}>
        <RoleDetailPageContent params={params} />
      </Suspense>
    </main>
  )
}

async function RoleDetailPageContent({
  params,
}: {
  params: Promise<{ roleId: string }>
}) {
  const [{ roleId }, access] = await Promise.all([
    params,
    requireCurrentApplicationAccess(),
  ])
  const permissions = new Set(access.effectivePermissionKeys)

  if (!hasPermission(permissions, "roles", "read")) {
    redirect("/dashboard")
  }

  const canWriteRoles = hasPermission(permissions, "roles", "write")

  return (
    <RoleDetailContent
      actorUserId={access.user.id}
      roleId={roleId}
      canWriteRoles={canWriteRoles}
    />
  )
}

function RoleDetailPageSkeleton() {
  return <RoleDetailContentSkeleton />
}

async function RoleDetailContent({
  actorUserId,
  roleId,
  canWriteRoles,
}: {
  actorUserId: string
  roleId: string
  canWriteRoles: boolean
}) {
  const {
    role,
    permissions: availablePermissions,
    sections,
  } = await getRoleDetailData(actorUserId, roleId)
  const assignedPermissionIds = new Set(
    role.permissions.map(({ permissionId }) => permissionId)
  )
  const canEditRole = canWriteRoles && !role.isSystem

  return (
    <>
      <div className="space-y-1">
        <h1 className="font-heading text-3xl font-semibold tracking-normal">
          {role.name}
        </h1>
        <p className="text-sm text-muted-foreground">
          {role.description || "No description"}
        </p>
      </div>
      {role.isSystem ? (
        <div className="rounded-lg border bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
          System roles are read-only to keep bootstrap access stable.
        </div>
      ) : null}
      {!canWriteRoles ? (
        <div className="rounded-lg border bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
          You have read-only role access.
        </div>
      ) : null}
      <form action={updateRoleAction} className="grid gap-4">
        <input type="hidden" name="roleId" value={role.id} />
        <section className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
          <h2 className="font-heading text-lg font-semibold tracking-normal">
            Details
          </h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="role-name">Name</FieldLabel>
              <Input id="role-name" defaultValue={role.name} disabled />
            </Field>
            <Field className="md:col-span-2">
              <FieldLabel htmlFor="role-description">Description</FieldLabel>
              <Textarea
                id="role-description"
                name="description"
                defaultValue={role.description ?? ""}
                disabled={!canEditRole}
                className="min-h-24"
              />
            </Field>
          </div>
        </section>
        <section className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-heading text-lg font-semibold tracking-normal">
              Permissions
            </h2>
            <p className="text-sm text-muted-foreground">
              {role.permissions.length} assigned
            </p>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {sections.map((section) => {
              const sectionPermissions = availablePermissions
                .filter((permission) => permission.section === section)
                .sort(
                  (left, right) =>
                    (operationOrder.get(left.operation) ??
                      ACCESS_OPERATIONS.length) -
                    (operationOrder.get(right.operation) ??
                      ACCESS_OPERATIONS.length)
                )

              if (sectionPermissions.length === 0) {
                return null
              }

              return (
                <FieldSet key={section} className="rounded-md border p-3">
                  <FieldLegend variant="label">{section}</FieldLegend>
                  <div className="mt-2 grid gap-2">
                    {sectionPermissions.map((permission) => (
                      <Field
                        key={permission.id}
                        orientation="horizontal"
                        className="gap-2"
                      >
                        <Checkbox
                          id={`role-permission-${permission.id}`}
                          name="permissionIds"
                          value={permission.id}
                          defaultChecked={assignedPermissionIds.has(
                            permission.id
                          )}
                          disabled={!canEditRole}
                        />
                        <FieldLabel
                          htmlFor={`role-permission-${permission.id}`}
                        >
                          {permissionKey(
                            permission.section,
                            permission.operation
                          )}
                        </FieldLabel>
                      </Field>
                    ))}
                  </div>
                </FieldSet>
              )
            })}
          </div>
        </section>
        {canEditRole ? (
          <div>
            <Button type="submit">Save Role</Button>
          </div>
        ) : null}
      </form>
    </>
  )
}

function RoleDetailContentSkeleton() {
  return (
    <div className="grid gap-4">
      <div className="space-y-2">
        <Skeleton className="h-9 w-56" />
        <Skeleton className="h-4 w-72" />
      </div>
      <section className="rounded-lg border bg-card p-4">
        <div className="space-y-3">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </section>
      <section className="rounded-lg border bg-card p-4">
        <div className="space-y-3">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-9 w-28" />
        </div>
      </section>
    </div>
  )
}
