import { adminUserDetailTag } from "@/app/(dashboard)/admin/_lib/cache-tags"
import { requireCurrentApplicationAccess } from "@/app/(dashboard)/admin/_lib/current-application-user"
import {
  assignUserRoleAction,
  removeUserRoleAction,
} from "@/app/(dashboard)/admin/actions"
import { Button } from "@/components/ui/button"
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

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ userId: string }>
}) {
  return (
    <main className="flex flex-1 flex-col gap-6 p-4 pt-0">
      <div className="space-y-1">
        <p className="text-sm font-medium text-muted-foreground">Users</p>
      </div>
      <Suspense fallback={<UserDetailPageSkeleton />}>
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

function UserDetailPageSkeleton() {
  return <UserDetailContentSkeleton />
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
        <h1 className="font-heading text-3xl font-semibold tracking-normal">
          {user.name || user.email}
        </h1>
        <p className="text-sm text-muted-foreground">{user.email}</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <section className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
          <h2 className="font-heading text-lg font-semibold tracking-normal">
            Identity
          </h2>
          <dl className="mt-4 grid gap-3 text-sm">
            <div className="grid grid-cols-[9rem_1fr] gap-3">
              <dt className="text-muted-foreground">Name</dt>
              <dd>{user.name || "Not provided"}</dd>
            </div>
            <div className="grid grid-cols-[9rem_1fr] gap-3">
              <dt className="text-muted-foreground">Email</dt>
              <dd>{user.email}</dd>
            </div>
            <div className="grid grid-cols-[9rem_1fr] gap-3">
              <dt className="text-muted-foreground">Account</dt>
              <dd>{user.neonAuthId ? "Linked" : "Seeded user"}</dd>
            </div>
          </dl>
        </section>
        <section className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
          <h2 className="font-heading text-lg font-semibold tracking-normal">
            Effective Permissions
          </h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {effectivePermissionKeys.length > 0 ? (
              effectivePermissionKeys.map((permission) => (
                <span
                  key={permission}
                  className="rounded-md bg-muted px-2 py-1 text-xs font-medium"
                >
                  {permission}
                </span>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No permissions</p>
            )}
          </div>
        </section>
      </div>
      <section className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-heading text-lg font-semibold tracking-normal">
            Roles
          </h2>
          {!canWriteUsers ? (
            <p className="text-sm text-muted-foreground">Read-only access</p>
          ) : null}
        </div>
        <div className="mt-4 divide-y rounded-md border">
          {user.roles.length > 0 ? (
            user.roles.map(({ role }) => (
              <div
                key={role.id}
                className="flex items-center justify-between gap-4 px-3 py-2 text-sm"
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
            <p className="px-3 py-2 text-sm text-muted-foreground">
              No roles assigned
            </p>
          )}
        </div>
        {canWriteUsers ? (
          <form action={assignUserRoleAction} className="mt-4 flex gap-3">
            <input type="hidden" name="targetUserId" value={user.id} />
            <select
              name="roleId"
              aria-label="Role to assign"
              className="h-9 min-w-64 rounded-md border border-input bg-background px-2.5 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              disabled={assignableRoles.length === 0}
            >
              {assignableRoles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
            <Button type="submit" disabled={assignableRoles.length === 0}>
              Assign Role
            </Button>
          </form>
        ) : null}
      </section>
    </>
  )
}

function UserDetailContentSkeleton() {
  return (
    <div className="grid gap-4">
      <div className="space-y-2">
        <Skeleton className="h-9 w-56" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <section className="rounded-lg border bg-card p-4">
          <div className="space-y-3">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
        </section>
        <section className="rounded-lg border bg-card p-4">
          <div className="space-y-3">
            <Skeleton className="h-5 w-44" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
          </div>
        </section>
      </div>
      <section className="rounded-lg border bg-card p-4">
        <div className="space-y-3">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-9 w-52" />
        </div>
      </section>
    </div>
  )
}

function UserDetailSkeleton() {
  return (
    <div className="grid gap-4">
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-9 w-56" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <section className="rounded-lg border bg-card p-4">
          <div className="space-y-3">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
        </section>
        <section className="rounded-lg border bg-card p-4">
          <div className="space-y-3">
            <Skeleton className="h-5 w-44" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
          </div>
        </section>
      </div>
      <section className="rounded-lg border bg-card p-4">
        <div className="space-y-3">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-9 w-52" />
        </div>
      </section>
    </div>
  )
}
