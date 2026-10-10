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
Access `{{MAINTENANCE_ROOT}}` and installed Bootstrap/Maintainer bodies and resources only during initial Bootstrap or explicitly requested agent-system maintenance. For ordinary requests, never read, search, index, summarize, or load them; exclude paths and aliases before retrieval and pass exclusions to delegates. The provenance update below runs only in maintenance; ordinary runtime edits report the need for maintenance.
<!-- CANONICAL-TEMPLATE-SLOT: MAINTENANCE_ROOT END -->
`{{MANIFEST_PATH}}` records what was generated, which slots were filled, and which decisions were approved. Update it whenever this system changes.
