---
name: test-strategy
description: "Use when: creating Vitest and React Testing Library test plans, coverage scenarios, component behavior tests, business logic tests, regression tests, and validation commands for the service desk demo."
argument-hint: "Provide approved spec, plan, or changed files"
---

# Test Strategy

Use this skill to produce focused and executable test plans.

Follow `docs/agents/governance.md` as the durable workflow policy source.

## Procedure

1. Read the spec, implementation plan, and coverage scenarios.
2. Classify test needs using the testing matrix.
3. Default to planning unit tests when the scope includes breakable forms, server actions, or business logic.
4. Treat these as required unit-test candidates unless the artifact set records an explicit reason they are out of scope or not meaningfully testable in the current design.
5. For forms, plan unit coverage for validation rules, branching state, derived values, normalization, and submission payload shaping when present.
6. For server actions and mutation handlers, plan unit coverage for authorization, input validation, branching outcomes, persistence orchestration, and returned error/success states when present.
7. For business logic, plan unit coverage for edge cases, permission rules, calculations, status changes, SLA behavior, filtering, sorting, and mapping logic when present.
8. Prefer business behavior assertions over implementation-detail assertions.
9. Identify existing tests to extend before creating new files.
10. Exclude `components/ui/**` from planned test scope by default because those files are shadcn primitives, not repo-owned behavior surfaces.
11. For shared UI composition, prefer testing the repo-owned wrapper, page, form, or feature component that composes the primitive.
12. Define the narrowest validation commands.
13. Order validation commands like this when possible: diagnostics for affected files, narrow lint or typecheck for affected files, affected tests, broader regression commands.
14. When the repo has no meaningful narrow lint command, say so explicitly and use diagnostics plus typecheck before tests.
15. Capture residual risk if a scenario cannot be automated in the current demo.
16. Keep test planning inside tester scope; do not silently widen into implementation or review responsibilities.

Use [the testing matrix](./references/testing-matrix.md).
