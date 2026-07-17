import { requireCurrentApplicationAccess } from "@/app/(dashboard)/admin/_lib/current-application-user"
import { createRoleAction } from "@/app/(dashboard)/admin/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  ACCESS_OPERATIONS,
  ACCESS_SECTIONS,
  hasPermission,
  permissionKey,
} from "@/lib/access-control"
import { getRolesForManagement } from "@/lib/access-control/server"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

const operationOrder = new Map<string, number>(
  ACCESS_OPERATIONS.map((operation, index) => [operation, index]),
)

function sortPermissionsByAccessModel<
  TPermission extends { section: string; operation: string },
>(permissions: TPermission[]) {
  return [...permissions].sort((left, right) => {
    const sectionSort = left.section.localeCompare(right.section)

    if (sectionSort !== 0) {
      return sectionSort
    }

    return (
      (operationOrder.get(left.operation) ?? ACCESS_OPERATIONS.length) -
      (operationOrder.get(right.operation) ?? ACCESS_OPERATIONS.length)
    )
  })
}

export default async function RolesPage() {
  const access = await requireCurrentApplicationAccess()
  const permissions = new Set(access.effectivePermissionKeys)

  if (!hasPermission(permissions, "roles", "read")) {
    redirect("/dashboard")
  }

  const canWriteRoles = hasPermission(permissions, "roles", "write")
  const [roles, availablePermissions] = await Promise.all([
    getRolesForManagement({ actorUserId: access.user.id }),
    canWriteRoles
      ? prisma.permission.findMany({
          orderBy: [{ section: "asc" }, { operation: "asc" }],
        })
      : Promise.resolve([]),
  ])

  return (
    <main className="flex flex-1 flex-col gap-6 p-4 pt-0">
      <div className="space-y-1">
        <p className="text-sm font-medium text-muted-foreground">
          Administration
        </p>
        <h1 className="font-heading text-3xl font-semibold tracking-normal">
          Roles
        </h1>
      </div>
      <div className="grid gap-4 lg:grid-cols-[1fr_22rem]">
        <section className="overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="grid grid-cols-[1fr_1fr_auto] gap-4 border-b bg-muted/50 px-4 py-3 text-sm font-medium text-muted-foreground">
            <span>Role</span>
            <span>Permissions</span>
            <span className="sr-only">Open</span>
          </div>
          <div className="divide-y">
            {roles.map((role) => (
              <article
                key={role.id}
                className="grid grid-cols-[1fr_1fr_auto] items-center gap-4 px-4 py-3 text-sm"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">
                    {role.name}
                    {role.isSystem ? (
                      <>
                        {" "}
                        <span className="rounded-md bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                          System
                        </span>
                      </>
                    ) : null}
                  </p>
                  <p className="truncate text-muted-foreground">
                    {role.description || "No description"}
                  </p>
                </div>
                <p className="truncate text-muted-foreground">
                  {sortPermissionsByAccessModel(
                    role.permissions.map(({ permission }) => permission),
                  )
                    .map((permission) =>
                      permissionKey(permission.section, permission.operation),
                    )
                    .join(", ") || "No permissions"}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  render={<Link href={`/admin/roles/${role.id}`} />}
                  nativeButton={false}
                >
                  Open
                </Button>
              </article>
            ))}
          </div>
        </section>
        <section className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
          <h2 className="font-heading text-lg font-semibold tracking-normal">
            Create Role
          </h2>
          {canWriteRoles ? (
            <form action={createRoleAction} className="mt-4 grid gap-3">
              <label className="grid gap-1.5 text-sm font-medium">
                Name
                <Input name="name" required />
              </label>
              <label className="grid gap-1.5 text-sm font-medium">
                Description
                <textarea
                  name="description"
                  className="min-h-24 rounded-md border border-input bg-background px-2.5 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                />
              </label>
              <fieldset className="grid gap-3 rounded-md border p-3">
                <legend className="px-1 text-sm font-medium">
                  Permissions
                </legend>
                {ACCESS_SECTIONS.map((section) => {
                  const sectionPermissions = availablePermissions
                    .filter((permission) => permission.section === section)
                    .sort(
                      (left, right) =>
                        (operationOrder.get(left.operation) ??
                          ACCESS_OPERATIONS.length) -
                        (operationOrder.get(right.operation) ??
                          ACCESS_OPERATIONS.length),
                    )

                  if (sectionPermissions.length === 0) {
                    return null
                  }

                  return (
                    <div key={section} className="grid gap-2">
                      <p className="text-xs font-medium text-muted-foreground">
                        {section}
                      </p>
                      <div className="grid gap-1.5">
                        {sectionPermissions.map((permission) => (
                          <label
                            key={permission.id}
                            className="flex items-center gap-2 text-sm"
                          >
                            <input
                              type="checkbox"
                              name="permissionIds"
                              value={permission.id}
                              className="size-4 rounded border-input"
                            />
                            <span>
                              {permissionKey(
                                permission.section,
                                permission.operation,
                              )}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </fieldset>
              <Button type="submit">Create Role</Button>
            </form>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">
              Read-only role access
            </p>
          )}
        </section>
      </div>
    </main>
  )
}