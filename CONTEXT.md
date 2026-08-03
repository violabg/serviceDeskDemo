# Service Desk Context Glossary

This glossary records stable code and domain vocabulary. Select operational guidance through `docs/agents/knowledge/README.md`; do not use this file as a knowledge index.

| Term | Preferred Meaning | Avoided or Related Terms | Source of Truth |
| --- | --- | --- | --- |
| User | An authenticated internal application identity. A User can hold one or more roles and can create, receive assignment for, author notes on, or act on tickets. | Do not use for an external ticket requester. | `prisma/schema.prisma` `User` model |
| Customer | An external service-desk contact associated with tickets. A Customer has contact details and can have many tickets. `Customer` is the canonical term for application code and user-facing labels. | `Client` is a synonymous explanatory term only. New domain code must use `customer`, never `client`, `Client`, or `cliente`. Technical terms such as React Client Components, client-side execution, and `@prisma/client` are unrelated and remain valid. | `prisma/schema.prisma` `Customer` model |
| Role | A named collection of permissions assigned to Users. | Do not treat a role as a permission. | `prisma/schema.prisma` `Role` and `UserRole` models |
| Permission | A unique section and operation grant, assigned to roles. The supported code-defined sections are dashboard, users, roles, and tickets; supported operations are read, write, and manage. | Do not derive permission identifiers from client input. | `lib/access-control.ts` and `prisma/schema.prisma` |
| Access Management | The domain area for Users, Roles, and Permissions. | Do not infer its public URL from a route-group folder name. | Access-control and dashboard-navigation knowledge |
| Ticket | A service-desk work item linked to one Customer and created by one User. It can have an optional asset and assignee, notes, and activity records. | `Account` is a ticket category, not a primary entity. | `prisma/schema.prisma` `Ticket` model |
| Ticket status | The lifecycle values Open, InProgress, Pending, Resolved, and Closed. | Do not invent status values. | `prisma/schema.prisma` `TicketStatus` enum |
| Ticket priority | The urgency values Critical, High, Medium, and Low. | Do not infer SLA behavior from a priority without reading ticket SLA knowledge or code. | `prisma/schema.prisma` `TicketPriority` enum |
| Intake channel | The source values Email, Phone, Portal, Chat, and WalkIn. | Do not collapse intake channel into ticket category. | `prisma/schema.prisma` `IntakeChannel` enum |
