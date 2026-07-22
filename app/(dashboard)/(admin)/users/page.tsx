import { adminUsersListTag } from "@/app/(dashboard)/admin/_lib/cache-tags"
import { requireCurrentApplicationAccess } from "@/app/(dashboard)/admin/_lib/current-application-user"
import { Button } from "@/components/ui/button"
import { hasPermission } from "@/lib/access-control"
import { getUsersForManagement } from "@/lib/access-control/server"
import { cacheLife, cacheTag } from "next/cache"
import Link from "next/link"
import { redirect } from "next/navigation"
import { Suspense } from "react"

async function getUsersData(actorUserId: string) {
  "use cache"

  cacheLife("days")
  cacheTag(adminUsersListTag(actorUserId))

  return getUsersForManagement({ actorUserId })
}

export default function UsersPage() {
  return (
    <main className="flex flex-col flex-1 gap-6 p-4 pt-0">
      <div className="space-y-1">
        <p className="font-medium text-muted-foreground text-sm">
          Administration
        </p>
        <h1 className="font-heading font-semibold text-3xl tracking-normal">
          Users
        </h1>
      </div>
      <Suspense fallback={<UsersContentSkeleton />}>
        <UsersPageContent />
      </Suspense>
    </main>
  )
}

async function UsersPageContent() {
  const access = await requireCurrentApplicationAccess()
  const permissions = new Set(access.effectivePermissionKeys)

  if (!hasPermission(permissions, "users", "read")) {
    redirect("/dashboard")
  }

  const users = await getUsersData(access.user.id)

  return (
    <section className="bg-card shadow-sm border rounded-lg overflow-hidden text-card-foreground">
      <div className="gap-4 grid grid-cols-[1.4fr_1fr_0.8fr_auto] bg-muted/50 px-4 py-3 border-b font-medium text-muted-foreground text-sm">
        <span>User</span>
        <span>Roles</span>
        <span>Account</span>
        <span className="sr-only">Open</span>
      </div>
      <div className="divide-y">
        {users.map((user) => (
          <article
            key={user.id}
            className="items-center gap-4 grid grid-cols-[1.4fr_1fr_0.8fr_auto] px-4 py-3 text-sm"
          >
            <div className="min-w-0">
              <p className="font-medium truncate">{user.name || user.email}</p>
              <p className="text-muted-foreground truncate">{user.email}</p>
            </div>
            <p className="text-muted-foreground truncate">
              {user.roles.length > 0
                ? user.roles.map(({ role }) => role.name).join(", ")
                : "No roles"}
            </p>
            <p className="text-muted-foreground">
              {user.neonAuthId ? "Linked" : "Seeded"}
            </p>
            <Button
              variant="outline"
              size="sm"
              render={<Link href={`/users/${user.id}`} />}
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

function UsersContentSkeleton() {
  return (
    <section className="bg-card shadow-sm p-4 border rounded-lg text-card-foreground">
      <div className="space-y-3">
        <div className="bg-muted rounded-md h-10" />
        <div className="bg-muted rounded-md h-10" />
        <div className="bg-muted rounded-md h-10" />
      </div>
    </section>
  )
}
