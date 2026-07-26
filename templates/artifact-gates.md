# Artifact, Gate, And Handoff Contract

This repo-local template is adapted from `.agents/skills/bootstrap-agentic-system/templates/artifact-gates.md`.

## Artifact Package

Minimum session package for planning-ready work:

- `session-brief.md`
- `requirements-analysis.md`
- `clarification-questions.md`
- `spec.md`
- `task-breakdown.md`
- `implementation-plan.md`
- `test-plan.md`

Add these when the workflow reaches implementation, testing, or review:

- `changed-files.md`
- `review-report.md`
- `handoff-<from>-to-<to>.md`

Add normalized evidence artifacts when raw inputs affect scope:

- tracker intake
- root-cause analysis
- visual contract under `visual/`
- stakeholder decision log

## Gate Definition

Every accepted gate must use `Gate <n>: <gate name>` and record:

| Field              | Meaning                                                  |
| ------------------ | -------------------------------------------------------- |
| Trigger            | Event that reaches the gate                              |
| Pass Condition     | Observable condition that allows progress                |
| Fail Condition     | Observable condition that blocks progress                |
| Approver Or Waiver | Human or agent allowed to approve or waive               |
| Artifact Record    | File and fields preserving evidence                      |
| Rollback           | How to undo or recover if the gate is too heavy or wrong |

## Repository Gate Catalog

| Gate                           | Purpose                                                              | Typical Owner              | Artifact Record                              |
| ------------------------------ | -------------------------------------------------------------------- | -------------------------- | -------------------------------------------- |
| Gate 0: Scope Intake           | Stop wrong workflow early                                            | Planner                    | `session-brief.md`                           |
| Gate 1: Session Activation     | Ensure one current session exists before evidence gathering          | Planner                    | `session-brief.md`                           |
| Gate 2: Knowledge Selected     | Read the index first and load only matching knowledge                | Planner                    | `implementation-plan.md`                     |
| Gate 3: Clarification Resolved | Avoid planning over blocking ambiguity                               | Planner and user           | `clarification-questions.md`                 |
| Gate 4: Bounded Discovery      | Avoid broad repository tours                                         | Planner or Context Scout   | `implementation-plan.md`                     |
| Gate 5: Plan Schema Adherence  | Preserve required links, anchors, metadata, validation, and rollback | Planner                    | `implementation-plan.md`                     |
| Gate 6: Plan Approval          | Prevent unapproved implementation                                    | User                       | `session-brief.md`, `implementation-plan.md` |
| Gate 7: Focused Validation     | Prove touched behavior before broad validation                       | Implementor or Tester      | `changed-files.md`, validation notes         |
| Gate 8: Review Readiness       | Ensure review has artifacts and validation                           | Human or PR review surface | `review-report.md` or handoff                |

## Handoff Envelope

```markdown
## Handoff Envelope

- Session ID:
- From Agent:
- To Agent:
- Current Gate:
- Approval State:
- Required Artifacts:
- Selected Knowledge:
- Open Questions:
- Blocking Risks:
- Definition of Done for Next Agent:
```

## Approval Metadata

```markdown
## Approval Status

- Approved: false
- Approved By:
- Approved At:
- Source Message:
```

Rule: chat approval alone is not enough for generated systems that write code. The artifact must record approval metadata before implementation starts.
