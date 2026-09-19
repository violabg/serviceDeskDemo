# Testing Flow Checklist

## When to read this

Read this before planning, creating, changing, or running tests for approved demo work.

## Do not use this for

Do not use this for broad app architecture or UI composition decisions that do not change test scope or validation order.

## Last verified

2026-07-22, dirty worktree. Evidence from repository files:

- `.github/agents/DemoPlanner.agent.md`
- `.github/agents/DemoImplementor.agent.md`
- `.github/agents/DemoTester.agent.md`
- `.agents/skills/test-strategy/SKILL.md`
- `package.json`
- `vitest.config.ts`

## Evidence

- Repo uses Vitest through `pnpm test`.
- Repo uses `tsc --noEmit` through `pnpm typecheck`.
- Repo does not define a dedicated lint script narrower than the top-level `eslint` entry.
- Approved test work already targets repo-owned forms, pages, actions, and services rather than `components/ui/**` primitives.

## Core rules

- Never create or extend tests for files under `components/ui/**` unless the user explicitly overrides that rule.
- Treat files under `components/ui/**` as shadcn primitives or primitive wrappers, not first-choice test targets.
- Test repo-owned behavior surfaces instead: feature forms, pages, server actions, services, navigation wrappers, and domain helpers.
- When a repo-owned component composes shared primitives, test the repo-owned component behavior, not the primitive implementation.

## Validation order

- First check affected files for editor diagnostics.
- Fix in-scope diagnostics before running tests.
- Run the narrowest lint or typecheck step available for the affected files or affected scope before tests.
- If the repo has no meaningful narrow lint step, use diagnostics plus `pnpm typecheck` before tests.
- Run only new or directly affected tests first.
- Broaden to grouped regression or full-suite runs only after focused checks pass.

## Planning rules

- `test-plan.md` should name the affected test files or affected test commands first.
- `test-plan.md` should state deliberate exceptions explicitly, especially when `components/ui/**` is excluded.
- If a feature touches forms, server actions, or business logic, plan focused unit coverage before any broad regression step.

## Implementor and Tester rules

- Implementor and tester should both prefer the smallest affected-test command before any wider suite.
- Full `pnpm test` belongs after focused validation, not before.
- If a focused failure proves a narrow in-scope implementation defect, repair that slice and rerun the same focused command first.

## Pitfalls to avoid

- Writing direct tests for shadcn primitive files under `components/ui/**`.
- Jumping straight to full-suite validation when only one feature slice changed.
- Running tests before clearing obvious diagnostics in the touched files.
- Using broad lint or full regression commands as the first validation step when a narrower check exists.
