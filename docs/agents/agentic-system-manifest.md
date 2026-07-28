# Agentic System Manifest

## Source Package

- Package: `agentic-system-kit`
- Installed Bootstrap Skill Path: `.agents/skills/bootstrap-agentic-system/SKILL.md`
- Installed Bootstrap Skill Changelog Path: `.agents/skills/bootstrap-agentic-system/CHANGELOG.md`
- Installed Maintain Skill Path: none
- Installed Maintain Skill Changelog Path: none
- Package Changelog Path For Context: none

## Installed Contract Versions

- Bootstrap Skill Version Used: `1.18.2`
- Bootstrap Contract Applied Through: `1.18.2`
- Bootstrap Snapshot Source Status: copied from installed skill changelog
- Maintain Skill Version Last Applied: none
- Last Maintenance Date: none

## Generated System Paths

- Root Instructions: `AGENTS.md`
- Context Glossary: `CONTEXT.md`
- Knowledge Index: `docs/agents/knowledge/README.md`
- Plan Schema: `docs/agents/templates/plan-schema.md`
- Question Schema: `docs/agents/templates/question-schema.md`
- Artifact Gates: `docs/agents/templates/artifact-gates.md`
- Agent Directory: `.github/agents`
- Skill Directory: `.github/skills`
- Bootstrap Changelog Snapshot: `docs/agents/skill-changelogs/bootstrap-agentic-system.CHANGELOG.md`
- Session Root: `sessions/`

## Generation Record

- Approved Batch: `Core System`
- Generated Mirrors:
  - `templates/agents/planner.agent.md` -> `.github/agents/demo-planner.agent.md`
  - `templates/agents/implementor.agent.md` -> `.github/agents/demo-implementor.agent.md`
  - `templates/agents/integration-tester.agent.md` -> `.github/agents/demo-integration-tester.agent.md`
  - `templates/agents/knowledge-builder.agent.md` -> `.github/agents/demo-knowledge-builder.agent.md`
  - `templates/agents/ask.agent.md` -> `.github/agents/demo-ask.agent.md`
  - `templates/agents/vision.agent.md` -> `.github/agents/demo-vision.agent.md`
  - `templates/skills/plan-bug-from-id/SKILL.md` -> `.github/skills/plan-bug-from-id/SKILL.md`
  - `templates/skills/plan-user-story-from-id/SKILL.md` -> `.github/skills/plan-user-story-from-id/SKILL.md`
- Generated Supporting Files:
  - `AGENTS.md`
  - `CONTEXT.md`
  - `docs/agents/templates/plan-schema.md`
  - `docs/agents/templates/question-schema.md`
  - `docs/agents/templates/artifact-gates.md`
  - `docs/agents/skill-changelogs/bootstrap-agentic-system.CHANGELOG.md`
  - `sessions/README.md`
- Deferred Mirrors:
  - `templates/skills/user-story-analysis/SKILL.md`
  - `templates/skills/business-logic-gap-detector/SKILL.md`
  - `templates/skills/integration-test-knowledge-checklist/SKILL.md`
- Skipped Mirrors:
  - none

## Approved Slot And Tool Decisions

- Agent prefix: `demo`
- Vision batch approved later. Planner now delegates visual analysis to `demo-vision.agent.md`.
- Context glossary created in `CONTEXT.md` by explicit user override.
- Glossary terminology rule: use `customer` for business actor, avoid `client` for that meaning.
- Approved Context7 MCP tools added only to Planner, Ask, and Knowledge Builder:
  - `mcp_context7_resolve-library-id`
  - `mcp_context7_get-library-docs`
- Vision artifact format: `SlimUI v1.0`
- No GitHub MCP, Neon MCP, or Next DevTools MCP tools added in batch 1.
- Batch 4 approved and generated only ID-based planning skills. Skill-level tool frontmatter was not added.
- Runtime files stripped source-only `CANONICAL-TEMPLATE-SLOT` marker comments.

## Maintenance History

| Date | Maintain Skill Version | Bootstrap Contract Before | Bootstrap Contract After | Plan Or Summary Path | Notes |
| --- | --- | --- | --- | --- | --- |
| `2026-07-28` | `none` | `none` | `1.18.2` | `n/a` | Initial manifest creation. |
