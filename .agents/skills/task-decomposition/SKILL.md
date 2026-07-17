---
name: task-decomposition
description: "Use when: decomposing a service desk user story, requirement, or approved spec into atomic frontend, backend, data, auth, and test tasks with dependencies and acceptance criteria."
argument-hint: "Provide a spec or analyzed user story"
---

# Task Decomposition

Use this skill after requirements analysis and before implementation planning.

Follow `docs/agents/governance.md` as the durable workflow policy source.

## Procedure

1. Read the requirement, analysis, and accepted clarification answers.
2. Identify independent work areas: frontend, backend, data model, auth, validation, and tests.
3. Break work into atomic tasks that can be planned independently.
4. Capture dependencies between tasks.
5. Include mockups or screenshots as required inputs for UI tasks.
6. Add task-level acceptance criteria.
7. Keep decomposition within task-builder scope; do not replace the implementation-planning step.

## Task Template

```markdown
# Task <id>: <title>

## Area of Competence

Frontend | Backend | Data | Auth | Testing | Documentation

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

## Acceptance Criteria

- [ ] ...
```
