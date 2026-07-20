## Enterprise Agentic Demo Shared Contract

This file defines default behavior when no mode skill is invoked.

## Scope

Work only inside the target application workspace and the current session artifact folder.

## Intake Override

If the user invokes `/create-user-story` or `/create-bug`, enter **intake mode**.

In this mode:

- Disregard all repo-exploration, planning, implementation, testing, and review gates.
- This is a non-repo workflow: do **not** explore the application codebase unless the user explicitly requests it.
- Permitted skills in this mode: `grill-with-docs`, `to-spec`, `to-tickets`.
- Follow the three-step process defined in the invoked skill: **Grill -> Spec -> Tickets**.
- Ask one question at a time. Do not advance to the next step until the user confirms a shared understanding.
- Stay in the service desk domain vocabulary (tickets, clients, technicians, assets, SLA, priority, status) when working inside this project.

## Language

All demo agents, skills, artifacts, and user-facing outputs use English, except content under `Teaching/`, which must be written in Italian.

## Workflow Principles

- Work artifact-first: preserve analysis, questions, spec, plan, test plan, review notes, and changed files as explicit artifacts.
- Keep roles separated: planner plans, implementor implements, tester tests, reviewer reviews.
- Do not implement before an implementation plan exists and is explicitly approved.
- Ask focused clarification questions only when the answer can change the plan.
- Prefer bounded discovery over broad repository exploration.
- Load only the skills relevant to the current stage.
- Keep GitHub issue input optional; the sample markdown story must be enough for an offline demo.

## Canonical Policy Docs

- `docs/agents/governance.md` is the durable cross-session governance source.
- `docs/agents/common-knowledge.md` stores durable cross-session operating knowledge.
- If workflow details in lower-precedence files drift from these documents, align the lower-precedence files.

## Instruction Precedence

When instructions conflict, use this order:

1. `AGENTS.md`
2. Agent files under `.github/agents/`
3. Custom skill files under `.agents/skills/`
4. Non-custom skill files under `.github/skills/`
5. Prompt-specific ad hoc instructions

## Session Folder Structure

Every planning request must ask for a session ID, then create or reuse a named session folder under `sessions/` before planning continues.

Session artifacts are per session and are not committed to this repository. They live locally under the gitignored `sessions/` folder, and are expected to be exported as a zip package and attached to the relevant issue ticket.

Older sessions may be resumed by downloading the zip from the issue ticket, extracting it into a local `sessions/` folder, and referring to the session by ID in the prompt.

Canonical example structure:

```text
sessions/
  <session-id>/
    session-brief.md
    requirements-analysis.md
    clarification-questions.md
    spec.md
    task-breakdown.md
    implementation-plan.md
    test-plan.md
    review-report.md
    changed-files.md
```

- For GitHub-driven workflows, session ID is the GitHub issue ID resolved during intake and should be stored locally as `sessions/<issue-number>/`.
- For offline or non-ticket workflows, use a user-provided session ID.
- Each user-facing agent must ask for a session ID when it is missing.
- If `sessions/<session-id>/` exists, retrieve and reuse it.
- If `sessions/<session-id>/` does not exist, create it before writing artifacts.
- `session-brief.md` is the first artifact and records source input, assumptions, decisions, open questions, and session-level approval metadata.
- All generated planning, testing, implementation, and review artifacts for the same work item must be created or updated inside the same session folder for that session package.
- Implementation cannot start until `implementation-plan.md` is explicitly approved and `session-brief.md` records the approval state.
- Implementation plans must include `Proposed Diffs` for material file changes so the implementor can review the intended edits before changing code.

## Approval Rule

Only the user may approve implementation. Approval is valid only when both an explicit user message and recorded approval metadata exist in the session artifacts.

## Standard Artifact Names

- `session-brief.md`
- `requirements-analysis.md`
- `clarification-questions.md`
- `spec.md`
- `task-breakdown.md`
- `implementation-plan.md`
- `test-plan.md`
- `review-report.md`
- `changed-files.md`

## Visual Artifacts

Use `Demo Vision UI` as the default path for planning-relevant screenshots, mockups, browser captures, diagrams, and review images when deterministic visual artifacts are needed.

Treat `SlimUI v1` plus `Planner Notes` as the reusable output contract for downstream planning.

Use raw native model vision only for quick non-artifact inspection when no durable visual contract is needed.

## Service Desk Domain Boundary

The demo domain includes dashboard, tickets, clients, technicians, assets, reports, and administration. Keep examples grounded in IT service desk work instead of generic CRUD language.

## Token Efficiency

Always use caveman style to save tokens.
