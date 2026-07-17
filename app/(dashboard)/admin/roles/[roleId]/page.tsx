import { requireCurrentApplicationAccess } from "@/app/(dashboard)/admin/_lib/current-application-user"
import { updateRoleAction } from "@/app/(dashboard)/admin/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  ACCESS_OPERATIONS,
  hasPermission,
  permissionKey,
} from "@/lib/access-control"
import { getRoleForManagement } from "@/lib/access-control/server"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

const operationOrder = new Map<string, number>(
  ACCESS_OPERATIONS.map((operation, index) => [operation, index])
)

export default async function RoleDetailPage({
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
  const {
    role,
    permissions: availablePermissions,
    sections,
  } = await getRoleForManagement({
    actorUserId: access.user.id,
    roleId,
  })
  const assignedPermissionIds = new Set(
    role.permissions.map(({ permissionId }) => permissionId)
  )
  const canEditRole = canWriteRoles && !role.isSystem

  return (
    <main className="flex flex-1 flex-col gap-6 p-4 pt-0">
      <div className="space-y-1">
        <p className="text-sm font-medium text-muted-foreground">Roles</p>
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
            <label className="grid gap-1.5 text-sm font-medium">
              Name
              <Input defaultValue={role.name} disabled />
            </label>
            <label className="grid gap-1.5 text-sm font-medium md:col-span-2">
              Description
              <textarea
                name="description"
                defaultValue={role.description ?? ""}
                disabled={!canEditRole}
                className="min-h-24 rounded-md border border-input bg-background px-2.5 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50"
              />
            </label>
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
                <fieldset key={section} className="rounded-md border p-3">
                  <legend className="px-1 text-sm font-medium">
                    {section}
                  </legend>
                  <div className="mt-2 grid gap-2">
                    {sectionPermissions.map((permission) => (
                      <label
                        key={permission.id}
                        className="flex items-center gap-2 text-sm"
                      >
                        <input
                          type="checkbox"
                          name="permissionIds"
                          value={permission.id}
                          defaultChecked={assignedPermissionIds.has(
                            permission.id
                          )}
                          disabled={!canEditRole}
                          className="size-4 rounded border-input"
                        />
                        <span>
                          {permissionKey(
                            permission.section,
                            permission.operation
                          )}
                        </span>
                      </label>
                    ))}
                  </div>
                </fieldset>
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
    </main>
  )
}
