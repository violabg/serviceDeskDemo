# Repository Agent Instructions

## Agentic System Entrypoints

- Planner: `.github/agents/servicedesk-planner.agent.md`
- Implementor: `.github/agents/servicedesk-implementor.agent.md`
- Tester: `.github/agents/servicedesk-tester.agent.md`
- Knowledge Builder: `.github/agents/servicedesk-knowledge-builder.agent.md`
- Vision: `.github/agents/servicedesk-vision.agent.md`
- Hidden Contract Auditor: `.github/agents/servicedesk-contract-auditor.agent.md`

## Instruction Hierarchy

When instructions conflict, resolve them in this order:

1. `AGENTS.md`
2. Agent files under `.github/agents/`
3. Custom skill files under `.agents/skills/`
4. Non-custom skill files under `.github/skills/`
5. Prompt-specific ad hoc instructions

## Repository Context

- Context glossary: `CONTEXT.md`
- Rule: use `CONTEXT.md` for stable service desk code/domain vocabulary and source-of-truth boundaries before naming roles, gates, artifacts, skills, or repository concepts.
- Rule: do not treat `CONTEXT.md` as a knowledge index or as permission to bulk-load repository docs.

## Knowledge Loading

- Knowledge index: `docs/agents/knowledge/README.md`
- Source shape: `.agents/skills/bootstrap-agentic-system/templates/knowledge-index-schema.md`
- Rule: read the knowledge index before loading repository knowledge files.
- Rule: load only knowledge files whose `When to read` triggers match the current task.
- Rule: record selected files, skipped related candidates, and selection rationale in planning artifacts.

## Sessions And Approval

- Session path: `sessions/<id>/`
- Session ID: GitHub issue number for GitHub-driven work; user-confirmed ID for offline work.
- Work-item planning session template: `templates/work-item-planning-session.md`
- Planner-only work-item skills must read and write only the current `sessions/<id>/` folder and must never enumerate sibling sessions.
- Approval gate: implementation requires explicit user approval plus approval metadata in `session-brief.md` and `implementation-plan.md`.
- Handoff artifact: every role handoff must include the envelope from `templates/artifact-gates.md`.
- Session artifacts stay local and gitignored unless the user explicitly exports or attaches them to an issue.

## Artifact Templates

- Implementation plan schema: `templates/plan-schema.md`
- Clarification question schema: `templates/question-schema.md`
- Artifact, gate, and handoff schema: `templates/artifact-gates.md`

Planner agents must load `templates/plan-schema.md` immediately before drafting or repairing `implementation-plan.md`. Schema adherence overrides markdown diagnostics cleanup for required filesystem-tree links, File Details anchors, and backlinks.

Planner agents must use `templates/question-schema.md` for blocking clarification questions and must not request implementation approval while blocking questions remain open.

## Validation

- Project lint: `pnpm lint`
- Type check: `pnpm typecheck`
- Test suite: `pnpm test`
- Agent artifact lint: `pnpm agent:lint-artifacts <mode> <session-id>`

Run the narrowest validation that can falsify the current change first. Record skipped commands with reasons in the relevant handoff artifact.

## Generated Skills And Templates

- Portable skills: `.agents/skills/`
- Planner-only work-item skills: `.agents/skills/plan-bug-from-id/SKILL.md`, `.agents/skills/plan-user-story-from-id/SKILL.md`
- Generated Copilot agents: `.github/agents/`
- Repo templates: `templates/`
- Work-item planning session contract: `templates/work-item-planning-session.md`
- Knowledge library: `docs/agents/knowledge/`

Do not duplicate full role contracts here. Read the role-specific agent file for authority boundaries, gates, artifacts, and handoff obligations.
