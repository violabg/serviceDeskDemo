# Migration Index

Traceability map from the company agentic system under `tmp/` to the custom system under `.github/agents2/` and `.agents2/skills/`.

This index is the entry point for migration work. It records what was kept, split, changed, dropped, or added.

## Scope

Source surfaces:

- `tmp/github/agents/`
- `tmp/prompts/`

Target surfaces:

- `.github/agents2/`
- `.agents2/skills/`

This map tracks direct migration lineage from the company system. External skill packs may influence concepts, but they are not the canonical traceability source for this document set.

## Migration Strategy

- Start with explicit lineage.
- Preserve high-value workflow concepts.
- Re-express them in local repo language and constraints.
- Change source structures when the repo contract requires a safer or simpler model.

## Agent Mapping Summary

| Company Source | New Target | Disposition | Notes |
| --- | --- | --- | --- |
| `MoltiAgentPlanner.agent.md` | `DemoPlanner.agent.md` plus planning skills | Changed | Keeps gate-driven planning, simplifies session model, swaps ADO-heavy flow for repo-local demo flow |
| `MoltiAgentImplementor.agent.md` | `DemoImplementor.agent.md` plus `business-logic-gap-detection` | Changed | Keeps approved-plan-first implementation, reduces orchestration complexity |
| `MoltiAgentIntegrationTester.agent.md` | `DemoTester.agent.md` plus `test-strategy` | Split and Changed | Historical lineage only; this repo does not need a dedicated integration-tester role |
| `MoltiAgentKnowledgeBuilder.agent.md` | `DemoKnowledgeBuilder.agent.md` plus `capability-extraction` | Changed | Keeps knowledge extraction mission, narrows output to small reusable artifacts |
| `MoltiAgentVision.agent.md` | `DemoVisionUI.agent.md` | Changed | Old standalone visual extractor becomes fallback-only helper because native vision is preferred |
| `MoltiAgentAsk.agent.md` | No direct one-to-one target | Dropped and Redistributed | Q&A behavior moves outside core workflow; requirement analysis and clarification stay in planner flow |
| None | `DemoReviewer.agent.md` | Added | Review role is now explicit instead of implicit or folded into other flows |
| None | `DemoGitHubIssueIntake.agent.md` | Added | Replaces company ADO intake assumptions with repo-specific GitHub issue intake |
| None | `DemoRequirementsAnalyst.agent.md` | Added | Extracted from prior planner and analysis prompt behavior |
| None | `DemoTaskBuilder.agent.md` | Added | Extracted from prior task-builder prompt behavior |

## Prompt And Skill Mapping Summary

| Company Prompt | New Target | Disposition | Notes |
| --- | --- | --- | --- |
| `business_logic_gap_detector.prompt.md` | `business-logic-gap-detection` | Kept and Reframed | Same core idea, expressed as a reusable skill |
| `capability_extractor.prompt.md` | `capability-extraction` | Kept and Simplified | Same capability-catalog goal, adapted to Next.js service desk app |
| `integration_test_check_list.prompt.md` | `test-strategy` | Changed | Old knowledge-generation checklist becomes direct test-planning skill |
| `plan_from_ado_bug.prompt.md` | `plan-from-github-bug` plus `DemoGitHubIssueIntake.agent.md` | Changed | ADO-specific intake replaced by GitHub issue flow |
| `plan_from_ado_userstory.prompt.md` | `plan-from-github-issue` plus `DemoPlanner.agent.md` | Changed | Work item planning kept, source system changed |
| `task_builder.prompt.md` | `task-decomposition` plus `DemoTaskBuilder.agent.md` | Kept and Split | Prompt logic becomes reusable skill plus dedicated agent role |
| `user_story_analysis.prompt.md` | `requirements-analysis` plus `DemoRequirementsAnalyst.agent.md` | Kept and Split | Analysis behavior extracted into explicit planning stage |

## New-Only Skills With No Direct Company Source

These skills are deliberate additions for the custom system rather than direct migrations:

- `artifact-workflow`
- `implementation-planning`
- `review-checklist`
- `service-desk-domain`
- `neon`
- `neon-postgres`
- `caveman`

## Deep Maps

- `MoltiAgentPlanner` deep map: `docs/agents/migration/molti-planner.md`
- `MoltiAgentImplementor` deep map: `docs/agents/migration/molti-implementor.md`
- `MoltiAgentIntegrationTester` deep map: `docs/agents/migration/molti-integration-tester.md` (reference only; not part of active rollout)
- `MoltiAgentKnowledgeBuilder` deep map: `docs/agents/migration/molti-knowledge-builder.md`
- `MoltiAgentVision` deep map: `docs/agents/migration/molti-vision.md`
- `MoltiAgentAsk` deep map: `docs/agents/migration/molti-ask.md`

## Highest-Impact Structural Changes

1. Session artifacts are no longer treated as repo-persisted planning state.
2. Approval authority is now explicitly user-only.
3. ADO intake is replaced by GitHub issue intake.
4. Review becomes an explicit first-class role.
5. Native vision is preferred; fallback vision agent stays available.
6. The old integration-test specialization is not carried forward as a dedicated role for this repo.

## Recommended Update Order

1. Align `DemoPlanner.agent.md` with governance and this migration map.
2. Align `DemoImplementor.agent.md` with governance and handoff rules.
3. Align `DemoTester.agent.md` and `DemoReviewer.agent.md` only as broader testing and review roles, not as an integration-tester migration.
4. Align remaining agents and skills.
