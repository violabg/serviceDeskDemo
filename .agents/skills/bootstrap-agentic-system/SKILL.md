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

The generated system must be repo-specific, approval-gated, template-backed, and maintainable. It must include Planner, Implementor, Tester or Integration Tester, Knowledge Builder, and root instructions unless the user explicitly approves a narrower system before generation. Knowledge Builder is mandatory in the first generated agent batch unless the user stops Bootstrap before generation.

Keep Bootstrap as one public orchestrator. Use internal scout lanes, decision registers, file plans, batch approvals, and audits to keep the workflow understandable; do not split the initial user-facing workflow into separate public entrypoints.

## Non-Negotiable Principles

- Generate from the public Bootstrap templates in this skill folder whenever a matching template exists.
- Treat `templates/agents/` and `templates/skills/` as Canonical Template Mirrors: copy first, fill approved placeholders and slots, strip source-only slot markers, and preserve non-slot canonical wording.
- Do not paraphrase, reorder, weaken, summarize, split, or move mirrored non-slot content unless the user explicitly approves that non-slot change.
- Keep generated runtime files free of `CANONICAL-TEMPLATE-SLOT` comments. Those markers are source-template maintenance markers only.
- Record every generated, skipped, deferred, placeholder-filled, marker-stripped, and user-approved non-slot decision in the agentic-system manifest.
- Before writing files, produce a file plan and wait for explicit approval. Use one master plan and ask for approval before each write batch unless the user explicitly approves collapsed batches.
- Preserve required baseline tool and delegated-agent frontmatter when the target platform supports it. Add only exact discovered or user-approved MCP or platform tools.
- Every `tools:` frontmatter item in generated Markdown agents must be a string. When filling `"{{APPROVED_MCP_TOOLS}}"`, replace it with zero or more exact quoted tool-name strings, or remove the placeholder item when no additional tool is approved.
- Keep context glossary and knowledge index separate. A context glossary stores stable repository code/domain vocabulary; a knowledge index controls task-specific knowledge selection.
- Keep schema enforcement in generated runtime contracts. The enriched Planner template already contains slots for knowledge-index, plan-schema, and question-schema paths; Bootstrap must fill and verify those paths in generated files.
- Keep root instructions short, navigational, and prompt-sensitive. Root instructions must route to generated agents, skills, schemas, knowledge index, glossary, and prompt-specific partials when relevant; they must not become a monolithic fact dump or duplicate full agent contracts for every request.
- Do not create a `CONTEXT.md` just because it is missing. Create or update a glossary only when stable repository vocabulary, source-of-truth boundaries, or ambiguous terms have been resolved.
- Keep future maintenance explicit. Bootstrap writes manifest and changelog snapshot evidence so Maintainer can classify later contract deltas rather than silently rewriting files.

## Source Model

Load source assets only when their output is needed.

Primary templates:

- `templates/generated-system-blueprint.md`: first-install structure, batch order, directory strategy, and generated-system map.
- `templates/bootstrap-file-plan.md`: proposal and approval plan shape.
- `templates/agents/`: Canonical Template Mirrors for generated agents.
- `templates/skills/`: Canonical Template Mirrors for generated skills.
- `templates/agentic-system-manifest.md`: provenance ledger and maintenance handoff.
- `templates/knowledge-index-schema.md`: bounded knowledge-loading index.
- `templates/plan-schema.md`: implementation-plan artifact contract.
- `templates/question-schema.md`: blocking clarification artifact and per-question chat shape.
- `templates/artifact-gates.md`: artifact, gate, and handoff conventions.
- `templates/agent-role-contracts.md`: baseline role, tool, and delegation reference for roles without mirrors or for validating mirrored frontmatter.
- `templates/agent-contracts.md`: custom agent contract reference when no mirror exists.

The installed Bootstrap `CHANGELOG.md` is a provenance input. Read it once during generation, copy it to the target repository's snapshot path, and record both paths in the manifest. After bootstrap, the manifest and repo-local snapshot are the durable local baseline for Maintainer.

## Vocabulary

- Canonical Template Mirror: a public-safe generated-agent or generated-skill source file under `templates/agents/` or `templates/skills/` whose non-slot wording must be preserved.
- Personalization Slot: an approved `{{PLACEHOLDER}}` value or `CANONICAL-TEMPLATE-SLOT` block that Bootstrap may fill from target-repository evidence or explicit user approval.
- Preserved Canonical Body: every non-slot line, heading, frontmatter baseline, gate, and rule copied from a mirror.
- Generated Runtime File: the target repository file produced from a mirror after placeholder fill and marker stripping.
- Schema Gate: validation that generated Planner and artifacts explicitly cite and obey the generated knowledge-index, plan-schema, and question-schema paths.
- Contract Delta: a future Bootstrap, template, schema, or changelog change that Maintainer must classify against an existing generated system.

## Bootstrap Phases

### Phase A: Intake And Scope

Confirm the request is agent-system design or installation. Stop or redirect if the user asks for application implementation, product testing, database work, runtime configuration, or approval bypass.

Capture these initial facts:

- target repository and working root,
- preferred agent platform or unknown platform,
- output language,
- desired custom agent prefix or permission for Bootstrap to propose one,
- known workflow risks,
- whether the user wants planning only or approved generation.

Do not write files in this phase.

### Phase B: Bounded Discovery

Run read-only discovery. Use bounded hidden subagents when the platform supports them; otherwise perform the same checks inline and report that subagent delegation was unavailable.

Discovery lanes:

- Platform and Tooling: customization folders, agent platform conventions, MCP config, tool allowlists, and platform constraints.
- Tracker and Session: GitHub, Jira, Linear, Azure DevOps, Notion, local Markdown issue models, session roots, ID patterns, and current-session-only restrictions.
- Knowledge and Glossary: `CONTEXT.md`, glossaries, ADRs, docs, source-of-truth boundaries, repeated repository vocabulary, aliases, and ambiguous terms.
- Visual Artifacts: screenshots, mockups, diagrams, UI snapshots, image assets, issue attachments, browser screenshots, annotated QA evidence, and whether image evidence affects planning or testing.
- Validation Surface: package scripts, CI, lint/test commands, PR templates, contribution docs, and commands generated agents should run.

Each lane reports compact evidence, inferred facts, unknowns, and risks. Do not produce a broad repository tour.

Before leaving this phase, produce a candidate tool and integration matrix. List discovered MCPs, platform tools, built-in tool surfaces, candidate generated agents or skills that might receive each tool, why each tool helps, risks from adding authority, intentionally omitted tools, and unknown integrations. This matrix is discovery output only, not approval.

### Phase C: Decision Register

Turn discovery into bounded decisions before proposing files. Ask only questions that materially change the generated system.

Required decisions:

- target agent platform,
- custom agent prefix,
- root instruction strategy (`AGENTS.md` by default, or approved platform equivalent),
- tracker/session model,
- local Markdown issue root, ID format, and lookup/index rule when no external tracker is configured,
- approved MCP and platform integration assignments by exact tool name,
- context glossary action: create, update, no change, or defer,
- terminology normalization for competing or ambiguous repository terms,
- knowledge-index path and first-install contents,
- plan-schema and question-schema destination paths,
- session root and current-session-only restriction,
- Vision support: Vision agent, smaller visual-intake skill, defer, or no change,
- Canonical Template Mirror skills to generate, skip, or defer,
- approval owner and batch approval plan.

Use bounded choices where possible. Do not enter proposal or file-plan approval while blocking decisions remain unresolved. Tool decisions must use choices such as `add`, `omit`, `move to another agent or skill`, `recommend only`, `defer`, or `needs more discovery`.

After user confirmation, create an approved decision register. Every approved tool or integration assignment with choice `add` or `move to another agent or skill` becomes a planned file change and must appear by exact string name in the generated target file's `tools:` frontmatter or required-tool section.

### Phase D: Proposal And File Plan

Load `templates/generated-system-blueprint.md` and `templates/bootstrap-file-plan.md`. Produce a concise proposal plus a file plan. Mark approval false by default.

The proposal must cover:

- costly repository workflow failures Bootstrap is addressing,
- generated role model and instruction hierarchy,
- selected custom agent prefix,
- root instruction strategy,
- tracker/session contract,
- context glossary decision,
- knowledge-index strategy,
- visual artifact strategy,
- selected Canonical Template Mirror agents and skills,
- tool and integration assignment register,
- agentic-system manifest and Bootstrap changelog snapshot strategy,
- staged batch plan,
- validation commands,
- post-bootstrap recommendations.

The file plan must include:

- generated path map,
- preservation matrix for this run,
- source template path for every generated mirror,
- approved placeholder values and slot replacements,
- source-only marker stripping decisions,
- any explicit user-approved non-slot changes,
- files generated, skipped, or deferred,
- schema file destinations copied from `templates/plan-schema.md` and `templates/question-schema.md`, plus any approved repo-local equivalent or adaptation,
- context glossary operation or no-op reason,
- issue tracker or local Markdown adapter contract,
- batch approval checkpoints,
- rollback notes.

Default batch order:

1. Core System: root instructions, manifest, Bootstrap changelog snapshot, knowledge index shell, repo-local schema files copied from `templates/plan-schema.md` and `templates/question-schema.md`, Planner, Implementor, Tester or Integration Tester, Knowledge Builder, Ask when selected, and context glossary only when resolved.
2. Vision Evidence: Vision agent or visual-intake skill when selected.
3. Knowledge Builder Bootstrap: initial knowledge files and index entries when evidence supports them; otherwise recommend running generated Knowledge Builder.
4. Skill Template Generation: selected skills from `templates/skills/`.
5. Contract Audit: final preservation, schema, manifest, tool, tracker, glossary, knowledge, and validation checks.

Ask for explicit approval before any write batch. Do not write generated files while the plan is unapproved.

### Phase E: Copy-First Generation

After approval, apply only the approved batch.

For every generated agent or skill with a matching mirror:

- read the mirror from `templates/agents/` or `templates/skills/`,
- copy the mirror into the planned target path,
- replace inline placeholders from the approved decision register,
- fill or remove approved block slots,
- strip `CANONICAL-TEMPLATE-SLOT` marker comments from final generated runtime files,
- preserve non-slot canonical wording and heading order,
- preserve baseline `tools:` and `agents:` frontmatter when supported,
- replace `"{{APPROVED_MCP_TOOLS}}"` with exact quoted string tool names or remove it if no additional tools are approved,
- replace `"{{VISION_AGENT_NAME}}"` with the generated Vision agent name when Vision is selected, or remove that delegated-agent item only when the approved file plan records the no-op,
- record all decisions in the manifest.

For generated work-item planning skills:

- do not add skill-level `tools:` frontmatter,
- name the selected external tracker adapter or local Markdown adapter in the body,
- preserve Planner-only invocation,
- preserve inline `#tool:agent/runSubagent` gathering instructions from the mirrors,
- record issue root, ID pattern, lookup/index rule, required fields, and missing-ID behavior.

For generated runtime schema files:

- copy `templates/plan-schema.md` to the approved implementation-plan schema path,
- copy `templates/question-schema.md` to the approved clarification-question schema path,
- preserve the plan schema's filesystem-tree links, File Details anchors, backlinks, approval metadata, operations, validation, and risks,
- preserve the question schema's blocking rule, question register, answers table, per-question chat shape, and answer-choice format,
- record any approved stronger repo-local equivalent or adaptation in the manifest.

For generated files without a mirror, adapt `templates/agent-role-contracts.md`, `templates/agent-contracts.md`, or a user-approved local equivalent. Non-mirrored additions may use partial files, but partials must not replace mirrored canonical content.

### Phase F: Runtime Schema And Knowledge Enforcement

After generated files exist, audit the generated system, not the source templates.

Required Planner checks:

- Planner names the generated knowledge-index path before any knowledge-file loading instruction.
- Planner states that the knowledge index is derived from `templates/knowledge-index-schema.md` or an approved repo-local equivalent.
- Planner requires index-first selection by `When to read` triggers and forbids bulk-loading all knowledge files.
- Planner records selected and skipped relevant knowledge candidates in planning artifacts.
- Planner names the generated implementation-plan schema path copied from `templates/plan-schema.md` or an approved repo-local equivalent.
- Planner states plan-schema compliance overrides markdown cleanup for required filesystem-tree links, File Details anchors, backlinks, approval metadata, operations, validation, and risks.
- Planner names the generated clarification-question schema path copied from `templates/question-schema.md` or an approved repo-local equivalent.
- Planner requires the question schema's per-question chat shape for blocking clarifications and forbids requesting plan approval while blocking questions remain unresolved.

Missing schema paths or generic phrases such as "use the repo template" are blocking validation failures.

### Phase G: Contract Audit And Validation

Validate the generated files against the approved file plan, the user's decisions, and this Bootstrap contract. Use a Contract Auditor subagent when available; otherwise run the checklist inline.

Required checks:

- Every approved file operation was completed, skipped with an approved reason, or reported as blocked.
- Root `AGENTS.md` exists, or the approved platform-equivalent root instruction file exists with the reason for not creating `AGENTS.md`.
- Root instructions name generated agents, generated skills or skill directory, session rules, validation expectations, context glossary path when one exists, knowledge-index path, schema paths, and manifest path without duplicating full agent contracts.
- Root instructions are prompt-sensitive and navigational: they tell agents which generated agents, skills, schemas, knowledge-index entries, glossary, and partial instruction files to consult for the current request, and they do not bulk-load repository facts or full role contracts into every request.
- Manifest exists at the approved path and follows `templates/agentic-system-manifest.md` or an approved equivalent.
- Manifest records Bootstrap skill version used, Bootstrap contract applied through, installed Bootstrap changelog path, repo-local Bootstrap changelog snapshot path, generated paths, slot decisions, marker stripping, generated/skipped/deferred mirrors, and maintenance history.
- Repo-local Bootstrap changelog snapshot exists when the installed changelog was available, or the manifest records why the baseline was inferred or unknown.
- Generated runtime files from mirrors contain no `CANONICAL-TEMPLATE-SLOT` markers.
- Generated runtime files preserve mirrored non-slot canonical wording unless the file plan records explicit user approval for a non-slot change.
- Every generated agent has the required baseline tool surface or an approved reduction.
- Every approved MCP or platform tool assignment appears by exact string name in the approved target agent or required-tool section.
- Every omitted, deferred, or recommendation-only integration is absent from generated tool surfaces and recorded with a reason.
- Every `tools:` frontmatter item is a string.
- Tracker/session contract names the external adapter or local Markdown issue root, ID format, lookup/index rule, required fields, and missing-ID behavior when ID-based skills are generated.
- Context glossary operation or no-op matches the approved decision; any glossary is primarily repository code/domain vocabulary and records preferred terms, avoided terms, aliases, and distinctions when ambiguity was resolved.
- Knowledge index exists when planned and includes purpose, token budget rule, knowledge entries, `When to read` triggers, selection workflow, and artifact record.
- Plan schema and question schema exist at the approved paths, preserve the required content from `templates/plan-schema.md` and `templates/question-schema.md` or an approved stronger equivalent, and are explicitly referenced by Planner.
- Vision decision is reflected in generated files or recorded as an intentional no-op.
- Knowledge Builder contract requires repository scanning, knowledge-index creation or refinement, context-glossary term suggestions, and bounded questions for missing knowledge areas.
- Generated work-item planning skills preserve tracker/local adapter, session, evidence, Planner-only, no-skill-tools-frontmatter, and `#tool:agent/runSubagent` requirements.
- Validation commands from the file plan were run where available, or each skipped command has a reason.

Treat missing required contract elements as blocking failures unless the user explicitly approved the omission.

### Phase H: Maintenance Handoff

Finish by recording maintenance evidence and future recommendations.

The final handoff must include:

- changed files,
- generated/skipped/deferred mirrors,
- validation results,
- Bootstrap contract version applied through,
- manifest path,
- repo-local Bootstrap changelog snapshot path,
- deferred decisions,
- remaining risks,
- post-bootstrap recommendations.

Always recommend:

- run the generated Knowledge Builder agent to scan repository knowledge, refine the knowledge index, suggest context-glossary terms, and ask bounded questions for missing knowledge boundaries,
- use `create-work-item-planning-skills` when the team wants `plan-bug-from-id` and `plan-user-story-from-id` skills refined or regenerated,
- use `create-work-item-from-description` when the team wants repeatable creation of user-story or bug tickets from clarified work.

Future upstream, schema, template, or changelog changes belong to `maintain-agentic-system`. Maintainer must classify each Bootstrap contract delta as `applied`, `not applicable`, `deferred`, `superseded`, `unknown`, or `requires update` using the manifest, repo-local snapshot, current installed changelog, and direct repository evidence.

## Output Shape

Before writes: output the proposal and unapproved file plan, then ask for explicit approval.

After writes: output changed files, validation results, Bootstrap contract alignment, manifest and changelog snapshot paths, post-bootstrap recommendations, and remaining risks.
