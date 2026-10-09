import { requireCurrentApplicationAccess } from "@/app/(dashboard)/admin/_lib/current-application-user"
import { customerListTag } from "@/app/(dashboard)/customers/_lib/cache-tags"
import { CustomerForm } from "@/app/(dashboard)/customers/customer-form"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { hasPermission } from "@/lib/access-control"
import { getCustomerList } from "@/lib/customers/service"
import { cacheLife, cacheTag } from "next/cache"
import Link from "next/link"
import { redirect } from "next/navigation"
import { Suspense } from "react"

async function getCustomersData() {
  "use cache"
  cacheLife("days")
  cacheTag(customerListTag())
  return getCustomerList()
}

export default function CustomersPage() {
  return <main className="flex flex-col flex-1 gap-6 p-4 pt-0"><h1 className="font-heading font-semibold text-3xl">Customers</h1><Suspense fallback={<Skeleton className="w-full h-48" />}><CustomersPageContent /></Suspense></main>
}

async function CustomersPageContent() {
  const access = await requireCurrentApplicationAccess()
  const permissions = new Set(access.effectivePermissionKeys)
  if (!hasPermission(permissions, "customers", "read")) redirect("/dashboard")
  const canWrite = hasPermission(permissions, "customers", "write")
  const customers = await getCustomersData()
  const canManage = hasPermission(permissions, "customers", "manage")
  return <section className="gap-4 grid"><CustomerForm mode="create" canWrite={canWrite} canManage={canManage} /><CustomerList customers={customers} canWrite={canWrite} /></section>
}

type CustomerRow = Awaited<ReturnType<typeof getCustomerList>>[number]

function CustomerList({ customers, canWrite }: { customers: CustomerRow[]; canWrite: boolean }) {
  return (
    <section className="bg-card shadow-sm border rounded-lg overflow-hidden">
      <div className="grid grid-cols-[1fr_1fr_1fr_auto] bg-muted/50 px-4 py-3 border-b font-medium text-sm">
        <span>Company</span><span>Primary contact</span><span>Status</span><span className="sr-only">Actions</span>
      </div>
      {customers.length === 0 ? <p className="p-4 text-muted-foreground text-sm">No Customers found.</p> : customers.map((customer) => (
        <article key={customer.id} className="grid grid-cols-[1fr_1fr_1fr_auto] items-center gap-3 border-b p-4 text-sm">
          <span>{customer.company ?? "Company missing"}</span><span>{customer.name}</span><span>{customer.status}</span>
          <Button variant="outline" size="sm" render={<Link href={`/customers/${customer.id}`} />} nativeButton={false}>View</Button>
        </article>
      ))}
      {!canWrite ? <p className="p-4 text-muted-foreground text-xs">Read-only access.</p> : null}
    </section>
  )
}
