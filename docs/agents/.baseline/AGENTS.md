# serviceDeskDemo Agentic System

Route the current request through this file, then load only what that request needs. Keep this file under 80 lines: it is a router, not a knowledge base.

## Agents

- `demo-planner`: implementation planning from a validated work item.
- `demo-implementor`: implementation from an approved plan.
- `demo-integration-tester`: integration-test planning and execution.
- `demo-knowledge-builder`: repository knowledge and glossary refinement.
- `demo-vision`: deterministic extraction from visual evidence.

Full role contracts live in `.github/agents`. Do not restate them here.

## Skills

Repository skills live in `.github/skills`. Read a skill's `SKILL.md` before running its workflow.

## Instructions

Modular rules live in `.github/instructions`. Each file declares the paths it applies to; load one only when the current request touches those paths.

## Knowledge

- Select knowledge through `docs/agents/knowledge/README.md`. Match the request against the `When to read` triggers and load only the entries that match.
- Resolve repository vocabulary in `CONTEXT.md`.
- Never bulk-load knowledge files.

## Planning Sessions

- Planning work happens in `sessions/<planning-session-id>/`.
- Implementation plans follow `docs/agents/plan-schema.md`, artifacts and gates follow `docs/agents/artifact-gates.md`. Blocking clarifications follow the per-question format defined by the planner agent.

## Validation

Validate every change with `pnpm agent:lint-artifacts --mode <gate> --session <id>` for planning artifacts, then `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build` for buildable app changes before handing work back.

## Provenance

`docs/agents/agentic-system-manifest.md` records what was generated, which slots were filled, and which decisions were approved. Update it whenever this system changes.