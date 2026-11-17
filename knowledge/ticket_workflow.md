---
title: "ticket_workflow"
tier: "PerContext"
intent: "When changing ticket creation, reference data, ticket status, priority or technician changes, notes, or the activity log."
editable: true
---
# Tickets

- A ticket belongs to one Active customer and one creating user; an asset and a technician are optional.
- `tickets:write` creates a ticket. `tickets:manage` performs every change to an existing ticket: status, priority, technician, notes, and reopening a Closed ticket.
- Every status, priority, technician or note change appends an activity record; the activity log is the audit trail. Cancelling such an edit writes none.
- Changing priority moves the SLA breach time, measured from the original creation time.
