import { getDashboardAccessForSessionUser } from "@/lib/access-control/server"
import { auth } from "@/lib/auth/server"
import { AuthView } from "@neondatabase/auth/react"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function LoginPage() {
  const { data: session } = await auth.getSession()
  const sessionUser = session?.user

  if (sessionUser) {
    const { isAdmin } = await getDashboardAccessForSessionUser(sessionUser)

    redirect(isAdmin ? "/" : "/pending-access")
  }

  return (
    <main className="place-items-center grid p-6 min-h-svh">
      <div className="space-y-4 w-full max-w-md">
        <AuthView path="sign-in" />
      </div>
    </main>
  )
}
