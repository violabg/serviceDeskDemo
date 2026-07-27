# Agentic System Manifest

## Source Package

- Package: `agentic-system-kit`
- Installed Bootstrap Skill Path: `.agents/skills/bootstrap-agentic-system/SKILL.md`
- Installed Bootstrap Skill Changelog Path: `.agents/skills/bootstrap-agentic-system/CHANGELOG.md`
- Installed Maintain Skill Path: `.agents/skills/maintain-agentic-system/SKILL.md`
- Installed Maintain Skill Changelog Path: `.agents/skills/maintain-agentic-system/CHANGELOG.md`
- Package Changelog Path For Context: none

## Installed Contract Versions

- Bootstrap Skill Version Used: `1.17.0`
- Bootstrap Contract Applied Through: `1.17.0`
- Bootstrap Snapshot Source Status: copied from installed skill changelog
- Maintain Skill Version Last Applied: `1.7.1`
- Last Maintenance Date: `2026-07-27`

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

## Canonical Skill Inventory

| Skill Mirror | Status | Notes |
| --- | --- | --- |
| `templates/skills/plan-bug-from-id/SKILL.md` | generated | generated at `.github/skills/plan-bug-from-id/SKILL.md` with GitHub issue and local session adapter |
| `templates/skills/plan-user-story-from-id/SKILL.md` | generated | generated at `.github/skills/plan-user-story-from-id/SKILL.md` with GitHub issue and local session adapter |
| `templates/skills/user-story-analysis/SKILL.md` | deferred | user deferred in bootstrap clarification |
| `templates/skills/business-logic-gap-detector/SKILL.md` | deferred | user deferred in bootstrap clarification |
| `templates/skills/integration-test-knowledge-checklist/SKILL.md` | deferred | user deferred in bootstrap clarification |

## Maintenance History

| Date | Maintain Skill Version | Bootstrap Contract Before | Bootstrap Contract After | Plan Or Summary Path | Notes |
| --- | --- | --- | --- | --- | --- |
| `2026-07-27` | `none` | `none` | `1.16.0` | `bootstrap-agentic-system/Core System batch` | Initial manifest creation during bootstrap Core System batch. |
| `2026-07-27` | `none` | `1.16.0` | `1.16.0` | `bootstrap-agentic-system/Vision Evidence batch` | Added Demo Vision agent and Vision partials, and wired visual artifact consumption into Planner, Implementor, and Tester. |
| `2026-07-27` | `none` | `1.16.0` | `1.16.0` | `bootstrap-agentic-system/Knowledge Builder Bootstrap batch` | Refined the knowledge index to route common operating knowledge and access-control guidance, and expanded access-control runtime knowledge from code and tests. |
| `2026-07-27` | `none` | `1.16.0` | `1.16.0` | `bootstrap-agentic-system/Skill Template Generation batch` | Generated repo-local `plan-bug-from-id` and `plan-user-story-from-id` skills with GitHub issue intake, local session artifacts, and Demo Planner handoff. |
| `2026-07-27` | `1.7.1` | `1.16.0` | `1.16.0` | `maintain-agentic-system/root-instruction-modularity` | Slimmed `AGENTS.md` to a thin root router so prompt-specific behavior stays in role contracts and partials. Refreshed the repo-local bootstrap changelog snapshot to the installed `1.17.0` source. |
| `2026-07-27` | `none` | `1.16.0` | `1.17.0` | `agent-system-maintenance/runtime-mirror-regeneration` | Regenerated runtime mirrors under `.github/agents/` and `.github/skills/` from bootstrap canonical templates, preserved approved runtime frontmatter tool and agent names, and stripped all runtime `CANONICAL-TEMPLATE-SLOT` marker comments. |
