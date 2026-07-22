import {
  assignUserRoleAction,
  removeUserRoleAction,
} from "@/app/(dashboard)/(admin)/actions"
import { adminUserDetailTag } from "@/app/(dashboard)/admin/_lib/cache-tags"
import { requireCurrentApplicationAccess } from "@/app/(dashboard)/admin/_lib/current-application-user"
import { Button } from "@/components/ui/button"
import { Field, FieldLabel } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { hasPermission } from "@/lib/access-control"
import { getUserForManagement } from "@/lib/access-control/server"
import { cacheLife, cacheTag } from "next/cache"
import { redirect } from "next/navigation"
import { Suspense } from "react"

async function getUserDetailData(actorUserId: string, targetUserId: string) {
  "use cache"

  cacheLife("days")
  cacheTag(adminUserDetailTag(actorUserId, targetUserId))

  return getUserForManagement({
    actorUserId,
    targetUserId,
  })
}

export default function UserDetailPage({
  params,
}: {
  params: Promise<{ userId: string }>
}) {
  return (
    <main className="flex flex-col flex-1 gap-6 p-4 pt-0">
      <Suspense fallback={<UserDetailContentSkeleton />}>
        <UserDetailPageContent params={params} />
      </Suspense>
    </main>
  )
}

async function UserDetailPageContent({
  params,
}: {
  params: Promise<{ userId: string }>
}) {
  const [{ userId }, access] = await Promise.all([
    params,
    requireCurrentApplicationAccess(),
  ])
  const permissions = new Set(access.effectivePermissionKeys)

  if (!hasPermission(permissions, "users", "read")) {
    redirect("/dashboard")
  }

  const canWriteUsers = hasPermission(permissions, "users", "write")

  return (
    <UserDetailContent
      actorUserId={access.user.id}
      targetUserId={userId}
      canWriteUsers={canWriteUsers}
    />
  )
}

async function UserDetailContent({
  actorUserId,
  targetUserId,
  canWriteUsers,
}: {
  actorUserId: string
  targetUserId: string
  canWriteUsers: boolean
}) {
  const { user, availableRoles, effectivePermissionKeys } =
    await getUserDetailData(actorUserId, targetUserId)
  const assignedRoleIds = new Set(user.roles.map(({ roleId }) => roleId))
  const assignableRoles = availableRoles.filter(
    (role) => !assignedRoleIds.has(role.id)
  )

  return (
    <>
      <div className="space-y-1">
        <h1 className="font-heading font-semibold text-3xl tracking-normal">
          {user.name || user.email}
        </h1>
        <p className="text-muted-foreground text-sm">{user.email}</p>
      </div>
      <div className="gap-4 grid lg:grid-cols-[1fr_1fr]">
        <section className="bg-card shadow-sm p-4 border rounded-lg text-card-foreground">
          <h2 className="font-heading font-semibold text-lg tracking-normal">
            Identity
          </h2>
          <dl className="gap-3 grid mt-4 text-sm">
            <div className="gap-3 grid grid-cols-[9rem_1fr]">
              <dt className="text-muted-foreground">Name</dt>
              <dd>{user.name || "Not provided"}</dd>
            </div>
            <div className="gap-3 grid grid-cols-[9rem_1fr]">
              <dt className="text-muted-foreground">Email</dt>
              <dd>{user.email}</dd>
            </div>
            <div className="gap-3 grid grid-cols-[9rem_1fr]">
              <dt className="text-muted-foreground">Account</dt>
              <dd>{user.neonAuthId ? "Linked" : "Seeded user"}</dd>
            </div>
          </dl>
        </section>
        <section className="bg-card shadow-sm p-4 border rounded-lg text-card-foreground">
          <h2 className="font-heading font-semibold text-lg tracking-normal">
            Effective Permissions
          </h2>
          <div className="flex flex-wrap gap-2 mt-4">
            {effectivePermissionKeys.length > 0 ? (
              effectivePermissionKeys.map((permission) => (
                <span
                  key={permission}
                  className="bg-muted px-2 py-1 rounded-md font-medium text-xs"
                >
                  {permission}
                </span>
              ))
            ) : (
              <p className="text-muted-foreground text-sm">No permissions</p>
            )}
          </div>
        </section>
      </div>
      <section className="bg-card shadow-sm p-4 border rounded-lg text-card-foreground">
        <div className="flex justify-between items-center gap-4">
          <h2 className="font-heading font-semibold text-lg tracking-normal">
            Roles
          </h2>
          {!canWriteUsers ? (
            <p className="text-muted-foreground text-sm">Read-only access</p>
          ) : null}
        </div>
        <div className="mt-4 border rounded-md divide-y">
          {user.roles.length > 0 ? (
            user.roles.map(({ role }) => (
              <div
                key={role.id}
                className="flex justify-between items-center gap-4 px-3 py-2 text-sm"
              >
                <div>
                  <p className="font-medium">{role.name}</p>
                  <p className="text-muted-foreground">
                    {role.permissions.length} permissions
                  </p>
                </div>
                {canWriteUsers ? (
                  <form action={removeUserRoleAction}>
                    <input type="hidden" name="targetUserId" value={user.id} />
                    <input type="hidden" name="roleId" value={role.id} />
                    <Button type="submit" variant="outline" size="sm">
                      Remove
                    </Button>
                  </form>
                ) : null}
              </div>
            ))
          ) : (
            <p className="px-3 py-2 text-muted-foreground text-sm">
              No roles assigned
            </p>
          )}
        </div>
        {canWriteUsers ? (
          <form action={assignUserRoleAction} className="gap-3 grid mt-4">
            <input type="hidden" name="targetUserId" value={user.id} />
            <Field>
              <FieldLabel>
                Role <span className="text-destructive">*</span>
              </FieldLabel>
              <Select
                name="roleId"
                defaultValue={assignableRoles[0]?.id}
                disabled={assignableRoles.length === 0}
              >
                <SelectTrigger className="w-full md:max-w-72">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {assignableRoles.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
            <div>
              <Button type="submit" disabled={assignableRoles.length === 0}>
                Assign Role
              </Button>
            </div>
          </form>
        ) : null}
      </section>
    </>
  )
}

function UserDetailContentSkeleton() {
  return (
    <div className="gap-4 grid">
      <div className="space-y-2">
        <Skeleton className="w-56 h-9" />
        <Skeleton className="w-72 h-4" />
      </div>
      <div className="gap-4 grid lg:grid-cols-[1fr_1fr]">
        <section className="bg-card p-4 border rounded-lg">
          <div className="space-y-3">
            <Skeleton className="w-20 h-5" />
            <Skeleton className="w-full h-4" />
            <Skeleton className="w-full h-4" />
            <Skeleton className="w-full h-4" />
          </div>
        </section>
        <section className="bg-card p-4 border rounded-lg">
          <div className="space-y-3">
            <Skeleton className="w-44 h-5" />
            <Skeleton className="w-full h-6" />
            <Skeleton className="w-full h-6" />
          </div>
        </section>
      </div>
      <section className="bg-card p-4 border rounded-lg">
        <div className="space-y-3">
          <Skeleton className="w-16 h-5" />
          <Skeleton className="w-full h-10" />
          <Skeleton className="w-full h-10" />
          <Skeleton className="w-52 h-9" />
        </div>
      </section>
    </div>
  )
}
