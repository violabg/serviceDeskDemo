# Deep Map: MoltiAgentPlanner

## Source

- `tmp/github/agents/MoltiAgentPlanner.agent.md`
- `tmp/prompts/plan_from_ado_bug.prompt.md`
- `tmp/prompts/plan_from_ado_userstory.prompt.md`
- `tmp/prompts/task_builder.prompt.md`
- `tmp/prompts/user_story_analysis.prompt.md`

## Primary New Targets

- `.github/agents2/DemoPlanner.agent.md`
- `.github/agents2/DemoRequirementsAnalyst.agent.md`
- `.github/agents2/DemoTaskBuilder.agent.md`
- `.github/agents2/DemoGitHubIssueIntake.agent.md`
- `.github/agents2/DemoVisionUI.agent.md`
- `.agents2/skills/requirements-analysis/`
- `.agents2/skills/task-decomposition/`
- `.agents2/skills/implementation-planning/`
- `.agents2/skills/test-strategy/`
- `.agents2/skills/artifact-workflow/`
- `.agents2/skills/service-desk-domain/`
- `.agents2/skills/plan-from-github-bug/`
- `.agents2/skills/plan-from-github-issue/`

## Disposition

Changed and decomposed.

## Retained Concepts

- Gate-based planning workflow
- Planning-only scope guard
- Explicit clarification stage
- Visual intake stage
- Artifact-first output model
- Handoff-ready implementation plan

## Intentional Changes

- Company session and MCP-heavy plan orchestration is removed from the core contract.
- ADO-specific intake becomes GitHub issue intake.
- Planner no longer carries all analysis and task decomposition behavior inline; those responsibilities are extracted into dedicated agents and skills.
- Durable policy is moved to repo docs instead of hidden inside planner instructions.
- Session artifacts are treated as per-session export packages, not as repo-persisted state.

## Migration Notes

- Old planner was both workflow engine and policy container.
- New planner should become thinner: orchestrate gates, call the right specialized helpers, and defer durable policy to `docs/agents/governance.md`.
- The strongest company concept worth preserving is disciplined gated planning. The strongest concept worth dropping is tool-specific ceremony that obscures the core workflow.

## Follow-Up

- Add explicit handoff envelope requirements to `DemoPlanner.agent.md`.
- Replace old session-folder assumptions with `sessions/<issue-number>/` wording aligned to governance.
- Ensure planning approval rules reference user-only approval authority.
