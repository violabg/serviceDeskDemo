# Artifact, Gate, and Handoff Template

## Artifact Package

Minimum durable planning package:

- session identity record for the active Planning Session ID
- `session-brief.md`
- `tracker-evidence.md`
- `session-identity.md`
  Optional compatibility summary when a generated system still wants a one-file rollup alongside the more specific session files.
- one deterministic requirement or tracker evidence artifact, for example `bug_<external-issue-id>_info.md`, `bug_<external-issue-id>_details.md`, `us_<external-issue-id>_info.md`, `task_<external-issue-id>_info.md`, or `request_<slug>_info.md`
- `normative_rules_inventory.md`
- `clarification_questions.md` when blocking clarification exists
- one deterministic implementation-plan artifact named `<plan-name>.plan.md`

Add evidence artifacts when the request requires them:

- bug cause selection artifact such as `bug_<external-issue-id>_cause_analysis.md`
- visual evidence artifacts such as `bug_<external-issue-id>_screenshot.md`, `bug_<external-issue-id>_screenshot.slimui.md`, `<image-name>.slimui.md`, or another approved deterministic structured visual file
- stakeholder or decision log when non-trivial user choices change scope or design
- selected-knowledge summary when the knowledge inventory cannot live directly inside the plan
- implementor-side changed-files or validation artifact after code work begins

Rules:

- Prefer deterministic, issue-scoped artifact names over generic names like `tracker-evidence.md`.
- Preserve the upstream family name when it is already established by the intake flow. `*_info` and `*_details` are both valid issue-evidence families when they reflect the actual gathered content.
- Keep artifact frontmatter machine-friendly when the runtime supports it: `name`, `description`, `intented_use`, `mime_type`, and `artifact_content_type` are the current upstream shape.
- The implementation plan is one artifact in the package, not the package itself.

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
| Scope Intake | Stop wrong workflow early | Planner | issue or request evidence artifact |
| Clarification Resolved | Avoid planning over blocking ambiguity | Planner + user | `clarification-questions.md` |
| Knowledge Selected | Read the knowledge index first, then load only task-matched knowledge | Planner | selected-knowledge summary or implementation-plan section |
| Rule Inventory | Convert docs into explicit planning constraints | Planner | `normative_rules_inventory.md` |
| Bounded Discovery | Avoid broad repository tours | Planner or scout | implementation-plan notes plus supporting evidence artifacts when needed |
| Plan Approval | Prevent unapproved implementation | User | `<plan-name>.plan.md` |
| Handoff Completeness | Prevent downstream guessing | Sending agent | handoff section or file |
| Focused Validation | Prove touched behavior first | Implementor or Tester | execution report, changed-files artifact, or validation notes |
| Review Readiness | Ensure review has artifacts and validation | Human, PR surface, gate, or dedicated review agent when justified | review notes or validation artifact |

For every accepted gate, record why it belongs in this repository. For every high-cost or rejected gate, record why the workflow can proceed without it.

## Handoff Envelope

```markdown
## Handoff Envelope

- External Issue ID:
- Planning Session ID:
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
