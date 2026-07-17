import {
    getDashboardAccessForSessionUser,
    type AuthenticatedSessionUser,
} from "@/lib/access-control/server"
import { auth } from "@/lib/auth/server"
import { redirect } from "next/navigation"

export async function requireCurrentApplicationAccess() {
  const { data: session } = await auth.getSession()
  const sessionUser = session?.user as AuthenticatedSessionUser | undefined

  if (!sessionUser) {
    redirect("/login")
  }

  const access = await getDashboardAccessForSessionUser(sessionUser)

  if (!access.canReadDashboard) {
    redirect("/pending-access")
  }

  return access
}