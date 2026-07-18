import { requireCurrentApplicationAccess } from "@/app/(dashboard)/admin/_lib/current-application-user"
import { TicketDetailForms } from "@/app/(dashboard)/tickets/[id]/ticket-detail-forms"
import { ticketDetailTag } from "@/app/(dashboard)/tickets/_lib/cache-tags"
import { Skeleton } from "@/components/ui/skeleton"
import { hasPermission } from "@/lib/access-control"
import { getAvailableTechnicians, getTicketById } from "@/lib/tickets/service"
import { cacheLife, cacheTag } from "next/cache"
import { notFound, redirect } from "next/navigation"
import { Suspense } from "react"

async function getTicketDetailData(actorUserId: string, ticketId: string) {
  "use cache"

  cacheLife("days")
  cacheTag(ticketDetailTag(actorUserId, ticketId))

  const [ticket, technicians] = await Promise.all([
    getTicketById(ticketId),
    getAvailableTechnicians(),
  ])

  return {
    ticket,
    technicians,
  }
}

export default function TicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  return (
    <main className="flex flex-1 flex-col gap-6 p-4 pt-0">
      <div className="space-y-1">
        <p className="text-sm font-medium text-muted-foreground">
          Ticket Management
        </p>
      </div>
      <Suspense fallback={<TicketDetailPageSkeleton />}>
        <TicketDetailPageContent params={params} />
      </Suspense>
    </main>
  )
}

async function TicketDetailPageContent({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const [{ id }, access] = await Promise.all([
    params,
    requireCurrentApplicationAccess(),
  ])

  const effectivePermissions = new Set(access.effectivePermissionKeys)

  if (!hasPermission(effectivePermissions, "tickets", "read")) {
    redirect("/dashboard")
  }

  const canWrite = hasPermission(effectivePermissions, "tickets", "write")
  const canManage = hasPermission(effectivePermissions, "tickets", "manage")
  const { ticket, technicians } = await getTicketDetailData(access.user.id, id)

  if (!ticket) {
    notFound()
  }

  const reopenBlocked = ticket.status === "Closed" && !canManage

  return (
    <div className="grid gap-4">
      <div className="space-y-1">
        <h1 className="font-heading text-3xl font-semibold tracking-normal">
          {ticket.title}
        </h1>
        <p className="text-sm text-muted-foreground">
          {ticket.customer.name} · {ticket.status} · {ticket.priority}
        </p>
      </div>

      <section className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
        <h2 className="font-heading text-lg font-semibold tracking-normal">
          Overview
        </h2>
        <dl className="mt-4 grid gap-3 text-sm">
          <div className="grid grid-cols-[10rem_1fr] gap-3">
            <dt className="text-muted-foreground">Requester</dt>
            <dd>{ticket.requesterContact}</dd>
          </div>
          <div className="grid grid-cols-[10rem_1fr] gap-3">
            <dt className="text-muted-foreground">Category</dt>
            <dd>{ticket.category}</dd>
          </div>
          <div className="grid grid-cols-[10rem_1fr] gap-3">
            <dt className="text-muted-foreground">Intake Channel</dt>
            <dd>{ticket.intakeChannel}</dd>
          </div>
          <div className="grid grid-cols-[10rem_1fr] gap-3">
            <dt className="text-muted-foreground">Asset</dt>
            <dd>{ticket.asset?.name ?? "Not linked"}</dd>
          </div>
          <div className="grid grid-cols-[10rem_1fr] gap-3">
            <dt className="text-muted-foreground">Description</dt>
            <dd className="whitespace-pre-wrap">{ticket.description}</dd>
          </div>
        </dl>
      </section>

      <section className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-heading text-lg font-semibold tracking-normal">
            Lifecycle
          </h2>
          {!canWrite ? (
            <p className="text-sm text-muted-foreground">Read-only access</p>
          ) : null}
        </div>
        {reopenBlocked ? (
          <p className="mt-3 text-sm text-amber-700">
            Reopen requires tickets:manage permission.
          </p>
        ) : null}
        <TicketDetailForms
          ticketId={ticket.id}
          status={ticket.status}
          priority={ticket.priority}
          assignedToId={ticket.assignedToId}
          canWrite={canWrite}
          canManage={canManage}
          technicians={technicians}
        />
      </section>

      <section className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
        <h2 className="font-heading text-lg font-semibold tracking-normal">
          Notes
        </h2>
        <div className="mt-4 space-y-3">
          {ticket.notes.length > 0 ? (
            ticket.notes.map((note) => (
              <article key={note.id} className="rounded-md border p-3 text-sm">
                <p className="whitespace-pre-wrap">{note.content}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {note.author.name || note.author.email} ·{" "}
                  {note.createdAt.toLocaleString()}
                </p>
              </article>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No notes yet.</p>
          )}
        </div>
      </section>

      <section className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
        <h2 className="font-heading text-lg font-semibold tracking-normal">
          Activity Timeline
        </h2>
        <div className="mt-4 space-y-2 text-sm">
          {ticket.activities.length > 0 ? (
            ticket.activities.map((activity) => (
              <article key={activity.id} className="rounded-md border p-3">
                <p className="font-medium">{activity.type}</p>
                <p className="text-muted-foreground">
                  {activity.actor.name || activity.actor.email} ·{" "}
                  {activity.createdAt.toLocaleString()}
                </p>
                {activity.previousValue || activity.newValue ? (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {activity.previousValue ?? "-"} → {activity.newValue ?? "-"}
                  </p>
                ) : null}
              </article>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">
              No activity recorded.
            </p>
          )}
        </div>
      </section>
    </div>
  )
}

function TicketDetailPageSkeleton() {
  return (
    <div className="grid gap-4">
      <section className="rounded-lg border bg-card p-4">
        <div className="space-y-2">
          <Skeleton className="h-9 w-72" />
          <Skeleton className="h-4 w-56" />
        </div>
      </section>
      <section className="rounded-lg border bg-card p-4">
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>
      </section>
      <section className="rounded-lg border bg-card p-4">
        <div className="space-y-3">
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
        </div>
      </section>
    </div>
  )
}
