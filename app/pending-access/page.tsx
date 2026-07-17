import { LogoutButton } from "@/components/auth/logout-button"
import { getDashboardAccessForSessionUser } from "@/lib/access-control/server"
import { auth } from "@/lib/auth/server"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function PendingAccessPage() {
  const { data: session } = await auth.getSession()

  const sessionUser = session?.user

  if (!sessionUser) {
    redirect("/login")
  }

  const { canReadDashboard } =
    await getDashboardAccessForSessionUser(sessionUser)

  if (canReadDashboard) {
    redirect("/dashboard")
  }

  return (
    <main className="grid min-h-svh place-items-center bg-background p-6">
      <section className="w-full max-w-md space-y-6 rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">
            Access pending
          </p>
          <h1 className="font-heading text-2xl font-semibold tracking-normal">
            Your service desk access is not ready yet
          </h1>
          <p className="text-sm leading-6 text-muted-foreground">
            You are signed in, but this user has not been assigned dashboard
            access yet.
          </p>
        </div>
        <LogoutButton />
      </section>
    </main>
  )
}
