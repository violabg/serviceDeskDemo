import { requireCurrentApplicationAccess } from "@/app/(dashboard)/admin/_lib/current-application-user"
import { ticketListTag } from "@/app/(dashboard)/tickets/_lib/cache-tags"
import { TicketFiltersForm } from "@/app/(dashboard)/tickets/ticket-filters-form"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { hasPermission } from "@/lib/access-control"
import {
  getTicketList,
  isTicketPriority,
  isTicketStatus,
} from "@/lib/tickets/service"
import { cacheLife, cacheTag } from "next/cache"
import Link from "next/link"
import { redirect } from "next/navigation"
import { Suspense } from "react"

type TicketListSearchParams = {
  q?: string
  status?: string
  priority?: string
  page?: string
}

async function getTicketListData(
  actorUserId: string,
  searchParams: TicketListSearchParams
) {
  "use cache"

  cacheLife("days")
  cacheTag(ticketListTag(actorUserId))

  const page = Math.max(1, Number(searchParams.page) || 1)
  const search = searchParams.q?.trim() || undefined
  const status =
    searchParams.status && isTicketStatus(searchParams.status)
      ? searchParams.status
      : undefined
  const priority =
    searchParams.priority && isTicketPriority(searchParams.priority)
      ? searchParams.priority
      : undefined

  return getTicketList(
    {
      search,
      status,
      priority,
    },
    {
      page,
      pageSize: 20,
    }
  )
}

export default function TicketsPage({
  searchParams,
}: {
  searchParams: Promise<TicketListSearchParams>
}) {
  return (
    <main className="flex flex-1 flex-col gap-6 p-4 pt-0">
      <div className="space-y-1">
        <p className="text-sm font-medium text-muted-foreground">
          Ticket Management
        </p>
        <h1 className="font-heading text-3xl font-semibold tracking-normal">
          Tickets
        </h1>
      </div>
      <Suspense fallback={<TicketsPageSkeleton />}>
        <TicketsPageContent searchParams={searchParams} />
      </Suspense>
    </main>
  )
}

async function TicketsPageContent({
  searchParams,
}: {
  searchParams: Promise<TicketListSearchParams>
}) {
  const [resolvedSearchParams, access] = await Promise.all([
    searchParams,
    requireCurrentApplicationAccess(),
  ])
  const effectivePermissions = new Set(access.effectivePermissionKeys)

  if (!hasPermission(effectivePermissions, "tickets", "read")) {
    redirect("/dashboard")
  }

  const canCreate = hasPermission(effectivePermissions, "tickets", "write")
  const list = await getTicketListData(access.user.id, resolvedSearchParams)

  return (
    <section className="grid gap-4">
      <TicketFiltersForm
        initialValues={{
          q: resolvedSearchParams.q,
          status: resolvedSearchParams.status,
          priority: resolvedSearchParams.priority,
        }}
        canCreate={canCreate}
      />
      <section className="overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="grid grid-cols-[1.2fr_0.8fr_0.7fr_0.8fr_auto] gap-4 border-b bg-muted/50 px-4 py-3 text-sm font-medium text-muted-foreground">
          <span>Ticket</span>
          <span>Status</span>
          <span>Priority</span>
          <span>SLA</span>
          <span className="sr-only">Open</span>
        </div>
        <div className="divide-y">
          {list.items.length > 0 ? (
            list.items.map((ticket) => (
              <article
                key={ticket.id}
                className="grid grid-cols-[1.2fr_0.8fr_0.7fr_0.8fr_auto] items-center gap-4 px-4 py-3 text-sm"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{ticket.title}</p>
                  <p className="truncate text-muted-foreground">
                    {ticket.customer.name}
                  </p>
                </div>
                <span>{ticket.status}</span>
                <span>{ticket.priority}</span>
                <span>
                  <span
                    className={
                      ticket.isSlaBreached
                        ? "rounded-md bg-red-100 px-2 py-1 text-xs font-medium text-red-700"
                        : "rounded-md bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700"
                    }
                  >
                    {ticket.isSlaBreached ? "Breached" : "On Track"}
                  </span>
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  render={<Link href={`/tickets/${ticket.id}`} />}
                  nativeButton={false}
                >
                  Open
                </Button>
              </article>
            ))
          ) : (
            <p className="px-4 py-6 text-sm text-muted-foreground">
              No tickets found.
            </p>
          )}
        </div>
      </section>
      <p className="text-xs text-muted-foreground">
        Showing page {list.page} with {list.items.length} of {list.total}{" "}
        tickets.
      </p>
    </section>
  )
}

function TicketsPageSkeleton() {
  return (
    <div className="grid gap-4">
      <section className="rounded-lg border bg-card p-4">
        <div className="grid gap-3 md:grid-cols-[1fr_12rem_12rem_auto]">
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
        </div>
      </section>
      <section className="rounded-lg border bg-card p-4">
        <div className="space-y-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </section>
    </div>
  )
}
