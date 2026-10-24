# Enterprise Service Desk Demo

A Next.js demo of an enterprise IT Service Desk application, developed with an agentic system. The application code and the agentic system live side by side in this repository.

## Agentic system

The repository is driven by an orchestration system bootstrapped into `.agentic-system/`. [AGENTS.md](AGENTS.md) is the router: it lists the roles, the runtime, the skills, and the validation rules.

- **Roles** are started by the developer as the main conversation of a session: `orchestrator` (runs the `DESIGN`, `FAST_IMPLEMENTATION` or `DOCUMENTATION` workflow), `ask` (answers project questions) and `knowledge-builder` (builds project knowledge). Role definitions live in `.claude/agents` and `.github/agents`.
- **Skills** for planning bugs and user stories from work-item IDs live in `.claude/skills` and `.github/skills`.
- **Knowledge** lives in `knowledge/`, indexed by `knowledge/knowledge-index.md`. Vocabulary is resolved in `CONTEXT.md`.
- **Session state** (memory, event log, artifacts) is written to `.agentic-system-sessions/`, which is gitignored along with `sessions/`.

Runtime-owned files (`.agentic-system/`, designs, jobs and integrity seals) are changed only through `node .agentic-system/bin/agentic-system.mjs <operation>`, never by hand.

## Demo stack

- Next.js App Router
- React + TypeScript
- Prisma
- Neon DB
- Neon Auth
- Vitest
- React Testing Library

## Development

```bash
pnpm dev        # start the Next.js dev server
pnpm lint
pnpm typecheck
pnpm test
```

Every change is validated with `pnpm lint && pnpm typecheck && pnpm test`.

## Prisma and Neon

Prisma is configured for Neon Postgres with Prisma 7's Neon driver adapter.
Application queries use the pooled `DATABASE_URL`; Prisma CLI commands use
`DATABASE_URL_UNPOOLED` from `.env.local` through [prisma.config.ts](prisma.config.ts).

Useful commands:

```bash
pnpm db:generate
pnpm db:migrate
pnpm db:push
pnpm db:studio
```
