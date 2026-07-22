import { NeonAuthUiProvider } from "@/components/auth/neon-auth-ui-provider"
import { Skeleton } from "@/components/ui/skeleton"
import { getDashboardAccessForSessionUser } from "@/lib/access-control/server"
import { auth } from "@/lib/auth/server"
import { AuthView } from "@neondatabase/auth/react"
import { redirect } from "next/navigation"
import { connection } from "next/server"
import { Suspense } from "react"

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginPageSkeleton />}>
      <LoginPageContent />
    </Suspense>
  )
}

export async function LoginPageContent() {
  await connection()

  const { data: session } = await auth.getSession()
  const sessionUser = session?.user

  if (sessionUser) {
    const { canReadDashboard } =
      await getDashboardAccessForSessionUser(sessionUser)

    redirect(canReadDashboard ? "/dashboard" : "/pending-access")
  }

  return (
    <main className="place-items-center grid p-6 min-h-svh">
      <div className="space-y-4 w-full max-w-md">
        <NeonAuthUiProvider>
          <AuthView path="sign-in" />
        </NeonAuthUiProvider>
      </div>
    </main>
  )
}

function LoginPageSkeleton() {
  return (
    <main className="place-items-center grid p-6 min-h-svh">
      <div className="space-y-3 w-full max-w-md">
        <Skeleton className="w-full h-10" />
        <Skeleton className="w-full h-72" />
      </div>
    </main>
  )
}
