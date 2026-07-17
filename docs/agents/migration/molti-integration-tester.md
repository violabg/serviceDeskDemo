# Deep Map: MoltiAgentIntegrationTester

## Source

- `tmp/github/agents/MoltiAgentIntegrationTester.agent.md`
- `tmp/prompts/integration_test_check_list.prompt.md`

## Primary New Targets

- `.github/agents2/DemoTester.agent.md`
- `.agents2/skills/test-strategy/`

## Disposition

Split and changed.

## Retained Concepts

- Testing should follow approved planning inputs.
- Test scope should be explicit.
- Narrow validation commands should run before broad suites.
- Production code changes should require proof from failing tests.

## Intentional Changes

- Old role specialized in integration tests only.
- New demo tester covers Vitest business-logic tests and React Testing Library behavior tests because that better matches this repo.
- The old integration-test knowledge checklist becomes a planning skill for focused test strategy rather than a knowledge-generation prompt.
- Test creation is aligned to the demo app stack instead of one-test-file-per-production-class doctrine.

## Migration Notes

- Company testing flow was stronger on discipline than on fit for this repo.
- The custom system should keep discipline, but adapt test types to actual framework usage.

## Follow-Up

- Clarify whether any integration-test-specific subflow still needs a dedicated future agent.
- Add reviewable handoff expectations from implementor to tester.
