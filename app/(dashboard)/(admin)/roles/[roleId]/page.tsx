import { updateRoleAction } from "@/app/(dashboard)/(admin)/actions"
import { adminRoleDetailTag } from "@/app/(dashboard)/admin/_lib/cache-tags"
import { requireCurrentApplicationAccess } from "@/app/(dashboard)/admin/_lib/current-application-user"
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
    <main className="flex flex-col flex-1 gap-6 p-4 pt-0">
      <div className="space-y-1">
        <p className="font-medium text-muted-foreground text-sm">Roles</p>
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
        <h1 className="font-heading font-semibold text-3xl tracking-normal">
          {role.name}
        </h1>
        <p className="text-muted-foreground text-sm">
          {role.description || "No description"}
        </p>
      </div>
      {role.isSystem ? (
        <div className="bg-muted/50 px-4 py-3 border rounded-lg text-muted-foreground text-sm">
          System roles are read-only to keep bootstrap access stable.
        </div>
      ) : null}
      {!canWriteRoles ? (
        <div className="bg-muted/50 px-4 py-3 border rounded-lg text-muted-foreground text-sm">
          You have read-only role access.
        </div>
      ) : null}
      <form action={updateRoleAction} className="gap-4 grid">
        <input type="hidden" name="roleId" value={role.id} />
        <section className="bg-card shadow-sm p-4 border rounded-lg text-card-foreground">
          <h2 className="font-heading font-semibold text-lg tracking-normal">
            Details
          </h2>
          <div className="gap-3 grid md:grid-cols-2 mt-4">
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
        <section className="bg-card shadow-sm p-4 border rounded-lg text-card-foreground">
          <div className="flex justify-between items-center gap-4">
            <h2 className="font-heading font-semibold text-lg tracking-normal">
              Permissions
            </h2>
            <p className="text-muted-foreground text-sm">
              {role.permissions.length} assigned
            </p>
          </div>
          <div className="gap-4 grid md:grid-cols-2 xl:grid-cols-3 mt-4">
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
                <FieldSet key={section} className="p-3 border rounded-md">
                  <FieldLegend variant="label">{section}</FieldLegend>
                  <div className="gap-2 grid mt-2">
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
    <div className="gap-4 grid">
      <div className="space-y-2">
        <Skeleton className="w-56 h-9" />
        <Skeleton className="w-72 h-4" />
      </div>
      <section className="bg-card p-4 border rounded-lg">
        <div className="space-y-3">
          <Skeleton className="w-24 h-5" />
          <Skeleton className="w-full h-9" />
          <Skeleton className="w-full h-24" />
        </div>
      </section>
      <section className="bg-card p-4 border rounded-lg">
        <div className="space-y-3">
          <Skeleton className="w-32 h-5" />
          <Skeleton className="w-full h-24" />
          <Skeleton className="w-full h-24" />
          <Skeleton className="w-28 h-9" />
        </div>
      </section>
    </div>
  )
}
