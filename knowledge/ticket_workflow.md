---
title: "ticket_workflow"
tier: "PerContext"
intent: "When changing ticket creation, reference data, ticket status, priority or technician changes, notes, or the activity log."
editable: true
---
# When to read this

Read this before changing ticket creation, ticket status, priority or technician changes, notes, or the activity log. Read the code for signatures and field names; this document keeps only the rules that the code does not state on its own.

## Business Rules

- A ticket belongs to one Active customer and was created by one user. It may have an asset and an assigned technician.
- Every status, priority, technician or note change writes an activity record. The activity log is the audit trail.
- Creating a ticket needs the `tickets:write` key; every change to an existing ticket, including reopening a Closed ticket, its status, its priority, its technician and its notes, needs the `tickets:manage` key.
- A holder of `tickets:write` alone opens every ticket page and can create a ticket, with the status, priority, technician and note controls disabled. Do not treat that write grant as permission to change a ticket.
- Changing priority moves the SLA breach time, counted from the original creation time.
- Cancelling a status, priority or technician edit writes no activity record.
