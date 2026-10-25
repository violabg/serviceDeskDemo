import { requireCurrentApplicationAccess } from "@/app/(dashboard)/admin/_lib/current-application-user"
import { CustomerForm } from "@/app/(dashboard)/customers/customer-form"
import { Skeleton } from "@/components/ui/skeleton"
import { hasPermission } from "@/lib/access-control"
import { redirect } from "next/navigation"
import { Suspense } from "react"

export default function NewCustomerPage() {
  return (
    <main className="flex flex-col flex-1 gap-6 p-4 pt-0">
      <h1 className="font-heading font-semibold text-3xl">New Customer</h1>
      <Suspense fallback={<Skeleton className="w-full h-64" />}>
        <NewCustomerContent />
      </Suspense>
    </main>
  )
}

export async function NewCustomerContent() {
  const access = await requireCurrentApplicationAccess()
  const permissions = new Set(access.effectivePermissionKeys)
  if (!hasPermission(permissions, "customers", "read")) redirect("/dashboard")
  const canWrite = hasPermission(permissions, "customers", "write")
  const canManage = hasPermission(permissions, "customers", "manage")
  return <CustomerForm mode="create" canWrite={canWrite} canManage={canManage} />
}
