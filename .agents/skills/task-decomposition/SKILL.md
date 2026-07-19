---
name: task-decomposition
description: "Use when: decomposing a service desk user story, requirement, or approved spec into atomic vertical slices with dependencies and acceptance criteria."
argument-hint: "Provide a spec or analyzed user story"
---

# Task Decomposition

Use this skill after requirements analysis and before implementation planning.

Follow `docs/agents/governance.md` as the durable workflow policy source.

## Procedure

1. Read the requirement, analysis, and accepted clarification answers.
2. Identify independently verifiable user or operator outcomes.
3. Break work into atomic vertical slices by default. Each slice should produce a demoable behavior or a falsifiable validation result on its own.
4. Record frontend, backend, data model, auth, validation, and test responsibilities inside the slice instead of splitting layers into separate horizontal tasks unless the work is truly layer-only.
5. Capture dependencies and blocking edges between tasks.
6. Include mockups or screenshots as required inputs for UI tasks.
7. Add task-level acceptance criteria.
8. Use expand-contract sequencing for wide refactors that cannot land as independently green vertical slices.
9. Keep decomposition within task-builder scope; do not replace the implementation-planning step.

## Task Template

```markdown
# Task <id>: <title>

## Slice Outcome

The independently verifiable behavior or result this task delivers.

## Primary Area of Competence

Frontend | Backend | Data | Auth | Testing | Documentation

## Touched Responsibilities

- Frontend:
- Backend:
- Data:
- Auth:
- Testing:
- Documentation:

## Task Goal

...

## Functional Requirements

...

## Non-Functional Requirements

...

## UX Requirements

...

## API or Data Integration

...

## Dependencies

- ...

## Blocking Edges

- ...

## Acceptance Criteria

- [ ] ...
```
