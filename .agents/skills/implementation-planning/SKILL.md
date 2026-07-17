---
name: implementation-planning
description: "Use when: creating an implementation plan for a Next.js, React, TypeScript, Prisma, Neon service desk feature, including file tree, file details, operations, validation commands, and coverage scenarios."
argument-hint: "Provide approved spec and task breakdown"
---

# Implementation Planning

Use this skill to create the plan that gates implementation.

Follow `docs/agents/governance.md` as the durable workflow policy source.

## Procedure

1. Confirm the spec and task breakdown are approved or ready for planning.
2. Identify the owning module and likely file boundaries.
3. Do bounded discovery only where needed to identify existing patterns.
4. Produce a file-level plan using the plan schema.
5. For every file with executable business logic, include coverage scenarios.
6. Include focused validation commands.
7. For material file changes, include concise before/after snippets in `Proposed Diffs` so the implementor can review intended edits before changing files.
8. Ask for explicit user approval before implementation.
9. Require approval metadata in the session artifact package before implementation handoff.

Use [the plan schema](./references/plan-schema.md).
