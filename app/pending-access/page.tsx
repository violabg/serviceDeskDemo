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

export async function PendingAccessPageContent() {
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
    <main className="place-items-center grid bg-background p-6 min-h-svh">
      <section className="space-y-6 bg-card shadow-sm p-6 border rounded-lg w-full max-w-md text-card-foreground">
        <div className="space-y-2">
          <p className="font-medium text-muted-foreground text-sm">
            Access pending
          </p>
          <h1 className="font-heading font-semibold text-2xl tracking-normal">
            Your service desk access is not ready yet
          </h1>
          <p className="text-muted-foreground text-sm leading-6">
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
    <main className="place-items-center grid bg-background p-6 min-h-svh">
      <section className="space-y-3 bg-card shadow-sm p-6 border rounded-lg w-full max-w-md">
        <Skeleton className="w-28 h-4" />
        <Skeleton className="w-full h-7" />
        <Skeleton className="w-full h-4" />
        <Skeleton className="w-28 h-9" />
      </section>
    </main>
  )
}
