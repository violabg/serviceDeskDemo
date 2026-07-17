# Agentic System Wiki

This wiki page helps new developers use the agentic workflow in this repository.

## What This System Is

The repo uses a role-based workflow for software delivery:

- planner plans
- implementor implements
- tester tests
- reviewer reviews

Policy and behavior are defined in these contract files:

- `AGENTS2.md`
- `docs/agents/governance.md`
- `docs/agents/enforcement-spec.md`

Instruction precedence is:

1. `AGENTS2.md`
2. agent files under `.github/agents2/`
3. skill files under `.agents2/skills/`
4. ad hoc prompt instructions

## Session Model

All work is organized by session in a local, gitignored folder:

- `sessions/<session-id>/`

Rules:

- For GitHub-driven workflows, use GitHub issue number as session ID.
- Reuse an existing `sessions/<session-id>/` folder when present.
- Create it before planning when missing.
- Session artifacts are not committed.
- Export session artifacts as zip and attach them to the issue ticket.

## Standard Artifacts

Typical files in a session package:

- `session-brief.md`
- `requirements-analysis.md`
- `clarification-questions.md`
- `spec.md`
- `task-breakdown.md`
- `implementation-plan.md`
- `test-plan.md`
- `review-report.md`
- `changed-files.md`

## End-to-End Workflow

1. Intake work item and resolve session ID.
2. Create or reuse `sessions/<session-id>/`.
3. Produce planning artifacts.
4. Request user approval for implementation plan.
5. Record approval metadata.
6. Implement only after approval is valid.
7. Run validation commands from test and implementation plans.
8. Produce handoff artifact for next role.
9. Prepare review artifacts.

## Approval Gate

Implementation can start only if both are true:

1. User explicitly approves in chat.
2. Artifacts contain approval metadata in required files.

Required approval keys:

- `Approved: true`
- `Approved By`
- `Approved At`
- `Source Message`

## Handoff Envelope

Each handoff file must include:

- `Session ID`
- `From Agent`
- `To Agent`
- `Current Gate`
- `Approval State`
- `Required Artifacts`
- `Open Questions`
- `Blocking Risks`
- `Definition of Done for Next Agent`

## Lint and Validation

Use the Phase 1 artifact lint command:

```bash
pnpm agent:lint-artifacts --mode planning-ready --session <session-id>
pnpm agent:lint-artifacts --mode approval-ready --session <session-id>
pnpm agent:lint-artifacts --mode implementation-handoff --session <session-id>
pnpm agent:lint-artifacts --mode review-ready --session <session-id>
```

Lint modes are stage-aware and check artifact completeness and handoff quality.

## Restore a Previous Session

1. Download session zip from issue ticket.
2. Extract under local `sessions/`.
3. Resume using that same session ID.
4. Continue writing artifacts in the restored folder.

## Quick Start for New Developers

1. Read `AGENTS2.md` and `docs/agents/governance.md`.
2. Pick a real issue and use issue number as session ID.
3. Create `sessions/<issue-number>/`.
4. Write `session-brief.md` first.
5. Complete planning artifacts.
6. Run `planning-ready` lint.
7. Request user approval.
8. Run `approval-ready` lint.
9. Start implementation and keep `changed-files.md` updated.
10. Run `implementation-handoff` and `review-ready` lints before review handoff.

## Tips

- Keep artifacts small, explicit, and current.
- Do not skip role boundaries unless emergency mode is explicitly requested and documented.
- When in doubt, follow governance first, then agent contract, then skill contract.
