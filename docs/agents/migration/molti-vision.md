# Deep Map: MoltiAgentVision

## Source

- `tmp/github/agents/MoltiAgentVision.agent.md`

## Primary New Target

- `.github/agents2/DemoVisionUI.agent.md`

## Disposition

Changed and narrowed.

## Retained Concepts

- Visual inputs can materially change planning quality.
- Structured output is better than vague image description.
- Uncertainty should be called out explicitly.

## Intentional Changes

- Old visual agent was a primary extraction engine.
- New visual agent is fallback only because the active model may inspect images directly.
- Output is tuned for planning usefulness rather than maximal machine-readable exhaustiveness.

## Migration Notes

- This is a deliberate simplification, not a loss of capability.
- Native vision first is now part of the governance contract.

## Follow-Up

- Keep planner and vision-agent wording aligned so fallback activation is unambiguous.
