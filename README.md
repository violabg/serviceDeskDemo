# Enterprise Agentic Development Demo Pack

This folder contains a standalone agentic development demo pack for an enterprise Service Desk IT application. It is inspired by the MoltiAgent workflow, but it is adapted for a teaching demo and does not replace or modify the existing company tooling.

## Purpose

The demo shows the difference between a traditional prompt and an enterprise agentic workflow:

1. Intake a GitHub issue from `violabg/serviceDeskDemo`.
2. Create or reuse a named planning session under `sessions/<session-id>/`.
3. Analyze gaps, ambiguity, risks, and missing acceptance criteria.
4. Ask focused grooming questions.
5. Produce a specification and task breakdown.
6. Produce an implementation plan with file-level intent, proposed diffs, and test coverage scenarios.
7. Hand the approved plan to an implementor.
8. Create or update tests.
9. Review the result and produce PR-ready artifacts.

## Layout

Generated workflow artifacts live in local, gitignored `sessions/<planning-session-id>/` packages. Planning starts from a GitHub issue such as `#12`. Before retrieving the issue, the planning skill proposes the session ID from its own type, `bug-12` or `us-12`, and waits for your confirmation; the issue ID and session ID are distinct. Resume only an explicitly supplied or active session, including previously approved custom IDs. The Planner writes the artifacts required by [the artifact contract](docs/agents/artifact-gates.md) and [plan schema](docs/agents/plan-schema.md). Integration Tester uses [the YAML test-plan schema](docs/agents/test-plan-schema.md).

## Demo Stack

- Next.js App Router
- React + TypeScript
- Prisma
- Neon DB
- Neon Auth
- GitHub Issues and Projects
- Vitest
- React Testing Library

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