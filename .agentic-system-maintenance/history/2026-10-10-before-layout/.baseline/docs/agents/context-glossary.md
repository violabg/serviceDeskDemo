# Service Desk Context Glossary

Stable code/domain vocabulary; this is not the knowledge index. Verified against local sources on 2026-09-19.

Terminology normalization: In domain artifacts—including issue intake, user stories, bugs, acceptance criteria, plans, and implementation notes—use `Customer`/`Customers`. If source text says `Client`/`clients`, preserve the meaning but rewrite the term to `Customer`/`Customers`; `Client` is not a separate Service Desk domain entity.

| Preferred term | Meaning and boundary | Avoid confusing it with | Source |
| --- | --- | --- | --- |
| Access section | A code-owned access boundary; current sections are dashboard, users, roles and tickets | A sidebar group or an arbitrary route folder | `lib/access-control.ts` |
| Operation | One of read, write, manage | Ad hoc permission verbs | `lib/access-control.ts` |
| Base permission | A section/operation combination generated from code | A permission created by admin UI input | `lib/access-control.ts`, `docs/agents/knowledge/access-control.md` |
| Role | A collection of existing permission grants assigned to users | An access section | `lib/access-control.ts` |
| Customer | The person or organization represented by a Service Desk ticket and related customer record | `Client`/`clients` as domain terminology | `prisma/schema.prisma`, `lib/tickets/service.ts` |
| Effective permissions | The union of permission keys from a user's roles | Only the first role's permissions | `getEffectivePermissionKeys` in `lib/access-control.ts` |
| Access Management | The established navigation group for Users and Roles | Proof that an intermediate public URL exists | `docs/agents/knowledge/dashboard-navigation-boundaries.md` |
| Route group | A Next.js organizational folder such as `(admin)` that does not add a public URL segment | A routable page or a normal public path segment | `docs/agents/knowledge/dashboard-navigation-boundaries.md` |

Issue/session terminology lives in `docs/agents/github-issues-adapter.md`. Knowledge selection lives in `docs/agents/knowledge/README.md`.
