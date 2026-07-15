import { LogoutButton } from "@/components/auth/logout-button"
import { Button } from "@/components/ui/button"
import { auth } from "@/lib/auth/server"
import { ShieldCheckIcon } from "@phosphor-icons/react/dist/ssr"
import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Admin | Service Desk Demo",
  description: "Protected admin page for testing authentication permissions",
}

export default async function AdminPage() {
  const { data: session } = await auth.getSession()

  if (!session?.user) {
    redirect("/login")
  }

  const displayName = session.user.name || session.user.email || session.user.id

  return (
    <main className="min-h-svh bg-background p-6 text-foreground">
      <section className="mx-auto flex w-full max-w-3xl flex-col gap-6 rounded-lg border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="grid size-11 place-items-center rounded-md bg-primary/10 text-primary">
            <ShieldCheckIcon className="size-5" weight="fill" />
          </div>
          <div>
            <h1 className="font-heading text-2xl font-semibold">
              Admin access granted
            </h1>
            <p className="text-sm text-muted-foreground">
              Protected route verified with active Neon Auth session.
            </p>
          </div>
        </div>

        <dl className="grid gap-3 rounded-md border bg-background p-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted-foreground">Permission</dt>
            <dd className="font-medium">authenticated</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">User</dt>
            <dd className="font-medium break-all">{displayName}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Email</dt>
            <dd className="font-medium break-all">
              {session.user.email || "Not provided"}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">User ID</dt>
            <dd className="font-mono text-xs break-all">{session.user.id}</dd>
          </div>
        </dl>

        <div className="flex flex-wrap gap-2">
          <Button
            render={<Link href="/account/settings" />}
            nativeButton={false}
          >
            Account settings
          </Button>
          <Button
            variant="outline"
            render={<Link href="/" />}
            nativeButton={false}
          >
            Back home
          </Button>
          <LogoutButton />
        </div>
      </section>
    </main>
  )
}
