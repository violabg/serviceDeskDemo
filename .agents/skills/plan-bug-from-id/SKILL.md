---
name: plan-bug-from-id
description: "Planner-only skill for creating or resuming an isolated planning session from an existing bug work-item ID."
argument-hint: "Bug work-item ID, optional adapter name, optional local Markdown path"
disable-model-invocation: true
---

# Plan Bug From ID

Use this skill only from `ServiceDesk Planner`. No other agent or general-purpose workflow may invoke it.

## Mission

Create or resume one isolated planning session from a bug work-item ID, preserve bug evidence, analyze probable causes, wait for user cause selection, then continue the normal Planner workflow for the selected root cause.

## Inputs

- Bug work-item ID. Required.
- Optional adapter: GitHub Issue Adapter, Local Markdown Adapter, or configured external adapter.
- Optional local Markdown path when no tracker is configured.

## Shared Session Interface

- Read `templates/work-item-planning-session.md` before retrieval or analysis.
- Use session root `sessions/`.
- Normalize the source ID using the safe session ID rule from `templates/work-item-planning-session.md`.
- Prefix normalized IDs with `bug-`.
- Create or resume exactly one folder: `sessions/<safe-session-id>/`.
- Read and write only the current session folder.
- Never enumerate, inspect, summarize, or compare sibling session folders.
- Never overwrite a different session.
- Record session folder path and adapter in the final handoff.

## Adapter Rules

- Prefer the GitHub Issue Adapter when this repository uses GitHub Issues and `gh` is available.
- GitHub retrieval shape: `gh issue view <id> --comments`; also fetch labels or linked evidence when useful.
- Use the Local Markdown Adapter when no tracker is configured or the user supplies a local work-item file.
- Use a configured external adapter only when the user or repository has configured one.
- Surface adapter failures in `work-item-source.md` and final handoff.
- Do not copy secrets, credentials, tokens, or unrelated personal data from tracker content.
- Preserve code blocks and convert rich tracker content to Markdown when possible.

## Required Evidence

Save gathered evidence under `sessions/<safe-session-id>/` before analysis:

- `work-item-source.md`: source type, ID, safe session ID, session path, adapter, source URL or local path, retrieval timestamp, retrieval method, retrieval status.
- `work-item-evidence.md`: title, description, comments, acceptance criteria, labels, image references, reproduction details, expected behavior, actual behavior, impact, affected surface, relevant discussion.
- `work-item-decisions.md`: retrieval choices, assumptions, skipped fields, and user decisions.

Mark missing fields explicitly. Do not invent absent acceptance criteria, reproduction steps, environment facts, or affected surfaces.

## Bug Cause Gate

### Gate 0: Source ID Intake

- Trigger: Planner invokes skill.
- Pass Condition: bug source ID exists and can become a non-empty safe session ID.
- Fail Condition: ID is missing or normalization cannot produce allowed characters.
- Approver Or Waiver: user.
- Artifact Record: `work-item-source.md`.
- Rollback: stop and ask Planner for a valid bug ID.

### Gate 1: Session Isolation

- Trigger: source ID passes.
- Pass Condition: exactly one `sessions/<safe-session-id>/` exists or is created.
- Fail Condition: skill reads or writes outside the current session folder.
- Approver Or Waiver: none for cross-session reads.
- Artifact Record: `work-item-source.md`.
- Rollback: discard cross-session evidence and restart with current folder only.

### Gate 2: Bug Evidence Retrieval

- Trigger: session folder is active.
- Pass Condition: adapter records title, description, comments, acceptance criteria, image references, and relevant discussion when present.
- Fail Condition: adapter fails silently or evidence is not saved before analysis.
- Approver Or Waiver: user for unavailable tracker.
- Artifact Record: `work-item-evidence.md`.
- Rollback: record retrieval failure and ask Planner whether to use Local Markdown Adapter.

### Gate 3: Narrow-To-Wide Cause Analysis

- Trigger: evidence is saved.
- Pass Condition: `bug-cause-analysis.md` identifies the most likely root cause first, then expands to plausible contributing factors across code, configuration, data, and external dependencies.
- Fail Condition: analysis jumps to unrelated broad fixes or proposes symptom-only fixes.
- Approver Or Waiver: user.
- Artifact Record: `bug-cause-analysis.md`.
- Rollback: narrow to evidence-backed causes.

### Gate 4: Cause Selection

- Trigger: top causes are ready.
- Pass Condition: Planner presents the top two or three causes with evidence and waits for the user to select the cause to plan for.
- Fail Condition: skill drafts an implementation plan before selected cause is saved.
- Approver Or Waiver: user only.
- Artifact Record: `work-item-decisions.md` and `bug-cause-analysis.md`.
- Rollback: stop and ask for selected cause.

### Gate 5: Planner Workflow Resume

- Trigger: selected cause is saved.
- Pass Condition: Planner resumes normal workflow at the first gate not satisfied by saved evidence, using `CONTEXT.md`, `docs/agents/knowledge/README.md`, `templates/question-schema.md`, and `templates/plan-schema.md`.
- Fail Condition: skill skips clarification without evidence satisfying the same questions.
- Approver Or Waiver: user.
- Artifact Record: `handoff-work-item-to-planner.md`.
- Rollback: return to Planner Gate 5: Clarification.

## Plan Constraints

- The implementation plan must stay focused on the selected root cause.
- Keep unrelated implementation work out of the plan.
- Use `CONTEXT.md` for repository vocabulary.
- Use `templates/plan-schema.md` when `implementation-plan.md` is produced.
- Use `templates/question-schema.md` when blocking clarification questions remain.

## Final Handoff

Write `handoff-work-item-to-planner.md` using `templates/artifact-gates.md` envelope plus:

- Source Type: bug
- Source ID:
- Safe Session ID:
- Session Path:
- Adapter:
- Evidence Files:
- Decisions Files:
- Selected Cause:
- Open Questions:
- Retrieval Failures:
- Next Planner Gate:
