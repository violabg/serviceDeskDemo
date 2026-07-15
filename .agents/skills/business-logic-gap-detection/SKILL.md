---
name: business-logic-gap-detection
description: "Use when: designing failing Vitest tests that expose realistic business logic gaps, edge cases, validation failures, authorization gaps, state conflicts, or data integrity issues in service desk production logic."
argument-hint: "Provide target files, classes, functions, or feature area"
---

# Business Logic Gap Detection

Use this skill to design tests that expose realistic defects before fixing production code.

## Procedure

1. Validate the target scope: feature, file, function, or business flow.
2. Identify normal flow, guard clauses, validation, authorization, state transitions, persistence outcomes, and error paths.
3. Design tests that should fail against the current production behavior if a real gap exists.
4. Reject impossible or purely speculative scenarios.
5. Run the narrowest relevant test command when test files are created.
6. If a test does not fail before the fix, revise or remove it.

## Constraints

- Do not modify production code during gap detection.
- Do not use tests to encode requirements that stakeholders have not approved.
- Do not stop at happy path coverage when branches exist.
