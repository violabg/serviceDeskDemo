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
3. Select only repository knowledge that matches the task, using `docs/agents/knowledge/README.md` when it exists. Do not bulk-load unrelated knowledge files.
4. Do bounded discovery only where needed to identify existing patterns.
5. Produce a file-level plan using the plan schema. In the Filesystem Tree, render each path as a markdown link to its File Details anchor (`#file-<slug>` where slug = path lowercased with `/` and `.` replaced by `-`). Place a matching `<a id="file-<slug>"></a>` tag immediately before each `### \`<path>\`` heading in File Details.
6. For every file with executable business logic, include coverage scenarios.
7. Include focused validation commands.
8. For material file changes, include concise before/after snippets in `Proposed Diffs` so the implementor can review intended edits before changing files.
9. Ask for explicit user approval before implementation.
10. Require approval metadata in the session artifact package before implementation handoff.

Use [the plan schema](./references/plan-schema.md).
