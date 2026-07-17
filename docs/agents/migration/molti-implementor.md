# Deep Map: MoltiAgentImplementor

## Source

- `tmp/github/agents/MoltiAgentImplementor.agent.md`
- `tmp/prompts/business_logic_gap_detector.prompt.md`

## Primary New Targets

- `.github/agents2/DemoImplementor.agent.md`
- `.agents2/skills/business-logic-gap-detection/`

## Disposition

Changed and narrowed.

## Retained Concepts

- Approved-plan-first implementation
- Scope discipline
- Narrow recovery rules
- Validation after implementation
- Optional defect-exposing test design as a separate mode

## Intentional Changes

- Old implementation agent carried very large gate machinery and tool-specific session management.
- New implementor should keep plan authority and validation discipline, but use simpler repo-local language.
- Test creation is no longer mixed as heavily into the implementor role; focused testing belongs with `DemoTester` unless the approved plan explicitly scopes optional test work.
- Session artifact references must align to exported session packages rather than durable repo folders.

## Migration Notes

- The best company concept here is anti-research discipline: implement from plan first, search only when blocked.
- The main risk to remove is instruction bulk that hides the core safety rules.
- `business-logic-gap-detection` preserves the intentional defect-exposure idea without forcing it into the normal implementation path.

## Follow-Up

- Add explicit reference to user-only approval rule.
- Add required handoff envelope for implementor to tester or reviewer.
- Align changed-files tracking wording with session-package model.
