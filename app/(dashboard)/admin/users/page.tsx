import { requireCurrentApplicationAccess } from "@/app/(dashboard)/admin/_lib/current-application-user"
import { Button } from "@/components/ui/button"
import { hasPermission } from "@/lib/access-control"
import { getUsersForManagement } from "@/lib/access-control/server"
import Link from "next/link"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function UsersPage() {
  const access = await requireCurrentApplicationAccess()
  const permissions = new Set(access.effectivePermissionKeys)

  if (!hasPermission(permissions, "users", "read")) {
    redirect("/dashboard")
  }

  const users = await getUsersForManagement({ actorUserId: access.user.id })

  return (
    <main className="flex flex-1 flex-col gap-6 p-4 pt-0">
      <div className="space-y-1">
        <p className="text-sm font-medium text-muted-foreground">
          Administration
        </p>
        <h1 className="font-heading text-3xl font-semibold tracking-normal">
          Users
        </h1>
      </div>
      <section className="overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="grid grid-cols-[1.4fr_1fr_0.8fr_auto] gap-4 border-b bg-muted/50 px-4 py-3 text-sm font-medium text-muted-foreground">
          <span>User</span>
          <span>Roles</span>
          <span>Account</span>
          <span className="sr-only">Open</span>
        </div>
        <div className="divide-y">
          {users.map((user) => (
            <article
              key={user.id}
              className="grid grid-cols-[1.4fr_1fr_0.8fr_auto] items-center gap-4 px-4 py-3 text-sm"
            >
              <div className="min-w-0">
                <p className="truncate font-medium">
                  {user.name || user.email}
                </p>
                <p className="truncate text-muted-foreground">{user.email}</p>
              </div>
              <p className="truncate text-muted-foreground">
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
                render={<Link href={`/admin/users/${user.id}`} />}
                nativeButton={false}
              >
                Open
              </Button>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}
