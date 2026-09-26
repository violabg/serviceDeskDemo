import { requireCurrentApplicationAccess } from "@/app/(dashboard)/admin/_lib/current-application-user"
import { TicketDetailForms } from "@/app/(dashboard)/tickets/[id]/ticket-detail-forms"
import { ticketDetailTag } from "@/app/(dashboard)/tickets/_lib/cache-tags"
import { Skeleton } from "@/components/ui/skeleton"
import { hasPermission } from "@/lib/access-control"
import { getAvailableTechnicians, getTicketById } from "@/lib/tickets/service"
import { cacheLife, cacheTag } from "next/cache"
import { notFound, redirect } from "next/navigation"
import { Suspense, ViewTransition } from "react"

async function getTicketDetailData(actorUserId: string, ticketId: string) {
  "use cache"

  cacheLife("days")
  cacheTag(ticketDetailTag(ticketId))

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
    <main className="flex flex-col flex-1 gap-6 p-4 pt-0">
      <div className="space-y-1">
        <p className="font-medium text-muted-foreground text-sm">
          Ticket Management
        </p>
      </div>
      <ViewTransition default="none" update="content-fade">
        <Suspense fallback={<TicketDetailPageSkeleton />}>
          <TicketDetailPageContent params={params} />
        </Suspense>
      </ViewTransition>
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
    <div className="gap-4 grid">
      <div className="space-y-1">
        <h1 className="font-heading font-semibold text-3xl tracking-normal">
          {ticket.title}
        </h1>
        <p className="text-muted-foreground text-sm">
          {ticket.customer.name} · {ticket.status} · {ticket.priority}
        </p>
      </div>

      <section className="bg-card shadow-sm p-4 border rounded-lg text-card-foreground">
        <h2 className="font-heading font-semibold text-lg tracking-normal">
          Overview
        </h2>
        <dl className="gap-3 grid mt-4 text-sm">
          <div className="gap-3 grid grid-cols-[10rem_1fr]">
            <dt className="text-muted-foreground">Requester</dt>
            <dd>{ticket.requesterContact}</dd>
          </div>
          <div className="gap-3 grid grid-cols-[10rem_1fr]">
            <dt className="text-muted-foreground">Category</dt>
            <dd>{ticket.category}</dd>
          </div>
          <div className="gap-3 grid grid-cols-[10rem_1fr]">
            <dt className="text-muted-foreground">Intake Channel</dt>
            <dd>{ticket.intakeChannel}</dd>
          </div>
          <div className="gap-3 grid grid-cols-[10rem_1fr]">
            <dt className="text-muted-foreground">Asset</dt>
            <dd>{ticket.asset?.name ?? "Not linked"}</dd>
          </div>
          <div className="gap-3 grid grid-cols-[10rem_1fr]">
            <dt className="text-muted-foreground">Description</dt>
            <dd className="whitespace-pre-wrap">{ticket.description}</dd>
          </div>
        </dl>
      </section>

      <section className="bg-card shadow-sm p-4 border rounded-lg text-card-foreground">
        <div className="flex justify-between items-center gap-3">
          <h2 className="font-heading font-semibold text-lg tracking-normal">
            Lifecycle
          </h2>
          {!canWrite ? (
            <p className="text-muted-foreground text-sm">Read-only access</p>
          ) : null}
        </div>
        {reopenBlocked ? (
          <p className="mt-3 text-amber-700 text-sm">
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

      <section className="bg-card shadow-sm p-4 border rounded-lg text-card-foreground">
        <h2 className="font-heading font-semibold text-lg tracking-normal">
          Notes
        </h2>
        <div className="space-y-3 mt-4">
          {ticket.notes.length > 0 ? (
            ticket.notes.map((note) => (
              <article key={note.id} className="p-3 border rounded-md text-sm">
                <p className="whitespace-pre-wrap">{note.content}</p>
                <p className="mt-2 text-muted-foreground text-xs">
                  {note.author.name || note.author.email} ·{" "}
                  {note.createdAt.toLocaleString()}
                </p>
              </article>
            ))
          ) : (
            <p className="text-muted-foreground text-sm">No notes yet.</p>
          )}
        </div>
      </section>

      <section className="bg-card shadow-sm p-4 border rounded-lg text-card-foreground">
        <h2 className="font-heading font-semibold text-lg tracking-normal">
          Activity Timeline
        </h2>
        <div className="space-y-2 mt-4 text-sm">
          {ticket.activities.length > 0 ? (
            ticket.activities.map((activity) => (
              <article key={activity.id} className="p-3 border rounded-md">
                <p className="font-medium">{activity.type}</p>
                <p className="text-muted-foreground">
                  {activity.actor.name || activity.actor.email} ·{" "}
                  {activity.createdAt.toLocaleString()}
                </p>
                {activity.previousValue || activity.newValue ? (
                  <p className="mt-1 text-muted-foreground text-xs">
                    {activity.previousValue ?? "-"} → {activity.newValue ?? "-"}
                  </p>
                ) : null}
              </article>
            ))
          ) : (
            <p className="text-muted-foreground text-sm">
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
    <div className="gap-4 grid">
      <section className="bg-card p-4 border rounded-lg">
        <div className="space-y-2">
          <Skeleton className="w-72 h-9" />
          <Skeleton className="w-56 h-4" />
        </div>
      </section>
      <section className="bg-card p-4 border rounded-lg">
        <div className="space-y-3">
          <Skeleton className="w-full h-4" />
          <Skeleton className="w-full h-4" />
          <Skeleton className="w-full h-4" />
        </div>
      </section>
      <section className="bg-card p-4 border rounded-lg">
        <div className="space-y-3">
          <Skeleton className="w-full h-9" />
          <Skeleton className="w-full h-9" />
          <Skeleton className="w-full h-9" />
        </div>
      </section>
    </div>
  )
}
