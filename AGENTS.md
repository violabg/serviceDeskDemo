# serviceDeskDemo Agentic System

Route the current request through this file, then load only what that request needs. Keep this file under 80 lines: it is a router, not a knowledge base.

## Agents

Resolve the active environment from the client/session identity first: use `codex` or `copilot`, never infer selection from installed folders or another client's tools. If ambiguous, ask for identity before binding-dependent work. Load only `docs/agents/bindings/<environment>.md` and the complete selected role contract below.

- `demo-planner`: GitHub-issue planning and clarification. Load `docs/agents/canonical/<environment>/agents/demo-planner.agent.md`.
- `demo-implementor`: approved-plan implementation. Load `docs/agents/canonical/<environment>/agents/demo-implementor.agent.md`.
- `demo-direct-implementor`: explicit implementation without a plan document; no test creation. Load `docs/agents/canonical/<environment>/agents/demo-direct-implementor.agent.md`.
- `demo-integration-tester`: integration-test planning and execution. Load `docs/agents/canonical/<environment>/agents/demo-integration-tester.agent.md`.
- `demo-knowledge-builder`: evidence-backed repository knowledge. Load `docs/agents/canonical/<environment>/agents/demo-knowledge-builder.agent.md`.
- `demo-ask`: read-only Q&A. Load `docs/agents/canonical/<environment>/agents/demo-ask.agent.md`.
- `demo-vision`: Luna image extraction; delegated only when the caller lacks vision. Load `docs/agents/canonical/<environment>/agents/demo-vision.agent.md`.

Shared skills use only the already selected environment binding. Invoke the complete configured skill at `.agents/skills/<skill-name>/SKILL.md`; packaged Bootstrap templates are source mirrors, never configured runtime skills.

Full role contracts live in `docs/agents/canonical/<environment>/agents (codex or copilot)`. Do not restate them here.

## Skills

Repository skills live in `.agents/skills`. Read a skill's `SKILL.md` before running its workflow.


## Instructions

Modular rules live in `docs/agents/instructions; skip a shared rule already loaded by the active environment's native adapter`. Each file declares the paths it applies to; load one only when the current request touches those paths.

## Knowledge

- Select knowledge through `knowledge/knowledge-index.md`. Match the request against the `When to read` triggers and load only the entries that match.
- Resolve repository vocabulary in `docs/agents/context-glossary.md`.
- Never bulk-load knowledge files.

## Planning Sessions

- Planning work happens in `sessions/<planning-session-id>/`.
- Implementation plans follow `docs/agents/plan-schema.md`, artifacts and gates follow `docs/agents/artifact-gates.md`. Blocking clarifications follow the per-question format defined by the planner agent.

## Validation

Validate every change with `diagnostics, then pnpm typecheck and scoped lint, then focused pnpm test -- <affected-files>; run pnpm lint, pnpm test and pnpm build only when the approved change requires broader validation; agent-system-only changes use python3 .agentic-system-maintenance/scripts/verify-agentic-system.py` before handing work back.

## Provenance

During initial Bootstrap or explicitly requested agent-system maintenance only, access `.agentic-system-maintenance/` and the complete Bootstrap/Maintainer skills at `.agents/skills/bootstrap-agentic-system/` and `.agents/skills/maintain-agentic-system/`. For ordinary work, exclude these paths and their aliases before search, indexing, knowledge retrieval, or delegation; do not load their contents. If ordinary work changes an agent-system file, report that maintenance evidence needs refreshing; do not open or update the evidence ledger.
`.agentic-system-maintenance/agentic-system-manifest.md` records what was generated, which slots were filled, and which decisions were approved. Update it during explicitly approved maintenance.
