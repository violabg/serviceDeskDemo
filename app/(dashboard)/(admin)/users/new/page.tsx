import { requireCurrentApplicationAccess } from "@/app/(dashboard)/admin/_lib/current-application-user"
import { UserForm } from "@/app/(dashboard)/(admin)/users/_components/user-form"
import { Skeleton } from "@/components/ui/skeleton"
import { hasAnySectionPermission, hasPermission } from "@/lib/access-control"
import { redirect } from "next/navigation"
import { Suspense } from "react"

export default function NewUserPage() {
  return (
    <main className="flex flex-col flex-1 gap-6 p-4 pt-0">
      <div className="space-y-1">
        <p className="font-medium text-muted-foreground text-sm">
          Administration
        </p>
        <h1 className="font-heading font-semibold text-3xl tracking-normal">
          New User
        </h1>
      </div>
      <Suspense fallback={<NewUserPageSkeleton />}>
        <NewUserPageContent />
      </Suspense>
    </main>
  )
}

export async function NewUserPageContent() {
  const access = await requireCurrentApplicationAccess()
  const permissions = new Set(access.effectivePermissionKeys)

  if (!hasAnySectionPermission(permissions, "users")) {
    redirect("/dashboard")
  }

  if (!hasPermission(permissions, "users", "write")) {
    redirect("/dashboard")
  }

  return <UserForm />
}

function NewUserPageSkeleton() {
  return (
    <section className="bg-card shadow-sm p-4 border rounded-lg text-card-foreground">
      <div className="space-y-3">
        <Skeleton className="w-40 h-5" />
        <Skeleton className="w-full h-9" />
        <Skeleton className="w-full h-9" />
        <Skeleton className="w-28 h-9" />
      </div>
    </section>
  )
}
