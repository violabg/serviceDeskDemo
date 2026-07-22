import { createRoleAction } from "@/app/(dashboard)/(admin)/actions"
import { adminRolesListTag } from "@/app/(dashboard)/admin/_lib/cache-tags"
import { requireCurrentApplicationAccess } from "@/app/(dashboard)/admin/_lib/current-application-user"
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
    <main className="flex flex-col flex-1 gap-6 p-4 pt-0">
      <div className="space-y-1">
        <p className="font-medium text-muted-foreground text-sm">
          Administration
        </p>
        <h1 className="font-heading font-semibold text-3xl tracking-normal">
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
    <div className="gap-4 grid lg:grid-cols-[1fr_22rem]">
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
    <div className="gap-4 grid lg:grid-cols-[1fr_22rem]">
      <RolesListSkeleton />
      <CreateRoleSkeleton />
    </div>
  )
}

async function RolesListSection({ actorUserId }: { actorUserId: string }) {
  const roles = await getRolesData(actorUserId)

  return (
    <section className="bg-card shadow-sm border rounded-lg overflow-hidden text-card-foreground">
      <div className="gap-4 grid grid-cols-[1fr_1fr_auto] bg-muted/50 px-4 py-3 border-b font-medium text-muted-foreground text-sm">
        <span>Role</span>
        <span>Permissions</span>
        <span className="sr-only">Open</span>
      </div>
      <div className="divide-y">
        {roles.map((role) => (
          <article
            key={role.id}
            className="items-center gap-4 grid grid-cols-[1fr_1fr_auto] px-4 py-3 text-sm"
          >
            <div className="min-w-0">
              <p className="font-medium truncate">
                {role.name}
                {role.isSystem ? (
                  <>
                    {" "}
                    <span className="bg-muted px-1.5 py-0.5 rounded-md text-muted-foreground text-xs">
                      System
                    </span>
                  </>
                ) : null}
              </p>
              <p className="text-muted-foreground truncate">
                {role.description || "No description"}
              </p>
            </div>
            <p className="text-muted-foreground truncate">
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
              render={<Link href={`/roles/${role.id}`} />}
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
    <section className="bg-card shadow-sm p-4 border rounded-lg text-card-foreground">
      <h2 className="font-heading font-semibold text-lg tracking-normal">
        Create Role
      </h2>
      {canWriteRoles ? (
        <form action={createRoleAction} className="gap-3 grid mt-4">
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
          <FieldSet className="p-3 border rounded-md">
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
                <div key={section} className="gap-2 grid">
                  <p className="font-medium text-muted-foreground text-xs">
                    {section}
                  </p>
                  <div className="gap-1.5 grid">
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
          <div>
            <Button type="submit">Create Role</Button>
          </div>
        </form>
      ) : (
        <p className="mt-4 text-muted-foreground text-sm">
          You have read-only role access.
        </p>
      )}
    </section>
  )
}

function RolesListSkeleton() {
  return (
    <section className="bg-card shadow-sm p-4 border rounded-lg text-card-foreground">
      <div className="space-y-3">
        <Skeleton className="w-full h-10" />
        <Skeleton className="w-full h-10" />
        <Skeleton className="w-full h-10" />
      </div>
    </section>
  )
}

function CreateRoleSkeleton() {
  return (
    <section className="bg-card shadow-sm p-4 border rounded-lg text-card-foreground">
      <div className="space-y-3">
        <Skeleton className="w-24 h-5" />
        <Skeleton className="w-full h-10" />
        <Skeleton className="w-full h-24" />
        <Skeleton className="w-full h-32" />
      </div>
    </section>
  )
}
