---
name: artifact-workflow
description: "Use when: managing enterprise agentic workflow artifacts, session briefs, requirements analysis, specs, implementation plans, test plans, review reports, changed-files logs, handoffs, and approval gates."
argument-hint: "Describe the session or artifact to create/update"
---

# Artifact Workflow

Use this skill to keep the demo workflow traceable.

Follow `docs/agents/governance.md` as the durable workflow policy source.

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

- Every planning session must have a unique session artifact package under `sessions/<session-id>/`.
- For GitHub-driven workflows, use the GitHub issue ID resolved during intake as the session ID.
- Use manual session IDs only for offline or non-ticket workflows.
- Each user-facing agent must ask for the session ID when it is missing.
- If `sessions/<session-id>/` exists, retrieve and reuse it.
- If `sessions/<session-id>/` does not exist, create it before writing artifacts.
- Create `session-brief.md` as the first artifact in the session artifact package.
- Every artifact must have a clear title, date, and session ID reference.
- Record source inputs and assumptions in `session-brief.md`.
- Record decisions separately from open questions.
- Plans require explicit user approval before implementation. Record approval in both `session-brief.md` and `implementation-plan.md` with at least `Approved: true`, `Approved By`, `Approved At`, and `Source Message`.
- Handoffs must use the governance envelope: `Session ID`, `From Agent`, `To Agent`, `Current Gate`, `Approval State`, `Required Artifacts`, `Open Questions`, `Blocking Risks`, and `Definition of Done for Next Agent`.
- Do not overwrite an approved artifact in place. Create a new revision and record what changed and why.
- Implementation plans must include `Proposed Diffs` for material file changes.
- Session artifacts are per session, kept locally under gitignored `sessions/`, exported as a zip package, and attached to the relevant issue ticket rather than committed to the repository.
