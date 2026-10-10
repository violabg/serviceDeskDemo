# {{REPO_NAME}} Agentic System

Route the current request through this file, then load only what that request needs. Keep this file under 80 lines: it is a router, not a knowledge base.

## Agents

{{AGENT_ROSTER}}

Full role contracts live in `{{AGENT_ROOT}}`. Do not restate them here.

## Skills

Repository skills live in `{{SKILL_ROOT}}`. Read a skill's `SKILL.md` before running its workflow.

## Instructions

Modular rules live in `{{INSTRUCTION_ROOT}}`. Each file declares the paths it applies to; load one only when the current request touches those paths.

## Knowledge

- Select knowledge through `{{KNOWLEDGE_INDEX_PATH}}`. Match the request against the `When to read` triggers and load only the entries that match.
- Resolve repository vocabulary in `{{CONTEXT_GLOSSARY_PATH}}`.
- Never bulk-load knowledge files.

## Planning Sessions

- Planning work happens in `{{SESSION_ROOT}}/<planning-session-id>/`.
- Implementation plans follow `{{PLAN_SCHEMA_PATH}}`, artifacts and gates follow `{{ARTIFACT_GATES_PATH}}`. Blocking clarifications follow the per-question format defined by the planner agent.

## Validation

Validate every change with `{{VALIDATION_COMMANDS}}` before handing work back.

## Provenance

<!-- CANONICAL-TEMPLATE-SLOT: MAINTENANCE_ROOT START replaces=none -->
During initial Bootstrap or explicitly requested agent-system maintenance only, access `{{MAINTENANCE_ROOT}}` and the complete Bootstrap/Maintainer skills at `.agents/skills/bootstrap-agentic-system/` and `.agents/skills/maintain-agentic-system/`. For ordinary work, exclude these paths and their aliases before search, indexing, knowledge retrieval, or delegation; do not load their contents. If ordinary work changes an agent-system file, report that maintenance evidence needs refreshing; do not open or update the evidence ledger.
<!-- CANONICAL-TEMPLATE-SLOT: MAINTENANCE_ROOT END -->
`{{MANIFEST_PATH}}` records what was generated, which slots were filled, and which decisions were approved. Update it during explicitly approved maintenance.
