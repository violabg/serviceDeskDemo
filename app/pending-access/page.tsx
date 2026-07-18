import { LogoutButton } from "@/components/auth/logout-button"
import { Skeleton } from "@/components/ui/skeleton"
import { getDashboardAccessForSessionUser } from "@/lib/access-control/server"
import { auth } from "@/lib/auth/server"
import { redirect } from "next/navigation"
import { connection } from "next/server"
import { Suspense } from "react"

export default function PendingAccessPage() {
  return (
    <Suspense fallback={<PendingAccessPageSkeleton />}>
      <PendingAccessPageContent />
    </Suspense>
  )
}

async function PendingAccessPageContent() {
  await connection()

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

function PendingAccessPageSkeleton() {
  return (
    <main className="grid min-h-svh place-items-center bg-background p-6">
      <section className="w-full max-w-md space-y-3 rounded-lg border bg-card p-6 shadow-sm">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-7 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-9 w-28" />
      </section>
    </main>
  )
}
