import { AppSidebar } from "@/components/app-sidebar"
import { DashboardBreadcrumbs } from "@/components/dashboard-breadcrumbs"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { getDashboardAccessForSessionUser } from "@/lib/access-control/server"
import { auth } from "@/lib/auth/server"
import { redirect } from "next/navigation"
import { connection } from "next/server"
import { Suspense } from "react"

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <Suspense fallback={<DashboardLayoutSkeleton />}>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </Suspense>
  )
}

function DashboardLayoutSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading dashboard"
      className="flex min-h-svh w-full"
    >
      <div className="hidden w-64 shrink-0 flex-col gap-4 border-r p-4 md:flex">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
      <div className="flex flex-1 flex-col gap-6 p-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
      <span className="sr-only">Loading dashboard...</span>
    </div>
  )
}

async function DashboardLayoutContent({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  await connection()

  const { data: session } = await auth.getSession()
  const sessionUser = session?.user

  if (!sessionUser) {
    redirect("/login")
  }

  const {
    user: applicationUser,
    canReadDashboard,
    effectivePermissionKeys,
  } = await getDashboardAccessForSessionUser(sessionUser)

  if (!canReadDashboard) {
    redirect("/pending-access")
  }

  const user = {
    name: applicationUser.name || applicationUser.email || applicationUser.id,
    email: applicationUser.email,
  }

  return (
    <SidebarProvider>
      <AppSidebar
        user={user}
        effectivePermissionKeys={effectivePermissionKeys}
      />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-vertical:h-4 data-vertical:self-auto"
            />
            <DashboardBreadcrumbs />
          </div>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}
