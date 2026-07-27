# Repository Agent Instructions

## Agentic System Entrypoints

- Planner: `.github/agents/demo-planner.agent.md`
- Implementor: `.github/agents/demo-implementor.agent.md`
- Tester: `.github/agents/demo-tester.agent.md`
- Knowledge Builder: `.github/agents/demo-knowledge-builder.agent.md`
- Vision: `.github/agents/demo-vision.agent.md`
- Ask: `.github/agents/demo-ask.agent.md`

Hidden helper agents:

- Context Scout: `.github/agents/demo-context-scout.agent.md`
- Contract Auditor: `.github/agents/demo-contract-auditor.agent.md`

## Repository Context

- Context glossary: `CONTEXT.md`
- Rule: use the glossary for stable repository code and domain vocabulary, source-of-truth boundaries, and terms to avoid. Do not treat it as a knowledge index.

## Knowledge Loading

- Knowledge index: `docs/agents/knowledge/README.md`
- Rule: read the index before loading repository knowledge files and load only matching entries.

## Sessions And Approval

- Session path: `sessions/<issue-id>/`
- Rule: use the GitHub issue number as the session ID for GitHub-driven work. Reuse the existing session folder when present; otherwise create it before writing session artifacts.
- Approval gate: implementation starts only after explicit user approval plus recorded approval metadata in the session artifacts.
- Handoff contract: `templates/artifact-gates.md`

## Validation

- Planning artifacts: `pnpm agent:lint-artifacts`
- Tests: `pnpm test`
- Types: `pnpm typecheck`
- Lint: `pnpm lint`

## Generated Skills And Templates

- Reusable skills: `.agents/skills/`
- Planner-owned work-item planning skills:
  - `.agents/skills/plan-bug-from-id/SKILL.md`
  - `.agents/skills/plan-user-story-from-id/SKILL.md`
- Planning schema: `templates/plan-schema.md`
- Clarification schema: `templates/question-schema.md`
- Gate and handoff contract: `templates/artifact-gates.md`
- Work-item planning session contract: `templates/work-item-planning-session.md`

## Working Rules

- Planner reads `CONTEXT.md` before naming roles, gates, artifacts, skills, or repository concepts.
- Planner reads `docs/agents/knowledge/README.md` before selecting any repository knowledge files.
- Only Planner may invoke `plan-bug-from-id` and `plan-user-story-from-id`.
- Implementor edits only from an approved implementation plan.
- Tester validates approved work without widening production scope.
- Knowledge Builder keeps glossary work separate from knowledge-index maintenance.
- Vision writes deterministic visual artifacts under `sessions/<issue-id>/visual/` for non-vision agents to cite.
- Ask answers questions without implementing code or modifying files.
