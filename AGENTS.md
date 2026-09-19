# serviceDeskDemo Agentic System

Route the current request through this file, then load only what that request needs. Keep this file under 80 lines: it is a router, not a knowledge base.

## Agents

- `demo-planner`: GitHub-issue planning and clarification. Load its complete contract under `docs/agents/canonical/<environment>/agents/` and its role bindings in `docs/agents/integration-bindings.md`.
- `demo-implementor`: approved-plan implementation. Load its complete contract under `docs/agents/canonical/<environment>/agents/` and its role bindings in `docs/agents/integration-bindings.md`.
- `demo-direct-implementor`: explicit direct implementation without a plan document; no test creation. Load its complete contract under `docs/agents/canonical/<environment>/agents/` and its role bindings in `docs/agents/integration-bindings.md`.
- `demo-integration-tester`: integration-test planning and execution. Load its complete contract under `docs/agents/canonical/<environment>/agents/` and its role bindings in `docs/agents/integration-bindings.md`.
- `demo-knowledge-builder`: evidence-backed repository knowledge. Load its complete contract under `docs/agents/canonical/<environment>/agents/` and its role bindings in `docs/agents/integration-bindings.md`.
- `demo-ask`: read-only Q&A. Load its complete contract under `docs/agents/canonical/<environment>/agents/` and its role bindings in `docs/agents/integration-bindings.md`.
- `demo-vision`: Luna image extraction, delegated only when the caller lacks vision. Load its complete contract under `docs/agents/canonical/<environment>/agents/` and its role bindings in `docs/agents/integration-bindings.md`.

Full role contracts live in `docs/agents/canonical/<environment>/agents (codex or copilot)`. Do not restate them here.

## Skills

Repository skills live in `.agents/skills`. Read a skill's `SKILL.md` before running its workflow.

## Instructions

Modular rules live in `.github/instructions`. Each file declares the paths it applies to; load one only when the current request touches those paths.

## Knowledge

- Select knowledge through `docs/agents/knowledge/README.md`. Match the request against the `When to read` triggers and load only the entries that match.
- Resolve repository vocabulary in `docs/agents/context-glossary.md`.
- Never bulk-load knowledge files.

## Planning Sessions

- Planning work happens in `sessions/<planning-session-id>/`.
- Implementation plans follow `docs/agents/plan-schema.md`, artifacts and gates follow `docs/agents/artifact-gates.md`. Blocking clarifications follow the per-question format defined by the planner agent.

## Validation

Validate every change with `diagnostics, then pnpm typecheck and scoped lint, then focused pnpm test -- <affected-files>; run pnpm lint, pnpm test and pnpm build only when the approved change requires broader validation; agent-system-only changes use python3 docs/agents/scripts/verify-agentic-system.py` before handing work back.

## Provenance

`docs/agents/agentic-system-manifest.md` records what was generated, which slots were filled, and which decisions were approved. Update it whenever this system changes.
