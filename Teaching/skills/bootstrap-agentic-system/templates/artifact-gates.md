# Artifact, Gate, and Handoff Template

## Artifact Package

Minimum session package:

- `session-brief.md`
- `requirements-analysis.md`
- `clarification-questions.md`
- `spec.md`
- `task-breakdown.md`
- `implementation-plan.md`
- `test-plan.md`
- `changed-files.md`
- `review-report.md`

Add normalized evidence artifacts when raw inputs affect scope:

- issue or tracker intake
- screenshot or mockup visual contract
- bug root-cause analysis
- stakeholder decision log

## Gate Definition

Every gate should answer:

| Field | Meaning |
| --- | --- |
| Trigger | Event that reaches the gate |
| Pass Condition | Observable condition that allows progress |
| Fail Condition | Observable condition that blocks progress |
| Approver or Waiver | Human or agent allowed to approve or waive |
| Artifact Record | File and fields that preserve evidence |
| Rollback | How to undo or recover if gate is too heavy or wrong |

## Candidate Gate Catalog

This catalog is a menu, not a fixed contract. Use repository discovery and failure modes to decide which gates are worth the cost. Remove irrelevant gates, add missing repo-specific gates, and rename gates to match the team's workflow language.

| Gate | Purpose | Typical Owner | Artifact Record |
| --- | --- | --- | --- |
| Scope Intake | Stop wrong workflow early | Planner | `session-brief.md` |
| Clarification Resolved | Avoid planning over blocking ambiguity | Planner + user | `clarification-questions.md` |
| Knowledge Selected | Avoid bulk context and hidden standards drift | Planner | `implementation-plan.md` |
| Rule Inventory | Convert docs into explicit planning constraints | Planner | `implementation-plan.md` |
| Bounded Discovery | Avoid broad repository tours | Planner or scout | `implementation-plan.md` |
| Plan Approval | Prevent unapproved implementation | User | `implementation-plan.md` |
| Handoff Completeness | Prevent downstream guessing | Sending agent | handoff section or file |
| Focused Validation | Prove touched behavior first | Implementor or Tester | `changed-files.md`, validation notes |
| Review Readiness | Ensure reviewer has artifacts and validation | Reviewer | `review-report.md` |

For every accepted gate, record why it belongs in this repository. For every high-cost or rejected gate, record why the workflow can proceed without it.

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
