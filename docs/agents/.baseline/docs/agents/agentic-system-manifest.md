# Agentic System Manifest

## Source Package

- Package: `agentic-system-kit`
- Installed Bootstrap Skill Path: `.agents/skills/bootstrap-agentic-system/SKILL.md`
- Installed Bootstrap Skill Changelog Path: `.agents/skills/bootstrap-agentic-system/CHANGELOG.md`
- Installed Maintain Skill Path: `.agents/skills/maintain-agentic-system/SKILL.md`
- Installed Maintain Skill Changelog Path: `.agents/skills/maintain-agentic-system/CHANGELOG.md`
- Package Changelog Path For Context: `.agents/skills/bootstrap-agentic-system/CHANGELOG.md`

## Installed Contract Versions

- Bootstrap Skill Version Used: `2.0.0`
- Bootstrap Contract Applied Through: `2.0.0`
- Bootstrap Snapshot Source Status: copied from installed skill changelog
- Maintain Skill Version Last Applied: none
- Last Maintenance Date: none

## Generated System Paths

- Root Instructions: `AGENTS.md`
- Context Glossary: `CONTEXT.md`
- Knowledge Index: `docs/agents/knowledge/README.md`
- Plan Schema: `docs/agents/plan-schema.md`
- Artifact Gates: `docs/agents/artifact-gates.md`
- Agent Directory: `.github/agents`
- Skill Directory: `.github/skills`
- Bootstrap Changelog Snapshot: `docs/agents/skill-changelogs/bootstrap-agentic-system.CHANGELOG.md`
- Answers File: `docs/agents/agentic-system.answers.yaml`
- Baseline Directory: `docs/agents/.baseline/`
- Session Root: `sessions/`
- Work Item Adapter Contract: `.github/skills/plan-bug-from-id/SKILL.md` and `.github/skills/plan-user-story-from-id/SKILL.md`
- Planning Session Identity Artifact: `sessions/<planning-session-id>/session-identity.md`

## Bootstrap Decisions

- Platform: GitHub Copilot.
- Agent prefix: `demo-`.
- Work-item adapter: GitHub Issues using `violabg/serviceDeskDemo#<number>` and planner-only `mcp_github_mcp_s2_issue_read`.
- Session contract: `sessions/us-<issue-number>/` and `sessions/bug-<issue-number>/`; direct resume by known ID only.
- Knowledge: preserve `docs/agents/knowledge/README.md` as the index and use `CONTEXT.md` as the glossary.
- Visual evidence: `demo-vision`; store source PNG captures and a short Markdown note under `sessions/<planning-session-id>/visual/`.
- Validation: artifact gate linting, then lint, typecheck, test, and build for buildable app changes.

## Mirror Inventory

### Generated

- `templates/instructions/AGENTS.md` to `AGENTS.md`
- `templates/instructions/knowledge-guard.instructions.md` to `.github/instructions/knowledge-guard.instructions.md`
- `templates/instructions/planning-sessions.instructions.md` to `.github/instructions/planning-sessions.instructions.md`
- `templates/plan-schema.md` to `docs/agents/plan-schema.md`
- `templates/artifact-gates.md` to `docs/agents/artifact-gates.md`
- `templates/agents/planner.agent.md` to `.github/agents/demo-planner.agent.md`
- `templates/agents/implementor.agent.md` to `.github/agents/demo-implementor.agent.md`
- `templates/agents/integration-tester.agent.md` to `.github/agents/demo-integration-tester.agent.md`
- `templates/agents/knowledge-builder.agent.md` to `.github/agents/demo-knowledge-builder.agent.md`
- `templates/agents/vision.agent.md` to `.github/agents/demo-vision.agent.md`
- `templates/skills/plan-bug-from-id/SKILL.md` to `.github/skills/plan-bug-from-id/SKILL.md`
- `templates/skills/plan-user-story-from-id/SKILL.md` to `.github/skills/plan-user-story-from-id/SKILL.md`
- `templates/skills/user-story-analysis/SKILL.md` to `.github/skills/user-story-analysis/SKILL.md`
- `templates/skills/integration-test-knowledge-checklist/SKILL.md` to `.github/skills/integration-test-knowledge-checklist/SKILL.md`

### Skipped

- `templates/agents/ask.agent.md`: not selected for the first install.
- `templates/skills/author-repo-skill/SKILL.md`: not selected for the first install.
- `templates/skills/business-logic-gap-detector/SKILL.md`: not selected for the first install.

### Deferred

- Initial knowledge-index refinement: preserve the existing index; run `demo-knowledge-builder` after Bootstrap.

## Marker And Tool Decisions

- Source-only `CANONICAL-TEMPLATE-SLOT` comments were stripped from all generated runtime mirror files.
- Canonical non-slot wording and baseline frontmatter were preserved.
- `mcp_github_mcp_s2_issue_read` is assigned only to `demo-planner`.
- Neon, Next.js, GitHub search, and GitHub write MCP tools are omitted from generated agent tool surfaces.

## Customization Register

No deliberate non-slot canonical wording changes, relocations, or tool reductions were approved during this first install. Repository-specific slot values are recorded in `docs/agents/agentic-system.answers.yaml`.

| ID | Target File | Region | Kind | Reason | Upstream Relation | Survives Upgrade | Last Verified Version |
| --- | --- | --- | --- | --- | --- | --- | --- |
| none | n/a | n/a | n/a | First install has no non-slot deviations. | n/a | n/a | `2.0.0` |

## Maintenance History

| Date | Maintain Skill Version | Bootstrap Contract Before | Bootstrap Contract After | Plan Or Summary Path | Notes |
| --- | --- | --- | --- | --- | --- |
| 2026-07-29 | none | none | `2.0.0` | This manifest | Initial Bootstrap installation. |