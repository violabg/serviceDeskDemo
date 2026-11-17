---
tier: "PerContext"
intent: "Before planning, creating, changing, or running tests or validation for repository work."
---
# Testing

- Never add or extend tests for the shared UI primitive layer unless the user explicitly overrides it. Test the repo-owned surface instead: feature forms, pages, server actions, services, navigation wrappers, domain helpers.
- When a repo-owned component composes primitives, test the component's behaviour, not the primitive's.
- Order: clear editor diagnostics in the touched files, then typecheck, then scoped lint, then the affected tests, then broader regression.
- Constrain the test run to the affected files and confirm it selected only the intended tests.
- A test plan names the affected test files or commands up front, states deliberate exclusions explicitly, and puts focused coverage before broad regression for forms, actions and business logic.
- A focused failure that proves an in-scope defect is repaired in scope and the same focused command rerun.
- Handing work back means the full repository gate, not a focused run.
