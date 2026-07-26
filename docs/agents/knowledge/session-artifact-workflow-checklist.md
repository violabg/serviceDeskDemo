# Session Artifact Workflow Checklist

## When to read this

Read this before creating, repairing, approving, linting, or handing off session artifacts under `sessions/<id>/`.

Read this when a task mentions implementation plans, approval metadata, clarification questions, handoff envelopes, artifact lint modes, plan-schema links, or agent workflow gates.

## Do not use this for

Do not use this for application behavior, UI composition, database schema, migrations, runtime configuration, or product-test strategy unless session artifacts or approval workflow rules are also in scope.

## Last verified

2026-07-26. Evidence from repository files:

- `AGENTS.md`
- `CONTEXT.md`
- `.github/agents/servicedesk-planner.agent.md`
- `.github/agents/servicedesk-implementor.agent.md`
- `.github/agents/servicedesk-tester.agent.md`
- `docs/agents/governance.md`
- `docs/agents/enforcement-spec.md`
- `templates/artifact-gates.md`
- `templates/plan-schema.md`
- `templates/question-schema.md`

## Evidence

- Session artifacts live under local gitignored `sessions/<id>/` folders.
- GitHub-driven workflows use the GitHub issue number as the session ID.
- `CONTEXT.md` is the repository vocabulary source and is separate from the knowledge index.
- `docs/agents/knowledge/README.md` is the knowledge-selection source and must be read before loading repository knowledge files.
- `templates/plan-schema.md`, `templates/question-schema.md`, and `templates/artifact-gates.md` are repo-local artifact templates.
- Phase 1 enforcement is implemented as stage-aware artifact lint modes: `planning-ready`, `approval-ready`, `implementation-handoff`, and `review-ready`.

## Core rules

- Create or resume exactly one session folder before substantive planning or artifact work.
- Use `sessions/<issue-number>/` for GitHub-driven work; ask the user for a bounded manual session ID only for offline or non-ticket work.
- Do not commit session artifacts unless the user explicitly asks to export or attach them.
- Read `CONTEXT.md` before naming repository code/domain terms, agent roles, gates, artifacts, skills, or source-of-truth boundaries.
- Read the knowledge index before loading knowledge files, select only matching entries, and record selected plus skipped related knowledge in planning artifacts.
- Keep `CONTEXT.md` as vocabulary and source-boundary guidance; do not turn it into a knowledge index or workflow manual.

## Approval rules

- Implementation approval requires an explicit user approval message and matching artifact metadata.
- Approval metadata must appear in both `session-brief.md` and `implementation-plan.md` before implementation starts.
- Required approval keys are `Approved: true`, `Approved By`, `Approved At`, and `Source Message`.
- Do not ask for implementation approval while blocking clarification questions remain open.
- Approved artifacts are immutable. If an approved artifact must change, create a revision file, link the prior revision, and record the reason.

## Implementation plan rules

- Load `templates/plan-schema.md` immediately before drafting or repairing `implementation-plan.md`.
- Preserve the plan schema sections for design overview, selected repository knowledge, filesystem tree, file details, operations, validation commands, and risks/rollback.
- Filesystem Tree paths must be markdown links to matching File Details anchors.
- Every File Details entry must include its schema anchor and a backlink to `Filesystem Tree`.
- Keep schema-required inline anchors even when markdown diagnostics complain; schema compliance wins over markdown cleanup.
- Include proposed diffs or proposed files for material changes.

## Clarification rules

- Use `templates/question-schema.md` when blocking questions exist.
- Ask only questions that can materially change scope, behavior, data, UX, security, validation, or handoff authority.
- Provide bounded answer choices when they can represent the decision.
- Treat a blocking question as resolved only when the user answer removes the design ambiguity.

## Handoff and lint rules

- Use `templates/artifact-gates.md` for handoff envelopes.
- Every handoff must include Session ID, From Agent, To Agent, Current Gate, Approval State, Required Artifacts, Open Questions, Blocking Risks, and Definition of Done for Next Agent.
- Include Selected Knowledge in handoffs when repository knowledge constrained the work.
- Use `pnpm agent:lint-artifacts planning-ready <id>` before approval when planning artifacts should be complete.
- Use `pnpm agent:lint-artifacts approval-ready <id>` before implementation approval handoff when approval is requested.
- Use `pnpm agent:lint-artifacts implementation-handoff <id>` when work moves from Planner to Implementor or from Implementor onward.
- Use `pnpm agent:lint-artifacts review-ready <id>` when review should be possible.
- Record skipped artifact lint commands with reasons when a mode is not applicable or commands are unavailable.

## Pitfalls to avoid

- Treating chat approval alone as enough for implementation.
- Reading unrelated sessions to infer current-session state.
- Removing plan-schema anchors or backlinks to satisfy markdown lint.
- Bulk-loading knowledge files before matching the task against the index.
- Mixing durable repository vocabulary in `CONTEXT.md` with selectable workflow knowledge in this index.