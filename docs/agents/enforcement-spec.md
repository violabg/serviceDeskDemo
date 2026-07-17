# Enforcement Spec

Lightweight enforcement specification for Phase 1 of the custom agentic system.

This document defines what the first lint and validation layer must check before any future runtime gate enforcement is added.

Follow `docs/agents/governance.md` as the policy source. This file translates policy into checkable rules.

## Scope

Phase 1 enforcement checks session artifact packages and handoff payloads.

It does not:

- orchestrate agent execution
- block tool calls in real time
- infer missing approval state
- rewrite artifacts automatically

Phase 1 should run on a per-session artifact package under the local gitignored `sessions/` folder and prepared for ticket attachment.

Older packages may also be restored locally by extracting a downloaded ticket zip into a `sessions/` folder and linting that restored package by session ID.

## Enforcement Goals

Phase 1 must catch the cheapest, highest-value failures early:

1. Missing required artifacts
2. Missing approval metadata
3. Invalid or incomplete handoff envelopes
4. Obvious artifact revision policy violations
5. Missing validation evidence at implementation handoff

## Operating Model

The lint input is a session artifact package root.

Common retrieval flow:

1. Download the zip attachment from the issue ticket.
2. Extract it under a local `sessions/` folder.
3. Resolve the session package root from the session ID.
4. Run the chosen lint mode against that restored package.

Common live-session flow:

1. Resolve the canonical session ID.
2. For GitHub-driven workflows, use the GitHub issue ID gathered during intake as the session ID.
3. For offline workflows, ask the user for a session ID.
4. Check whether `sessions/<session-id>/` already exists.
5. Reuse it when present.
6. Create it when missing.
7. Run lint or workflow steps against that package root.

Example logical structure:

```text
sessions/
  session-20260717-example/
    session-brief.md
    requirements-analysis.md
    clarification-questions.md
    spec.md
    task-breakdown.md
    implementation-plan.md
    test-plan.md
    review-report.md
    changed-files.md
    handoff-planner-to-implementor.md
    handoff-implementor-to-reviewer.md
```

The package may omit artifacts that were not reached yet in the workflow. The lint mode must therefore be stage-aware.

The lint entrypoint should accept a session ID and resolve it to `sessions/<session-id>/` by default.

For GitHub-driven workflows, the session ID should be the GitHub issue ID itself, for example `123`.

## Lint Modes

Phase 1 uses four modes.

### 1. `planning-ready`

Use when planning artifacts should be complete enough for approval.

Required files:

- `session-brief.md`
- `requirements-analysis.md`
- `spec.md`
- `task-breakdown.md`
- `implementation-plan.md`
- `test-plan.md`

Checks:

- all required files exist
- each file contains a title and session ID reference
- `implementation-plan.md` contains `Proposed Diffs`

### 2. `approval-ready`

Use when implementation approval is being requested.

Required files:

- everything from `planning-ready`
- `session-brief.md`
- `implementation-plan.md`

Checks:

- user approval metadata exists in both `session-brief.md` and `implementation-plan.md`
- required approval keys exist exactly:
  - `Approved: true`
  - `Approved By`
  - `Approved At`
  - `Source Message`
- approval values are non-empty except where boolean is expected

### 3. `implementation-handoff`

Use when work moves from planner to implementor, or from implementor to tester or reviewer.

Required files:

- approved `implementation-plan.md`
- `changed-files.md` when implementation has started
- at least one handoff file

Checks:

- handoff file contains all required envelope fields
- `Approval State` agrees with approval metadata in plan artifacts
- every artifact named in `Required Artifacts` exists in the package
- if handoff is implementor-originated, validation evidence is referenced

### 4. `review-ready`

Use when review should be possible.

Required files:

- `implementation-plan.md`
- `test-plan.md`
- `changed-files.md`
- review-target handoff file

Checks:

- all required review inputs exist
- handoff envelope targets `Demo Reviewer`
- changed-files report is present and non-empty

## Required Artifact Checks

These rules apply when a file is present and in scope for the chosen mode.

### `session-brief.md`

Must contain:

- session ID
- source input summary
- assumptions
- decisions
- open questions
- approval status

### `implementation-plan.md`

Must contain:

- session ID
- design overview
- filesystem tree
- file details
- `Proposed Diffs` for material file changes
- validation commands

### `changed-files.md`

Must contain:

- created files
- modified files
- deleted files
- intentionally untouched files, when relevant

### `test-plan.md`

Must contain:

- planned test scope
- validation commands
- residual risk when automation is incomplete

## Approval Metadata Checks

Approval metadata is valid only when all keys exist in both approval-bearing artifacts:

- `Approved: true`
- `Approved By`
- `Approved At`
- `Source Message`

Failure conditions:

- key missing
- key present but blank
- `Approved` not equal to `true`
- approval present in one artifact but not the other

## Handoff Envelope Checks

Every handoff file must contain all of these fields:

- `Session ID`
- `From Agent`
- `To Agent`
- `Current Gate`
- `Approval State`
- `Required Artifacts`
- `Open Questions`
- `Blocking Risks`
- `Definition of Done for Next Agent`

Failure conditions:

- missing field
- blank field where content is required
- artifact listed in `Required Artifacts` does not exist
- `To Agent` does not match intended next role for the lint mode

## Validation Evidence Checks

For implementor-originated handoffs, Phase 1 must require evidence that the required validation commands were run.

Acceptable lightweight evidence for Phase 1:

- a `Validation Evidence` section in the handoff file
- or a dedicated file such as `validation-report.md`

Minimum content:

- command
- outcome: pass or fail
- failure classification when relevant

Phase 1 does not need to parse raw command output deeply. It only needs enough structure to prove the validation step happened.

## Revision Policy Checks

When an approved artifact changes after approval, Phase 1 should flag likely in-place edits unless a revision file exists.

Minimum check:

- if artifact declares approval and a newer change is introduced, a revision note or revision file must be present

Phase 1 may implement this as a naming convention check rather than full history analysis.

## Severity Levels

- `error`: handoff or workflow must stop
- `warning`: package is incomplete or weak, but may still be reviewed by a human
- `note`: useful improvement, not a blocker

Recommended blockers:

- missing required artifact for current mode
- missing approval metadata in approval-required modes
- missing handoff envelope field
- missing validation evidence on implementor handoff

## Suggested Output Shape

Phase 1 lint should emit a concise machine-readable and human-readable report.

Suggested logical fields:

- session ID
- mode
- overall status
- errors
- warnings
- notes

Example:

```json
{
  "sessionId": "123",
  "mode": "implementation-handoff",
  "status": "error",
  "errors": [
    "implementation-plan.md missing Source Message approval metadata",
    "handoff-implementor-to-reviewer.md missing Validation Evidence section"
  ],
  "warnings": [],
  "notes": []
}
```

## Suggested Command Shape

This repo does not need a final implementation yet, but the target interface should stay simple.

Recommended future command shape:

```text
pnpm agent:lint-artifacts --mode <mode> --session <session-id>
```

Examples:

```text
pnpm agent:lint-artifacts --mode planning-ready --session 123
pnpm agent:lint-artifacts --mode approval-ready --session 123
pnpm agent:lint-artifacts --mode implementation-handoff --session 123
```

## Non-Goals For Phase 1

- runtime interception of agent actions
- automatic repair of broken artifacts
- semantic validation of every acceptance criterion
- codebase-aware validation of implementation correctness
- ticket upload automation

## Phase 2 Handoff

When Phase 2 runtime enforcement starts, it should reuse:

- the same approval keys
- the same handoff envelope fields
- the same lint modes where possible

Phase 2 should add transition blocking, but should not redefine the artifact contract.
