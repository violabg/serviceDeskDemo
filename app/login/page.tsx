import { NeonAuthUiProvider } from "@/components/auth/neon-auth-ui-provider"
import { getDashboardAccessForSessionUser } from "@/lib/access-control/server"
import { auth } from "@/lib/auth/server"
import { AuthView } from "@neondatabase/auth/react"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function LoginPage() {
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
