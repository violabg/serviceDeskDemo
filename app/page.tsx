import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { auth } from "@/lib/auth/server"
import Link from "next/link"
import { redirect } from "next/navigation"
import { connection } from "next/server"
import { Suspense } from "react"

export default function HomePage() {
  return (
    <Suspense fallback={<HomePageSkeleton />}>
      <HomePageContent />
    </Suspense>
  )
}

async function HomePageContent() {
  await connection()

  const { data: session } = await auth.getSession()

  if (session?.user) {
    redirect("/dashboard")
  }

  return (
    <main className="min-h-svh bg-background text-foreground">
      <section className="mx-auto flex min-h-svh w-full max-w-6xl flex-col justify-between px-6 py-8 md:px-10">
        <header className="flex items-center justify-between gap-4">
          <p className="font-heading text-lg font-semibold">
            Service Desk Demo
          </p>
          <Button render={<Link href="/login" />} nativeButton={false}>
            Log in
          </Button>
        </header>
        <div className="grid gap-10 py-16 md:grid-cols-[1.1fr_0.9fr] md:items-end">
          <div className="space-y-6">
            <p className="text-sm font-medium tracking-[0.18em] text-muted-foreground uppercase">
              Enterprise agentic workflow
            </p>
            <h1 className="font-heading text-4xl font-semibold tracking-normal text-balance md:text-6xl">
              Service desk built around governed AI delivery.
            </h1>
            <p className="max-w-xl text-base leading-7 text-muted-foreground md:text-lg">
              Sign in with GitHub. Dashboard access starts only after a local
              user receives roles with the required permissions.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                size="lg"
                render={<Link href="/login" />}
                nativeButton={false}
              >
                Log in with GitHub
              </Button>
              <Button
                size="lg"
                variant="outline"
                render={<Link href="/pending-access" />}
                nativeButton={false}
              >
                Check access
              </Button>
            </div>
          </div>
          <div className="grid gap-3 rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
            {[
              ["Login", "Neon Auth handles GitHub identity."],
              ["Local user", "App creates user record on first login."],
              ["Roles", "Admin assigns allow-only permissions."],
              [
                "Dashboard",
                "Sidebar appears only after dashboard read access.",
              ],
            ].map(([title, text]) => (
              <div key={title} className="rounded-md bg-muted/60 p-4">
                <p className="font-medium">{title}</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  {text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}

function HomePageSkeleton() {
  return (
    <main className="min-h-svh p-6">
      <div className="mx-auto max-w-6xl space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    </main>
  )
}
