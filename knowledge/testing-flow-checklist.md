---
tier: "PerContext"
intent: "Before planning, creating, changing, or running tests or validation for repository work."
---
# Testing Flow Checklist

## When to read this

Read this before planning, creating, changing, or running tests for approved demo work.

## Do not use this for

Do not use this for broad app architecture or UI composition decisions that do not change test scope or validation order.

## Core rules

- Never create or extend tests for files under `components/ui/**` unless the user explicitly overrides that rule.
- Treat files under `components/ui/**` as shadcn primitives or primitive wrappers, not first-choice test targets.
- Test repo-owned behavior surfaces instead: feature forms, pages, server actions, services, navigation wrappers, and domain helpers.
- When a repo-owned component composes shared primitives, test the repo-owned component behavior, not the primitive implementation.

## Validation order

- First check affected files for editor diagnostics.
- Fix in-scope diagnostics before running tests.
- Run `pnpm typecheck` and scoped ESLint for the affected files before tests; `pnpm exec eslint <affected-files>` is available even without a separate narrow lint script.
- Use `pnpm exec vitest run <affected-test-files>` to constrain the Vitest run to specific files. Confirm the command selects only the intended tests in the active package-manager version.
- Run only new or directly affected tests first.
- Broaden to grouped regression or full-suite runs only after focused checks pass.
- Before handing work back, the repository rule in `AGENTS.md` applies in full: `pnpm lint && pnpm typecheck && pnpm test`. Focused runs come first during development; the full sequence is the handback gate.

## Planning rules

- A test plan should name the affected test files or affected test commands first.
- A test plan should state deliberate exceptions explicitly, especially when `components/ui/**` is excluded.
- If a feature touches forms, server actions, or business logic, plan focused unit coverage before any broad regression step.

## Implementor and verifier rules

- The implementor and any verifier should both prefer the smallest affected-test command before any wider suite.
- Full `pnpm test` belongs after focused validation, not before.
- If a focused failure proves a narrow in-scope implementation defect, the implementor repairs that slice within its authorized scope and reruns the same focused command.
- `sd-implementation-verifier` is read-only and judges congruence with the specification; it does not edit production code.

## Pitfalls to avoid

- Writing direct tests for shadcn primitive files under `components/ui/**`.
- Jumping straight to full-suite validation when only one feature slice changed.
- Running tests before clearing obvious diagnostics in the touched files.
- Using broad lint or full regression commands as the first validation step when a narrower check exists.
- Referring to `docs/agents/test-plan-schema.md` or to an Integration Tester role: neither exists in the current repository.
