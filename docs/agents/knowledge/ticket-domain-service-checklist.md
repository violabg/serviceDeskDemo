# Ticket Domain And Mutation Rules Checklist

Use this file before changing ticket Prisma models, ticket services, ticket actions, ticket pages, SLA logic, duplicate detection, or ticket cache invalidation.

## When to read

- The task changes [prisma/schema.prisma](./../../../prisma/schema.prisma) in `Ticket`, `TicketNote`, `TicketActivity`, `Customer`, `Asset`, or related enums.
- The task changes [lib/tickets/service.ts](./../../../lib/tickets/service.ts) or [lib/tickets/sla.ts](./../../../lib/tickets/sla.ts).
- The task changes [app/(dashboard)/tickets/actions.ts](./../../../app/%28dashboard%29/tickets/actions.ts), [app/(dashboard)/tickets/page.tsx](./../../../app/%28dashboard%29/tickets/page.tsx), or [app/(dashboard)/tickets/new/page.tsx](./../../../app/%28dashboard%29/tickets/new/page.tsx).
- The task changes ticket caching or tag invalidation in [app/(dashboard)/tickets/_lib/cache-tags.ts](./../../../app/%28dashboard%29/tickets/_lib/cache-tags.ts).

## Ownership map

- [prisma/schema.prisma](./../../../prisma/schema.prisma) owns ticket, customer, asset, note, and activity persistence contracts.
- [lib/tickets/service.ts](./../../../lib/tickets/service.ts) owns ticket read and mutation behavior, enum guards, duplicate detection, and audit side effects.
- [lib/tickets/sla.ts](./../../../lib/tickets/sla.ts) owns SLA hour constants and breach-time computation.
- [app/(dashboard)/tickets/actions.ts](./../../../app/%28dashboard%29/tickets/actions.ts) owns form parsing, permission thresholds, mutation orchestration, and cache invalidation.
- [app/(dashboard)/tickets/_lib/cache-tags.ts](./../../../app/%28dashboard%29/tickets/_lib/cache-tags.ts) owns user-scoped list and detail cache-tag names.

## Rules to preserve

- Ticket enums in [prisma/schema.prisma](./../../../prisma/schema.prisma) must stay aligned with the string unions and guard helpers in [lib/tickets/service.ts](./../../../lib/tickets/service.ts).
- `createTicket` in [lib/tickets/service.ts](./../../../lib/tickets/service.ts) trims text input, normalizes optional ids to `null`, sets `pendingAssetLink` when no asset is linked, computes `slaBreachedAt`, and records a `Created` activity in the same transaction.
- Ticket mutations that change status, priority, assignee, or notes must also write a matching `TicketActivity` row.
- Reopening a closed ticket is a stronger operation than ordinary status changes. In [app/(dashboard)/tickets/actions.ts](./../../../app/%28dashboard%29/tickets/actions.ts), `Closed -> Open` requires `tickets:manage`; ordinary status changes require `tickets:write`.
- Duplicate detection is intentionally narrow: `checkDuplicateTicket` in [lib/tickets/service.ts](./../../../lib/tickets/service.ts) looks for the same customer plus a trimmed title substring within the last 24 hours.
- SLA recomputation is priority-driven. When priority changes, [lib/tickets/service.ts](./../../../lib/tickets/service.ts) recomputes `slaBreachedAt` from the ticket's original `createdAt` using [lib/tickets/sla.ts](./../../../lib/tickets/sla.ts).
- Ticket list and ticket detail cache tags are user-scoped. Mutations in [app/(dashboard)/tickets/actions.ts](./../../../app/%28dashboard%29/tickets/actions.ts) revalidate both the list tag and the affected detail tag.
- Ticket reference data for the new-ticket page is cached off the same user-scoped list tag in [app/(dashboard)/tickets/new/page.tsx](./../../../app/%28dashboard%29/tickets/new/page.tsx).

## Common change patterns

- Adding a new ticket mutation:
  - enforce access through [app/(dashboard)/admin/_lib/current-application-user.ts](./../../../app/%28dashboard%29/admin/_lib/current-application-user.ts)
  - preserve the right permission threshold for the action
  - write audit activity when the mutation changes ticket state
  - revalidate ticket list and detail tags for the acting user
- Extending ticket list filters:
  - keep parsing and guard logic close to [app/(dashboard)/tickets/page.tsx](./../../../app/%28dashboard%29/tickets/page.tsx)
  - keep query behavior centralized in [lib/tickets/service.ts](./../../../lib/tickets/service.ts)

## Anti-patterns

- Do not update ticket persistence without updating the corresponding activity side effect when the mutation is observable in the UI.
- Do not broaden cache invalidation to global tags when the existing design is user-scoped.
- Do not move ticket enum truth into page-local form code.
- Do not treat blank optional ids as empty strings in persistence.

## Verification anchors

- [lib/tickets/service.test.ts](./../../../lib/tickets/service.test.ts) covers pagination clamping, duplicate detection, input normalization, SLA recomputation, and activity writes.
- [app/(dashboard)/tickets/actions.test.ts](./../../../app/%28dashboard%29/tickets/actions.test.ts) covers permission thresholds, validation short-circuits, redirects, and cache revalidation.