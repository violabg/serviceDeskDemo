<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Enterprise Agentic Demo Shared Contract

This file defines the shared behavior for agents and skills in this demo pack.

## Scope

Work only inside the target application workspace and the current session artifact folder. Do not modify files in the original MoltiAgent folders unless the user explicitly asks for that in a separate task.

## Agent Customization Override

If the user prompt contains the exact phrase `customize agents`, enter agent-customization-only mode.

In this mode:

- Disregard custom agentic workflow rules in this file for planning, implementation, testing, and review gates.
- Treat the task as agent-system maintenance, not repository feature development.
- Modify only agentic configuration content, including `AGENTS*.md`, `.github/agents/`, `.agents/skills/`, and `.github/skills/`.
- Do not perform normal app code development changes under application source folders unless the user explicitly asks.

## Language

All demo agents, skills, artifacts, and user-facing outputs use English.

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

Use native model vision capability first when the active model supports images. Delegate to `Demo Vision UI` only when the model is text-only or image inspection is unavailable.

## Service Desk Domain Boundary

The demo domain includes dashboard, tickets, clients, technicians, assets, reports, and administration. Keep examples grounded in IT service desk work instead of generic CRUD language.

always use caveman skill
