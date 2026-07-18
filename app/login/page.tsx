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

async function LoginPageContent() {
  await connection()

  const { data: session } = await auth.getSession()
  const sessionUser = session?.user

  if (sessionUser) {
    const { canReadDashboard } =
      await getDashboardAccessForSessionUser(sessionUser)

    redirect(canReadDashboard ? "/dashboard" : "/pending-access")
  }

  return (
    <main className="grid min-h-svh place-items-center p-6">
      <div className="w-full max-w-md space-y-4">
        <NeonAuthUiProvider>
          <AuthView path="sign-in" />
        </NeonAuthUiProvider>
      </div>
    </main>
  )
}

function LoginPageSkeleton() {
  return (
    <main className="grid min-h-svh place-items-center p-6">
      <div className="w-full max-w-md space-y-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-72 w-full" />
      </div>
    </main>
  )
}
