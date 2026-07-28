# Agent Knowledge Index

This repo-local knowledge index is derived from `.agents/skills/bootstrap-agentic-system/templates/knowledge-index-schema.md`.

## Purpose

Help planning and implementation agents choose the smallest useful knowledge set for a task.

## Token Budget Rule

- Read this index before loading knowledge files.
- Do not bulk-load all knowledge files.
- Load only files whose `When to read` triggers match the current task.
- Prefer the smallest set that can constrain requirements, plan scope, validation, and handoff.
- Record selected files and skipped related candidates in planning artifacts.

## Knowledge Entries

| ID | Path | Topic | When to read | Do not read when | Key rules to extract |
| --- | --- | --- | --- | --- | --- |
| K1 | [nextjs-server-execution-checklist.md](./nextjs-server-execution-checklist.md) | App Router execution rules | Before adding or changing app router pages, layouts, or mutations in dashboard and admin areas | The task is limited to shared utilities, docs, or non-App Router code | Server execution boundaries, server action constraints, route ownership rules |
| K2 | [base-ui-composition-checklist.md](./base-ui-composition-checklist.md) | Base UI wrapper composition | Before creating or updating Base UI wrappers, button-link composition, and navigation controls | No Base UI wrapper or navigation control changes are in scope | Composition safety rules, primitive ownership, accessible interaction constraints |
| K3 | [dashboard-forms-best-practices.md](./dashboard-forms-best-practices.md) | Dashboard form patterns | Before creating or refactoring interactive dashboard forms that use server actions | The task does not touch dashboard forms or form mutations | Form validation, server action wiring, loading and error handling rules |
| K4 | [dashboard-navigation-boundaries.md](./dashboard-navigation-boundaries.md) | Dashboard navigation ownership | Before adding or changing dashboard breadcrumbs, grouped sidebar navigation, or grouping-only dashboard route structure | Navigation, breadcrumbs, and dashboard grouping are untouched | Navigation ownership, grouping boundaries, breadcrumb rules |
| K5 | [dashboard-section-permission-flow-checklist.md](./dashboard-section-permission-flow-checklist.md) | Section permission flow | When adding a new dashboard or admin section, grouped navigation entry, and related permissions | The task does not add a section, route entry, or permission boundary | Permission flow, section exposure, access gating rules |
| K6 | [shared-component-reuse-checklist.md](./shared-component-reuse-checklist.md) | Shared component reuse | Before adding new UI components to ensure existing shared primitives are reused | No UI component or wrapper work is planned | Reuse requirements, duplication avoidance, wrapper selection rules |
| K7 | [nextjs-cache-components-pattern.md](./nextjs-cache-components-pattern.md) | Cache component pattern | When adding or refactoring pages that need caching, skeleton states, or the Suspense + `connection()` pattern | The task does not change page caching, skeleton flow, or Suspense behavior | Caching boundaries, skeleton usage, connection pattern rules |
| K8 | [testing-flow-checklist.md](./testing-flow-checklist.md) | Test planning and execution | Before planning, creating, changing, or running tests for approved demo work | The task is pure documentation or workflow editing with no test or validation implication | Test scope order, validation sequence, excluded surfaces, focused regression rules |
| K9 | [access-control-navigation-checklist.md](./access-control-navigation-checklist.md) | Access control and navigation gating | Before changing permissions, role management, gated navigation, dashboard redirects, or `/pending-access` behavior | The task does not touch access-control, role/permission logic, gated navigation, or dashboard access flow | Code-defined permissions, effective permission rules, redirect boundaries, navigation gating rules |

## Selection Workflow

1. Restate the task in one sentence.
2. Match task terms, domain area, workflow risk, and expected artifacts against the `When to read` triggers.
3. Select only matching knowledge entries.
4. Read selected files and extract a rule inventory.
5. If no entry matches, record `Selected Knowledge: None` and continue with bounded discovery.
6. If a likely entry is stale or conflicts with stronger evidence, record the conflict instead of loading more files blindly.

## Artifact Record

```markdown
## Selected Knowledge

| ID | Path | Why Selected | Rules Extracted | Skipped Related Knowledge |
| --- | --- | --- | --- | --- |
| K1 | `<path>` |  |  |  |
```
