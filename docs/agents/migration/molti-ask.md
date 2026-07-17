# Deep Map: MoltiAgentAsk

## Source

- `tmp/github/agents/MoltiAgentAsk.agent.md`

## Primary New Targets

- No direct one-to-one target
- Clarification behavior absorbed by `.github/agents2/DemoPlanner.agent.md`
- Requirement analysis behavior absorbed by `.github/agents2/DemoRequirementsAnalyst.agent.md`

## Disposition

Dropped as a standalone workflow role and redistributed.

## Retained Concepts

- Project-specific answers should be grounded in repo context.
- Clarifying questions should be concrete and minimal.

## Intentional Changes

- Company system had a dedicated Q&A specialist agent.
- The custom system does not make that role part of the core planning-implementation-testing-review workflow.
- Requirement clarification stays inside planning; generic Q&A does not need session-heavy workflow rules.

## Migration Notes

- This is a structural simplification.
- The domain analysis and clarification pieces survive, but the separate role does not.

## Follow-Up

- Decide later whether a lightweight repo Q&A agent is needed outside the core delivery workflow.
