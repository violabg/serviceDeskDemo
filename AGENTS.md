# Agentic System

This repository uses a repo-local agentic workflow for planning, implementation, testing, knowledge building, and review readiness.

Treat this file as a thin root router only.
Do not use it as a role contract.
Load the entrypoint agent and only the partials that the current prompt context requires.

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

## Root Contract

- Keep global instructions here only when they are safe for every prompt.
- Put role behavior in `.github/agents/`.
- Put prompt-scoped procedures in `.github/agents/demo-partials/`.
- Keep repository vocabulary in `CONTEXT.md`.
- Keep bounded knowledge selection in `docs/agents/knowledge/README.md`.
- Use `docs/agents/agentic-system-manifest.md` plus `docs/agents/skill-changelogs/bootstrap-agentic-system.CHANGELOG.md` to track bootstrap provenance and maintenance deltas.
