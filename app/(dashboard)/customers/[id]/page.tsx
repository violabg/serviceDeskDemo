import { requireCurrentApplicationAccess } from "@/app/(dashboard)/admin/_lib/current-application-user"
import { customerDetailTag } from "@/app/(dashboard)/customers/_lib/cache-tags"
import { CustomerForm } from "@/app/(dashboard)/customers/customer-form"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { hasPermission } from "@/lib/access-control"
import { getCustomerById } from "@/lib/customers/service"
import { cacheLife, cacheTag } from "next/cache"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { Suspense } from "react"

async function getCustomerDetailData(customerId: string) {
  "use cache"
  cacheLife("days")
  cacheTag(customerDetailTag(customerId))
  return getCustomerById(customerId)
}

export default function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return <main className="flex flex-col flex-1 gap-6 p-4 pt-0"><h1 className="font-heading font-semibold text-3xl">Customer detail</h1><Suspense fallback={<Skeleton className="w-full h-48" />}><CustomerDetailContent params={params} /></Suspense></main>
}

async function CustomerDetailContent({ params }: { params: Promise<{ id: string }> }) {
  const [{ id }, access] = await Promise.all([params, requireCurrentApplicationAccess()])
  const permissions = new Set(access.effectivePermissionKeys)
  if (!hasPermission(permissions, "customers", "read")) redirect("/dashboard")
  const customer = await getCustomerDetailData(id)
  if (!customer) notFound()
  const canWrite = hasPermission(permissions, "customers", "write")
  const canManage = hasPermission(permissions, "customers", "manage")
  return (
    <div className="gap-4 grid">
      <section className="bg-card p-4 border rounded-lg">
        <h2 className="font-heading font-semibold text-lg">{customer.company ?? "Company missing"}</h2>
        <p>{customer.name} · {customer.email ?? "Email missing"} · {customer.status}</p>
        <p>{customer.phone ?? "No phone"}</p>
        <p className="whitespace-pre-wrap">{customer.notes ?? "No operational notes"}</p>
      </section>
      <CustomerForm mode="edit" canWrite={canWrite} canManage={canManage} customerId={customer.id} initialValues={{ company: customer.company ?? "", name: customer.name, email: customer.email ?? "", phone: customer.phone ?? "", notes: customer.notes ?? "", status: customer.status }} />
      <section className="bg-card p-4 border rounded-lg">
        <h2 className="font-heading font-semibold text-lg">Tickets</h2>
        {customer.tickets.map((ticket) => <p key={ticket.id}><Button variant="link" render={<Link href={`/tickets/${ticket.id}`} />} nativeButton={false}>{ticket.title} · {ticket.status} · {ticket.priority}</Button></p>)}
      </section>
    </div>
  )
}
