---
name: service-desk-domain
description: "Use when: working on the Service Desk IT demo domain, including tickets, clients, technicians, assets, dashboard, reports, administration, SLA, priority, status, assignment, and Neon Auth roles."
argument-hint: "Provide a service desk feature or workflow"
---

# Service Desk Domain

Use this skill to keep demo requirements grounded in a realistic Service Desk IT domain.

## Core Modules

- Dashboard: operational overview, SLA risk, queue health, technician workload.
- Tickets: list, create, detail, assignment, status changes, comments, priority, SLA.
- Clients: organizations or requesters receiving IT support.
- Technicians: support staff who own or participate in ticket resolution.
- Assets: devices, software, licenses, or infrastructure linked to clients and tickets.
- Reports: operational and historical views.
- Administration: reference data, roles, permissions, and configuration.

## Common Ticket States

- New
- Triaged
- Assigned
- In Progress
- Waiting for Customer
- Resolved
- Closed

## Common Risks

- Ticket ownership ambiguity
- Missing authorization on client or technician data
- SLA calculations that ignore waiting states or business hours
- Asset links that become stale after reassignment
- Reports that expose data across tenant or client boundaries
