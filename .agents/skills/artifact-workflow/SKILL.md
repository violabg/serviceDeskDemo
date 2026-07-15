---
name: artifact-workflow
description: "Use when: managing enterprise agentic workflow artifacts, session briefs, requirements analysis, specs, implementation plans, test plans, review reports, changed-files logs, handoffs, and approval gates."
argument-hint: "Describe the session or artifact to create/update"
---

# Artifact Workflow

Use this skill to keep the demo workflow traceable.

## Standard Artifacts

- `session-brief.md`
- `requirements-analysis.md`
- `clarification-questions.md`
- `spec.md`
- `task-breakdown.md`
- `implementation-plan.md`
- `test-plan.md`
- `review-report.md`
- `changed-files.md`

## Rules

- Every planning session must have a unique folder under `artifacts/<session-id>/`.
- Session IDs use `session-YYYYMMDD-<descriptive-slug>` unless the user provides a clearer name.
- Create `session-brief.md` as the first artifact in the session folder.
- Every artifact must have a clear title, date, and session ID reference.
- Record source inputs and assumptions in `session-brief.md`.
- Record decisions separately from open questions.
- Plans require explicit approval before implementation; record approval in both `session-brief.md` and `implementation-plan.md`.
- Handoffs must name the next agent, the session ID, and the artifacts it must read.
- Do not overwrite an approved artifact without recording what changed and why in a revision note.
- Implementation plans must include `Proposed Diffs` for material file changes.
