import { requireCurrentApplicationAccess } from "@/app/(dashboard)/admin/_lib/current-application-user"
import { ticketListTag } from "@/app/(dashboard)/tickets/_lib/cache-tags"
import { NewTicketForm } from "@/app/(dashboard)/tickets/new/new-ticket-form"
import { Skeleton } from "@/components/ui/skeleton"
import { hasPermission } from "@/lib/access-control"
import {
  getAssets,
  getAvailableTechnicians,
  getCustomers,
} from "@/lib/tickets/service"
import { cacheLife, cacheTag } from "next/cache"
import { redirect } from "next/navigation"
import { Suspense } from "react"

async function getNewTicketReferenceData(actorUserId: string) {
  "use cache"

  cacheLife("days")
  cacheTag(ticketListTag(actorUserId))

  const [customers, assets, technicians] = await Promise.all([
    getCustomers(),
    getAssets(),
    getAvailableTechnicians(),
  ])

  return {
    customers,
    assets,
    technicians,
  }
}

export default function NewTicketPage() {
  return (
    <main className="flex flex-1 flex-col gap-6 p-4 pt-0">
      <div className="space-y-1">
        <p className="text-sm font-medium text-muted-foreground">
          Ticket Management
        </p>
        <h1 className="font-heading text-3xl font-semibold tracking-normal">
          Nuovo Ticket
        </h1>
      </div>
      <Suspense fallback={<NewTicketPageSkeleton />}>
        <NewTicketPageContent />
      </Suspense>
    </main>
  )
}

async function NewTicketPageContent() {
  const access = await requireCurrentApplicationAccess()
  const effectivePermissions = new Set(access.effectivePermissionKeys)

  if (!hasPermission(effectivePermissions, "tickets", "read")) {
    redirect("/dashboard")
  }

  if (!hasPermission(effectivePermissions, "tickets", "write")) {
    return (
      <section className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
        <p className="text-sm text-muted-foreground">
          Read-only access. You need tickets:write to create a new ticket.
        </p>
      </section>
    )
  }

  const referenceData = await getNewTicketReferenceData(access.user.id)

  return (
    <NewTicketForm
      customers={referenceData.customers}
      assets={referenceData.assets}
      technicians={referenceData.technicians}
    />
  )
}

function NewTicketPageSkeleton() {
  return (
    <section className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
      <div className="space-y-3">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-full" />
      </div>
    </section>
  )
}
