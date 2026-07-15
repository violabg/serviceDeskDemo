import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { getDashboardAccessForSessionUser } from "@/lib/access-control/server"
import { auth } from "@/lib/auth/server"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const { data: session } = await auth.getSession()
  const sessionUser = session?.user

  if (!sessionUser) {
    redirect("/login")
  }

  const { user: applicationUser, canReadDashboard } =
    await getDashboardAccessForSessionUser(sessionUser)

  if (!canReadDashboard) {
    redirect("/pending-access")
  }

  const user = {
    name: applicationUser.name || applicationUser.email || applicationUser.id,
    email: applicationUser.email,
  }

  return (
    <SidebarProvider>
      <AppSidebar user={user} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-vertical:h-4 data-vertical:self-auto"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">
                    Build Your Application
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Data Fetching</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}
