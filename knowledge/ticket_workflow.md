---
title: "ticket_workflow"
tier: "PerContext"
intent: "When changing ticket creation, reference data, ticket status, priority or technician changes, notes, or the activity log."
editable: true
---
# When to read this

Read this before adding or changing ticket creation, the new-ticket reference data, ticket status, priority or technician changes, notes, or the ticket activity log.

## Ticket Record and Vocabulary

A Ticket belongs to one Customer and was created by one user. It may have an Asset and an assigned technician.

```ts
// Service constants and types
TICKET_STATUSES   = ["Open", "InProgress", "Pending", "Resolved", "Closed"]
TICKET_PRIORITIES = ["Critical", "High", "Medium", "Low"]
TICKET_CATEGORIES = ["Hardware", "Software", "Network", "Account", "Other"]
INTAKE_CHANNELS   = ["Email", "Phone", "Portal", "Chat", "WalkIn"]
```

Each ticket also stores `requesterContact`, `pendingAssetLink`, `slaBreachedAt`, `resolvedAt`, `createdById` and `assignedToId`.

## Ticket Creation

`createTicketAction` requires `tickets:write`. It reads the form fields, trims text, and checks the enumerated values with the `is*` guards. It also checks that the chosen customer is Active. When any check fails, the action returns without creating anything.

```ts
const customer = await getActiveCustomerById(customerId)
if (!customer) return { success: false, error: "Select a valid active Customer." }

const ticket = await createTicket({ ...fields, assetId, assignedToId }, access.user.id)
updateTag(ticketListTag())
redirect(`/tickets/${ticket.id}`)
```

`createTicket` runs in one transaction. It stores the ticket with:

- `pendingAssetLink` set to true when no asset was given;
- `slaBreachedAt` set from the priority and the creation time, using the SLA table below;
- an activity record of type `Created`, whose new value is the initial status.

Reference data for the new-ticket form comes from three reads: `getActiveCustomers` returns Active customers with id, name, email and company; `getAssets` returns assets with id, name, serial number and category; `getAvailableTechnicians` returns users with id, name and email. The new-ticket page caches them under the ticket reference tag, and customer changes expire that tag.

## Status, Priority and Technician Changes

Each change follows the same pattern: check the permission, call the service in a transaction, write an activity record, then expire the detail and list tags.

```ts
// status: tickets:write, except reopening a Closed ticket to Open, which needs tickets:manage
await updateTicketStatus(ticketId, status, access.user.id)   // sets resolvedAt for Resolved or Closed
updateTag(ticketDetailTag(ticketId))
updateTag(ticketListTag())

// priority: tickets:write
await updateTicketPriority(ticketId, priority, access.user.id)  // recomputes slaBreachedAt
updateTag(ticketDetailTag(ticketId))
updateTag(ticketListTag())

// technician: tickets:write; null clears the assignment
await assignTechnician(ticketId, technicianId, access.user.id)
updateTag(ticketDetailTag(ticketId))
updateTag(ticketListTag())
```

Activity types written by these changes are `StatusChanged`, `PriorityChanged` and `AssigneeChanged`. Each stores the previous and new value.

## Reopen Rule

Reopening a Closed ticket is a special case. The action reads the current ticket first, and only when the current status is `Closed` and the requested status is `Open` does it require `tickets:manage`. Every other status change requires `tickets:write`.

```ts
const isReopen = currentTicket.status === "Closed" && status === "Open"
if (isReopen) { if (!isManageAllowed(permissions)) return }
else if (!isWriteAllowed(permissions)) return
```

## SLA

The SLA is a fixed number of hours per priority, counted from the creation time.

```ts
SLA_HOURS = { Critical: 4, High: 8, Medium: 24, Low: 72 }
computeSlaBreachAt(priority, createdAt) = createdAt + SLA_HOURS[priority] hours
isSlaBreached(slaBreachedAt) = slaBreachedAt exists and is earlier than now
```

Priority changes call `computeSlaBreachAt` again with the ticket's original creation time, so the breach time moves with the new priority. The ticket list filter `slaBreached` selects tickets whose breach time is earlier than now.

## Notes and Activity

`addTicketNote` trims the content and rejects empty content by throwing. It then creates the note and a `NoteAdded` activity whose new value is the first 120 characters of the note. Notes are shown newest first, with their author. Notes need `tickets:write` and expire only the ticket detail tag.

`getTicketById` returns the ticket with its customer, asset, assignee, creator, notes and activities, with notes and activities newest first.

Example: a user with `tickets:write` changes a ticket's priority from Medium to High. The action updates the priority, recomputes `slaBreachedAt` from the original creation time with the 8-hour High window, writes a `PriorityChanged` activity with previous value Medium and new value High, then expires the detail and list tags.

## Cache Invalidation

| Action | Tags expired |
| --- | --- |
| Create | ticket list (then redirect to the detail page) |
| Status change | ticket detail, ticket list |
| Priority change | ticket detail, ticket list |
| Technician change | ticket detail, ticket list |
| Note | ticket detail |

## Pitfalls to avoid

- Changing a ticket without writing its activity record. Each change type has its own activity type, and the activity log is the audit trail.
- Checking only the write permission when reopening a Closed ticket. Reopening needs `tickets:manage`.
- Changing priority without expecting the SLA breach time to move. The breach time is recomputed from the original creation time.
- Creating a ticket for a customer that is not Active. The action rejects it.
- Expiring only the list tag after a note, or only the detail tag after a create. Each action expires the tags in the table above.
