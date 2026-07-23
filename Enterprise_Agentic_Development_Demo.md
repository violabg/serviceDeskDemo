# Enterprise Agentic Development Demo

## Goal

Build an enterprise service desk demo that shows an AI-first delivery workflow: issue intake, grooming, specification, implementation planning, approval, implementation, testing, review, and pull request readiness.

## Stack

- Next.js App Router
- React and TypeScript
- Prisma
- Neon Postgres
- Neon Auth
- GitHub repository, issues, and projects
- GitHub MCP
- Custom agents and skills
- Vitest and React Testing Library

## Domain

Service Desk IT.

Initial application modules:

- Dashboard
- Tickets
  - List
  - New ticket
  - Detail
- Clients
- Technicians
- Assets
- Reports
- Administration

Use the repository glossary in `CONTEXT.md`. In this domain, `Account`, `User`, `Customer`, `Role`, `Access Management`, and `Permission` have specific meanings.

## Teaching Goal

Show the difference between a traditional prompt and an enterprise agentic workflow where durable policy, role boundaries, session artifacts, and validation gates carry the process.

## Agent Architecture

The current workflow is role-based:

- `Demo GitHub Issue Intake` retrieves GitHub issue facts for intake-only flows.
- `Demo Planner` converts source input into planning artifacts and approval handoff.
- `Demo Requirements Analyst` identifies functional gaps, ambiguities, risks, edge cases, and clarification questions.
- `Demo Task Builder` decomposes approved requirements into atomic frontend, backend, data, auth, and test tasks.
- `Demo Knowledge Builder` creates or updates durable repository knowledge from verified evidence after user approval.
- `Demo Vision UI` converts screenshots, mockups, and diagrams into durable `SlimUI v1` plus `Planner Notes` artifacts.
- `Demo Context Scout` returns small repository evidence packets for bounded planning questions.
- `Demo Implementor` implements only explicitly approved plans.
- `Demo Tester` creates and runs focused Vitest and React Testing Library coverage for approved work.
- `Demo Reviewer` reviews for plan conformance, defects, regressions, missing tests, accessibility, security, data integrity, and PR readiness.

## Context Engineering

Repository knowledge is modular and loaded on demand.

Canonical sources:

- `AGENTS.md`
- `docs/agents/governance.md`
- `docs/agents/common-knowledge.md`
- `docs/agents/enforcement-spec.md`
- `docs/agents/knowledge/README.md` when present
- focused files under `docs/agents/knowledge/`

Agents should read the knowledge index first, then load only files whose `When to read` trigger matches the current task.

## Sessions and Artifacts

All workflow artifacts live in local, gitignored session packages:

```text
sessions/
  <session-id>/
    session-brief.md
    requirements-analysis.md
    clarification-questions.md
    spec.md
    task-breakdown.md
    implementation-plan.md
    test-plan.md
    review-report.md
    changed-files.md
```

Session rules:

- For GitHub-driven workflows, use the GitHub issue number as the session ID.
- For offline workflows, ask the user to provide or confirm the session ID.
- Create or reuse `sessions/<session-id>/` before writing artifacts.
- Write `session-brief.md` first.
- Keep session artifacts out of commits.
- Export session artifacts as a zip package and attach them to the relevant issue ticket.
- Include `Proposed Diffs` in `implementation-plan.md` for material file changes.

## Approval Gate

Implementation can start only when both conditions are true:

1. User explicitly approves the implementation plan in chat.
2. Approval metadata exists in both `session-brief.md` and `implementation-plan.md`:
   - `Approved: true`
   - `Approved By`
   - `Approved At`
   - `Source Message`

Approved artifacts are immutable. If approved scope changes, create a revision artifact instead of silently editing the approved file.

## Validation

Artifact lint commands:

```bash
pnpm agent:lint-artifacts --mode planning-ready --session <session-id>
pnpm agent:lint-artifacts --mode approval-ready --session <session-id>
pnpm agent:lint-artifacts --mode implementation-handoff --session <session-id>
pnpm agent:lint-artifacts --mode review-ready --session <session-id>
```

Implementation and test validation commands come from the approved `implementation-plan.md` and `test-plan.md`.

## Workflow Evolution

Each feature or bug follows this path unless emergency mode is explicitly requested and recorded:

1. Issue or offline source input
2. Session package
3. Planner artifacts
4. User approval
5. Implementor changes
6. Tester validation
7. Reviewer findings and PR readiness
8. Pull request

## User Story Types

- New feature
- Refactoring
- Bug fix
- Performance
- Accessibility
- Security
- UX

## Current Prompt Examples

- `Use Demo Planner to plan issue 123 with session ID 123.`
- `Use Demo Implementor for approved session 123.`
- `Use Demo Tester to add and run focused tests for session 123.`
- `Use Demo Reviewer to review changed files for session 123.`
- `Use Demo Knowledge Builder to create durable knowledge for the access-control permission flow.`

The goal is to keep prompts small while moving process intelligence into repository-owned agents, skills, knowledge, and validation gates.
