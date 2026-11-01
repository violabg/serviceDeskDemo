import { requireCurrentApplicationAccess } from "@/app/(dashboard)/admin/_lib/current-application-user"
import { customerDetailTag } from "@/app/(dashboard)/customers/_lib/cache-tags"
import { CustomerDetails } from "@/app/(dashboard)/customers/[id]/customer-details"
import {
  CUSTOMER_EDIT_PARAM,
  customerPathForState,
  isCustomerEditState,
} from "@/app/(dashboard)/customers/_lib/edit-state"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { hasAnySectionPermission, hasPermission } from "@/lib/access-control"
import { getCustomerById } from "@/lib/customers/service"
import { cacheLife, cacheTag } from "next/cache"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { Suspense } from "react"

type CustomerDetailSearchParams = {
  edit?: string
}

async function getCustomerDetailData(customerId: string) {
  "use cache"
  cacheLife("days")
  cacheTag(customerDetailTag(customerId))
  return getCustomerById(customerId)
}

function getEditSearchParams(searchParams: CustomerDetailSearchParams | undefined) {
  const params = new URLSearchParams()
  const editValue = searchParams?.[CUSTOMER_EDIT_PARAM]

  if (editValue !== undefined) {
    params.set(CUSTOMER_EDIT_PARAM, editValue)
  }

  return params
}

export default function CustomerDetailPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<CustomerDetailSearchParams> }) {
  return <main className="flex flex-col flex-1 gap-6 p-4 pt-0"><h1 className="font-heading font-semibold text-3xl">Customer detail</h1><Suspense fallback={<Skeleton className="w-full h-48" />}><CustomerDetailContent params={params} searchParams={searchParams} /></Suspense></main>
}

export async function CustomerDetailContent({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<CustomerDetailSearchParams> }) {
  const [{ id }, editSearchParams, access] = await Promise.all([params, searchParams, requireCurrentApplicationAccess()])
  const permissions = new Set(access.effectivePermissionKeys)
  if (!hasAnySectionPermission(permissions, "customers")) redirect("/dashboard")
  const canManage = hasPermission(permissions, "customers", "manage")
  const detailPath = customerPathForState(`/customers/${id}`, false)
  if (isCustomerEditState(getEditSearchParams(editSearchParams)) && !canManage) redirect(detailPath)
  const customer = await getCustomerDetailData(id)
  if (!customer) notFound()
  const canWrite = hasPermission(permissions, "customers", "write")
  return (
    <div className="gap-4 grid">
      <CustomerDetails
        customer={{
          id: customer.id,
          company: customer.company,
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          notes: customer.notes,
          status: customer.status,
        }}
        canWrite={canWrite}
        canManage={canManage}
      />
      <section className="bg-card p-4 border rounded-lg">
        <h2 className="font-heading font-semibold text-lg">Tickets</h2>
        {customer.tickets.map((ticket) => <p key={ticket.id}><Button variant="link" render={<Link href={`/tickets/${ticket.id}`} />} nativeButton={false}>{ticket.title} · {ticket.status} · {ticket.priority}</Button></p>)}
      </section>
    </div>
  )
}
