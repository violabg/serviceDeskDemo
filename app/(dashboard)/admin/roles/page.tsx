import { adminRolesListTag } from "@/app/(dashboard)/admin/_lib/cache-tags"
import { requireCurrentApplicationAccess } from "@/app/(dashboard)/admin/_lib/current-application-user"
import { createRoleAction } from "@/app/(dashboard)/admin/actions"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import {
  ACCESS_OPERATIONS,
  ACCESS_SECTIONS,
  hasPermission,
  permissionKey,
} from "@/lib/access-control"
import { getRolesForManagement } from "@/lib/access-control/server"
import { prisma } from "@/lib/prisma"
import { cacheLife, cacheTag } from "next/cache"
import Link from "next/link"
import { redirect } from "next/navigation"
import { Suspense } from "react"

const operationOrder = new Map<string, number>(
  ACCESS_OPERATIONS.map((operation, index) => [operation, index])
)

async function getRolesData(actorUserId: string) {
  "use cache"

  cacheLife("days")
  cacheTag(adminRolesListTag(actorUserId))

  return getRolesForManagement({ actorUserId })
}

async function getAvailablePermissions(
  actorUserId: string,
  canWriteRoles: boolean
) {
  "use cache"

  cacheLife("days")
  cacheTag(adminRolesListTag(actorUserId))

  if (!canWriteRoles) {
    return []
  }

  return prisma.permission.findMany({
    orderBy: [{ section: "asc" }, { operation: "asc" }],
  })
}

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

export default function RolesPage() {
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
      <Suspense fallback={<RolesContentSkeleton />}>
        <RolesPageContent />
      </Suspense>
    </main>
  )
}

async function RolesPageContent() {
  const access = await requireCurrentApplicationAccess()
  const permissions = new Set(access.effectivePermissionKeys)

  if (!hasPermission(permissions, "roles", "read")) {
    redirect("/dashboard")
  }

  const canWriteRoles = hasPermission(permissions, "roles", "write")

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_22rem]">
      <Suspense fallback={<RolesListSkeleton />}>
        <RolesListSection actorUserId={access.user.id} />
      </Suspense>
      <Suspense fallback={<CreateRoleSkeleton />}>
        <CreateRoleSection
          actorUserId={access.user.id}
          canWriteRoles={canWriteRoles}
        />
      </Suspense>
    </div>
  )
}

function RolesContentSkeleton() {
  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_22rem]">
      <RolesListSkeleton />
      <CreateRoleSkeleton />
    </div>
  )
}

async function RolesListSection({ actorUserId }: { actorUserId: string }) {
  const roles = await getRolesData(actorUserId)

  return (
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
                role.permissions.map(({ permission }) => permission)
              )
                .map((permission) =>
                  permissionKey(permission.section, permission.operation)
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
  )
}

async function CreateRoleSection({
  actorUserId,
  canWriteRoles,
}: {
  actorUserId: string
  canWriteRoles: boolean
}) {
  const availablePermissions = await getAvailablePermissions(
    actorUserId,
    canWriteRoles
  )

  return (
    <section className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
      <h2 className="font-heading text-lg font-semibold tracking-normal">
        Create Role
      </h2>
      {canWriteRoles ? (
        <form action={createRoleAction} className="mt-4 grid gap-3">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="create-role-name">
                Name <span className="text-destructive">*</span>
              </FieldLabel>
              <Input id="create-role-name" name="name" required />
            </Field>
            <Field>
              <FieldLabel htmlFor="create-role-description">
                Description
              </FieldLabel>
              <Textarea
                id="create-role-description"
                name="description"
                className="min-h-24"
              />
            </Field>
          </FieldGroup>
          <FieldSet className="rounded-md border p-3">
            <FieldLegend variant="label">Permissions</FieldLegend>
            {ACCESS_SECTIONS.map((section) => {
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
                <div key={section} className="grid gap-2">
                  <p className="text-xs font-medium text-muted-foreground">
                    {section}
                  </p>
                  <div className="grid gap-1.5">
                    {sectionPermissions.map((permission) => (
                      <Field
                        key={permission.id}
                        orientation="horizontal"
                        className="gap-2"
                      >
                        <Checkbox
                          id={`create-role-permission-${permission.id}`}
                          name="permissionIds"
                          value={permission.id}
                        />
                        <FieldLabel
                          htmlFor={`create-role-permission-${permission.id}`}
                        >
                          {permissionKey(
                            permission.section,
                            permission.operation
                          )}
                        </FieldLabel>
                      </Field>
                    ))}
                  </div>
                </div>
              )
            })}
          </FieldSet>
          <Button type="submit">Create Role</Button>
        </form>
      ) : (
        <p className="mt-4 text-sm text-muted-foreground">
          Read-only role access
        </p>
      )}
    </section>
  )
}

function RolesListSkeleton() {
  return (
    <section className="overflow-hidden rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
      <div className="space-y-3">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-14 w-full" />
      </div>
    </section>
  )
}

function CreateRoleSkeleton() {
  return (
    <section className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
      <div className="space-y-3">
        <Skeleton className="h-5 w-28" />
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-9 w-28" />
      </div>
    </section>
  )
}
