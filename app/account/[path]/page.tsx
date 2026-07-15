import { getDashboardAccessForSessionUser } from "@/lib/access-control/server"
import { auth } from "@/lib/auth/server"
import { AccountView } from "@neondatabase/auth/react"
import { accountViewPaths } from "@neondatabase/auth/react/ui/server"
import { redirect } from "next/navigation"

export const dynamicParams = false
export const dynamic = "force-dynamic"

export function generateStaticParams() {
  return Object.values(accountViewPaths).map((path) => ({ path }))
}

export default async function AccountPage({
  params,
}: {
  params: Promise<{ path: string }>
}) {
  const { data: session } = await auth.getSession()
  const sessionUser = session?.user

  if (!sessionUser) {
    redirect("/login")
  }

  const { isAdmin } = await getDashboardAccessForSessionUser(sessionUser)

  if (!isAdmin) {
    redirect("/pending-access")
  }

  const { path } = await params

  return <AccountView path={path} />
}
