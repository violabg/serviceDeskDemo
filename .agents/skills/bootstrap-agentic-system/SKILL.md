---
name: bootstrap-agentic-system
description: "Use when: bootstrapping a repository-specific coding agentic system with custom agents, gates, hidden subagents, skills, artifacts, handoffs, bounded knowledge loading, or a prompt-to-skill conversion for agent workflows."
argument-hint: "Target repo, preferred agent platform, and any known workflow risks"
disable-model-invocation: true
---

# Bootstrap Agentic System

Use this skill to design and optionally install a repository-local Agentic System. Bootstrap installs agent-system files only: instructions, agents, skills, prompts, governance docs, knowledge docs, artifact templates, session rules, and maintenance provenance.

Bootstrap must not implement application features, edit product code, modify database schema or migrations, change runtime configuration, or create product tests.

## Mission

Create a small, durable agent workflow that prevents the repository's likely costly failures in planning, knowledge loading, implementation handoff, validation, and maintenance.

The generated system must be repo-specific, approval-gated, template-backed, and maintainable. It must include Planner, Implementor, Tester or Integration Tester, Knowledge Builder, Ask, and root instructions unless the user explicitly approves a narrower system before generation. Knowledge Builder and Ask are mandatory in the first generated agent batch unless the user stops Bootstrap before generation.

Keep Bootstrap as one public orchestrator. Use internal scout lanes, decision registers, file plans, batch approvals, and audits to keep the workflow understandable; do not split the initial user-facing workflow into separate public entrypoints.

## Non-Negotiable Principles

- Generate from the public Bootstrap templates in this skill folder whenever a matching template exists.
- Treat `templates/agents/`, `templates/skills/`, and `templates/instructions/` as Canonical Template Mirrors: copy first, fill approved placeholders and slots, strip source-only slot markers, and preserve non-slot canonical wording.
- Do not paraphrase, reorder, weaken, summarize, split, or move mirrored non-slot content unless the user explicitly approves that non-slot change.
- Keep generated runtime files free of `CANONICAL-TEMPLATE-SLOT` comments. Those markers are source-template maintenance markers only.
- Record every generated, skipped, deferred, placeholder-filled, marker-stripped, and user-approved non-slot decision in the agentic-system manifest.
- Before writing files, produce a file plan and wait for explicit approval. Use one master plan and ask for approval before each write batch unless the user explicitly approves collapsed batches.
- Preserve required baseline tool and delegated-agent frontmatter when the target platform supports it. Add only exact discovered or user-approved MCP or platform tools.
- Every `tools:` frontmatter item in generated Markdown agents must be a string. When filling `"{{APPROVED_MCP_TOOLS}}"`, replace it with zero or more exact quoted tool-name strings, or remove the placeholder item when no additional tool is approved.
- Keep context glossary and knowledge index separate. A context glossary stores stable repository code/domain vocabulary; a knowledge index controls task-specific knowledge selection.
- Keep schema enforcement in generated runtime contracts. The enriched Planner template already contains slots for knowledge-index and plan-schema paths; Bootstrap must fill and verify those paths in generated files. The Planner also carries the clarification-question format in its own body, so no generated file may restate it.
- Keep root instructions short, navigational, and prompt-sensitive. Generate them from `templates/instructions/AGENTS.md`. Root instructions must route to generated agents, skills, schemas, knowledge index, glossary, and prompt-specific partials when relevant; they must not become a monolithic fact dump or duplicate full agent contracts for every request.
- Put specialized rules in modular instruction files generated from `templates/instructions/*.instructions.md`, each scoped by its `applyTo` paths, instead of growing the root instructions.
- Do not create a `CONTEXT.md` just because it is missing. Create or update a glossary only when stable repository vocabulary, source-of-truth boundaries, or ambiguous terms have been resolved.
- Never hand off a generated system without its maintenance baseline: the answers file, the pristine `.baseline/` copies, and the manifest customization register.
- Keep future maintenance explicit. Bootstrap writes manifest, answers, baseline, and changelog snapshot evidence so Maintainer can classify later contract deltas rather than silently rewriting files.

## Contract Files

This file is a router. Load the contract for the phase you are in; do not load them all up front.

| Contract                               | Load when                                                                                                 |
| -------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `contracts/source-model.md`            | Any phase, before reading templates or the registry. Defines the source assets and the shared vocabulary. |
| `contracts/discovery-and-decisions.md` | Phases A-C: intake, bounded discovery, decision register.                                                 |
| `contracts/generation.md`              | Phases D-E: proposal, file plan, copy-first generation, maintenance baseline writes.                      |
| `contracts/audit-and-handoff.md`       | Phases F-H: schema enforcement, contract audit, maintenance handoff.                                      |

## Bootstrap Phases

Run the phases in order. Each entry names the phase's purpose and the contract that governs it.

- Phase A, Intake And Scope: confirm the request is agent-system work and capture the target repo, platform, language, prefix, risks, and whether generation is wanted. See `contracts/discovery-and-decisions.md`.
- Phase B, Bounded Discovery: run the read-only discovery lanes and produce the candidate tool and integration matrix. See `contracts/discovery-and-decisions.md`.
- Phase C, Decision Register: resolve every required decision one question at a time, driven by `registry/placeholders.yaml` and `registry/capabilities.yaml`. See `contracts/discovery-and-decisions.md`.
- Phase D, Proposal And File Plan: produce the proposal, the file plan, and the batch approval checkpoints. Approval is false by default. See `contracts/generation.md`.
- Phase E, Copy-First Generation: apply the approved batch from the mirrors, then write the answers file, the pristine baseline copies, and the customization register. See `contracts/generation.md`.
- Phase F, Runtime Schema And Knowledge Enforcement: verify generated Planner cites the knowledge-index and plan-schema paths and keeps its own clarification format. See `contracts/audit-and-handoff.md`.
- Phase G, Contract Audit And Validation: run the full generated-system checklist and treat missing required elements as blocking. See `contracts/audit-and-handoff.md`.
- Phase H, Maintenance Handoff: report evidence, paths, deferred decisions, risks, and post-bootstrap recommendations. See `contracts/audit-and-handoff.md`.

## Output Shape

Before writes: output the proposal and unapproved file plan, then ask for explicit approval.

After writes: output changed files, validation results, Bootstrap contract alignment, manifest, answers, baseline, and changelog snapshot paths, post-bootstrap recommendations, and remaining risks.
