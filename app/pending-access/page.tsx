import { LogoutButton } from "@/components/auth/logout-button"
import { auth } from "@/lib/auth/server"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function PendingAccessPage() {
  const { data: session } = await auth.getSession()

  if (!session?.user) {
    redirect("/login")
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
            You are signed in, but an administrator has not assigned dashboard
            privileges to this account.
          </p>
        </div>
        <LogoutButton />
      </section>
    </main>
  )
}