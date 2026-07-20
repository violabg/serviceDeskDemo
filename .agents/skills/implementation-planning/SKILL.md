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
5. Produce a file-level plan using the plan schema. In the Filesystem Tree, render each path as a markdown link to its File Details anchor (`#file-<slug>`). Build the slug by lowercasing the path, replacing every run of non-alphanumeric characters with `-`, and trimming leading or trailing `-`. Place a matching `<a id="file-<slug>"></a>` tag immediately before each `### \`<path>\``heading in File Details, then add a visible backlink line directly under the heading that points back to the Filesystem Tree section slug`#3-filesystem-tree`.
6. For every file with executable business logic, include coverage scenarios.
7. Include focused validation commands.
8. In each File Details entry for a materially changed file, choose the review block format by operation. For `MODIFIED` files, include a `Proposed Diff` using a `diff` fenced block so removals render in red and additions render in green where supported. For `NEW` files, include a `Proposed File` block with the full planned file contents in a language-appropriate fenced block such as `ts`, `tsx`, `sql`, `md`, `json`, or `prisma`; do not collapse a new file into placeholder comments, omitted lines, or tiny stubs unless the user explicitly asks for a shortened plan.
9. Ask for explicit user approval before implementation.
10. Require approval metadata in the session artifact package before implementation handoff.

Use [the plan schema](./references/plan-schema.md).
