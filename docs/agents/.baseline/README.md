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

Generated workflow artifacts live in local, gitignored `sessions/<planning-session-id>/` packages. Planning starts from a GitHub issue such as `#12`. After retrieving its type, the default session is `bug-12` or `us-12`; the issue ID and session ID are distinct. Resume only an explicitly supplied or active session, including previously approved custom IDs. The Planner writes the artifacts required by [the artifact contract](docs/agents/artifact-gates.md) and [plan schema](docs/agents/plan-schema.md). Integration Tester uses [the YAML test-plan schema](docs/agents/test-plan-schema.md).

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

## Agent Flow

Use `demo-planner` for GitHub-issue planning, then `demo-implementor` for approved-plan execution. Select `demo-direct-implementor` explicitly for direct implementation from validated requirements without a plan document; it never creates tests.

| Agent | Purpose |
| --- | --- |
| demo-planner | Issue intake, clarification, knowledge selection and implementation planning |
| demo-implementor | Approved-plan execution and authorized unit-test work |
| demo-direct-implementor | Direct implementation with knowledge/session/validation gates; no test creation |
| demo-integration-tester | Integration-test planning and execution |
| demo-knowledge-builder | Evidence-backed knowledge and index maintenance |
| demo-ask | Read-only codebase and programming Q&A |
| demo-vision | Luna image extraction when the calling model lacks vision |

Codex registrations live in `.codex/agents/`; Copilot registrations live in `.github/agents/`. Their full preserved contracts and maintenance evidence live in `docs/agents/`.

Generated skills use explicit `demo-` invocation names: `demo-author-repo-skill`, `demo-plan-bug-from-id`, `demo-plan-user-story-from-id`, `demo-user-story-analysis`, and `demo-integration-test-knowledge-checklist`. The two issue-planning skills run within `demo-planner`. The gap-detector skill is deferred.

Read [integration bindings](docs/agents/integration-bindings.md) for role-specific GitHub, Neon and Next.js access. Read [compatibility evidence](docs/agents/compatibility.md) for verified and outstanding client checks. Reload the client after installation and confirm role and skill discovery before relying on an unverified operation.
