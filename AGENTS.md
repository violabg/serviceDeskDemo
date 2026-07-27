# Agentic System

This repository uses a repo-local agentic workflow for planning, implementation, testing, knowledge building, and review readiness.

## Rule Precedence

1. This file
2. Agent contracts under `.github/agents/`
3. Skills under `.agents/skills/`
4. Skills under `.github/skills/` when later generated
5. Ad hoc prompt instructions

## Entrypoints

- Planner: `.github/agents/demo-planner.agent.md`
- Implementor: `.github/agents/demo-implementor.agent.md`
- Tester: `.github/agents/demo-tester.agent.md`
- Knowledge Builder: `.github/agents/demo-knowledge-builder.agent.md`
- Ask: `.github/agents/demo-ask.agent.md`
- Hidden Contract Auditor: `.github/agents/demo-contract-auditor.agent.md`
- Vision: `.github/agents/demo-vision.agent.md`

## Stable References

- Context glossary: `CONTEXT.md`
- Knowledge index: `docs/agents/knowledge/README.md`
- Manifest: `docs/agents/agentic-system-manifest.md`
- Plan schema: `docs/agents/templates/plan-schema.md`
- Question schema: `docs/agents/templates/question-schema.md`
- Artifact and gate template: `docs/agents/templates/artifact-gates.md`
- Partial instruction directory: `.github/agents/demo-partials/`
- Skill directory: `.github/skills/`
- Vision artifact path pattern: `sessions/<session-id>/visual-evidence/vision-ui.md`

## Session Rules

- Sessions are local and gitignored under `sessions/<session-id>/`.
- For GitHub-driven work, the GitHub issue number is the canonical session ID.
- Reuse an existing `sessions/<session-id>/` folder when it already exists.
- Implementation must not start until the session artifacts record approval metadata.
- Session artifacts stay out of commits.

## Knowledge Loading

- Read `CONTEXT.md` first when the task depends on stable repo vocabulary or source-of-truth boundaries.
- Read `docs/agents/knowledge/README.md` before loading any repository knowledge files.
- Load only the knowledge files whose `When to read` triggers match the task.
- Do not treat `CONTEXT.md` as a knowledge index.

## Instruction Modularity

- Main agent files in `.github/agents/` stay thin and role-defining.
- Prompt-scoped procedures live under `.github/agents/demo-partials/`.
- Shared modules under `.github/agents/demo-partials/shared/` must be loaded when a role depends on session rules, glossary rules, knowledge selection rules, approval metadata, or the handoff envelope.
- Role-specific partial groups:
  - Planner: `planner/`
  - Implementor: `implementor/`
  - Tester: `tester/`
  - Knowledge Builder: `knowledge-builder/`
  - Ask: `ask/`
  - Vision: `vision/`

## Approval Gates

- Planner owns the planning gates and produces approval-ready artifacts only.
- Implementor edits code only from an approved implementation plan.
- Tester stays within approved test and validation scope.
- Knowledge Builder is read-only for application code.
- Review remains required through artifacts, validation, and human or PR review surfaces.

## Validation Expectations

- Artifact lint commands:
  - `pnpm agent:lint-artifacts --mode planning-ready --session <session-id>`
  - `pnpm agent:lint-artifacts --mode approval-ready --session <session-id>`
  - `pnpm agent:lint-artifacts --mode implementation-handoff --session <session-id>`
  - `pnpm agent:lint-artifacts --mode review-ready --session <session-id>`
- Code validation commands come from the approved implementation plan.
- Maintainer uses `docs/agents/agentic-system-manifest.md` plus `docs/agents/skill-changelogs/bootstrap-agentic-system.CHANGELOG.md` and the currently installed bootstrap changelog to compute future deltas.

## Post-Bootstrap Recommendations

- Run Demo Knowledge Builder to refine the knowledge index and propose glossary updates.
- Use repo-local `plan-bug-from-id` and `plan-user-story-from-id` for GitHub issue driven planning.
- Run the public `create-work-item-planning-skills` skill when the team wants to regenerate or refine the repo-local planning skills.
- Run the public `create-work-item-from-description` skill when the team wants repeatable GitHub work-item creation from clarified requirements.
