# Generated Agentic System Blueprint

Use this blueprint to make the first generated system resemble a complete repository-local operating system, while still adapting paths, names, gates, and skills to the target repository.

Do not copy this blueprint blindly. Keep only the pieces that prevent likely workflow failures in the target repository, and record omitted high-cost pieces in the file plan.

## Staged Install Batches

Produce one master file plan, then ask for approval before each write batch. Do not collapse batches unless the user explicitly approves a combined write.

### Batch 1: Core System

The Core System batch should normally include:

| File | Required | Purpose |
| --- | --- | --- |
| `AGENTS.md` | Yes, unless an approved platform equivalent replaces it | Stable prompt-sensitive entrypoint that routes agents to contracts, skills, repo-local schemas, templates, session rules, glossary, knowledge index, manifest, relevant partials, and validation commands without becoming a monolithic fact dump. |
| `<agent-dir>/<prefix>-planner.agent.md` | Yes | Planning-only role that clarifies, selects knowledge, drafts the approved implementation plan, and hands off. |
| `<agent-dir>/<prefix>-implementor.agent.md` | Yes | Implementation role that edits only from an approved plan and validates the touched behavior. |
| `<agent-dir>/<prefix>-tester.agent.md` | Yes | Test role for approved test strategy, integration tests, or repo-specific validation. |
| `<agent-dir>/<prefix>-knowledge-builder.agent.md` | Yes | Read-only knowledge role that creates or refines the knowledge index and suggests glossary terms. |
| `<agent-dir>/<prefix>-ask.agent.md` | Yes | Q&A-only role for knowledge-grounded answers without implementation authority. |
| `<agent-dir>/<prefix>-contract-auditor.agent.md` | Optional hidden | Read-only generated-file auditor for file-plan and contract adherence. |
| `<agent-dir>/<prefix>-partials/` | Optional | Additive prompt-scoped instruction modules for repo-specific extensions or custom roles without Canonical Template Mirrors. They must not replace mirrored non-slot content and cannot relocate canonical content. |
| `<manifest-path>` | Yes | Version provenance ledger that records the Bootstrap skill version, Bootstrap contract applied-through version, installed skill changelog source, repo-local snapshot path, and later maintenance history. |
| `<bootstrap-changelog-snapshot-path>` | Yes | Repo-local copy of the installed Bootstrap skill `CHANGELOG.md` used as the maintenance baseline when the original installed skill path is unavailable later. |
| `<knowledge-index-path>` | Yes | Index-first routing file with knowledge entries and `When to read` triggers. |
| `<template-dir>/plan-schema.md` | Yes | Implementation-plan artifact schema copied or adapted from this skill. |
| `<template-dir>/test-plan-schema.md` | When Integration Tester is selected | Verified existing test-plan schema or the shipped local YAML fallback. |
| `<template-dir>/artifact-gates.md` | Usually | Gate, approval, handoff, and session artifact contract. |
| `<context-glossary-path>` | When glossary-worthy terms are resolved | Repository code/domain vocabulary and source-of-truth boundaries. |

Do not generate Vision in the Core System batch.

### Batch 2: Vision Evidence

Run only when the user selects Vision support.

| File | Required | Purpose |
| --- | --- | --- |
| `<agent-dir>/<prefix>-vision.agent.md` | When selected | Image-to-text role for screenshots, mockups, diagrams, UI snapshots, assets, or QA images. |
| `<agent-dir>/<prefix>-partials/vision/` | When selected and partials are used | Prompt-scoped Vision guidance and evidence-intake rules. |

Ask for only the visual assets needed to configure the workflow. Generate Vision last among agents, and wire Planner-to-Vision handoff only after the visual-evidence strategy is known.

### Batch 3: Knowledge Builder Bootstrap

Use the generated Knowledge Builder to fill missing repository knowledge before finalizing generated skills.

| File | Required | Purpose |
| --- | --- | --- |
| `<knowledge-index-path>` | Yes | Add evidence-backed entries and `When to read` triggers. |
| `<knowledge-path>` | When selected | Repository knowledge entries backed by docs, code, commands, or user answers. |

Keep the context glossary separate from the knowledge index.

### Batch 4: Skill Template Generation

Present the full Canonical Template Mirror skill inventory and let the user choose `generate`, `skip`, or `defer` for each skill.

| File or Skill | Required | Purpose |
| --- | --- | --- |
| `author-repo-skill` | Recommended | Author or rework a repository-local skill after Bootstrap, so later procedures do not get grafted onto agent contracts. |
| `plan-bug-from-id` | User-selected | Plan from an existing bug work item ID. |
| `plan-user-story-from-id` | User-selected | Plan from an existing user-story work item ID. |
| `user-story-analysis` | User-selected | Analyze user-story completeness, ambiguity, edge cases, and risks. |
| `business-logic-gap-detector` | User-selected | Find business-logic gaps and missing branch coverage. |
| `integration-test-knowledge-checklist` | User-selected | Build or maintain integration-test knowledge. |

Generate selected skills from `templates/skills/`, fill only approved Personalization Slots, and record every generated, skipped, and deferred skill in the manifest.

### Batch 5: Contract Audit

Verify generated files against the approved file plan, Canonical Template Mirrors, slot values, baseline tool surfaces, exact approved MCP/platform tools, manifest records, and tracker/session/glossary/knowledge/visual decisions.

## Optional Later Batches

Use later batches for workflows that are valuable but not required for the first stable install:

| File or Skill | When to Add |
| --- | --- |
| Refinement of the generated `plan-bug-from-id` and `plan-user-story-from-id` through the installed `author-repo-skill` | The team wants to revise the repository-local planning skills after Bootstrap. |
| Repository-local create-bug or create-user-story skills | The team repeatedly creates work items from clarified requirements or QA findings. Prefer `create-work-item-from-description` when available. |
| Business-logic gap detector skill | The team wants an explicit test-first weakness-finding workflow for production logic. |
| Integration-test knowledge checklist skill | The team needs repeatable creation or maintenance of project-specific integration-test knowledge. |
| Review agent | Review has a separate authority boundary, durable artifact, or context boundary not covered by gates. |
| Validation or generation scripts | The target repository already has a script runner and the script produces deterministic checks or files. |

## Default Directory Strategy

Choose directories using the selected-environment research in `contracts/platform-compatibility.md`. Do not assume a platform from folder presence. The following is a logical map; actual paths and native formats are resolved in the target repository:

```text
<shared-root>/
  canonical/                       # complete filled copies; variants only for differing bindings
    agents/
    skills/
    instructions/
  knowledge-index.md
  templates/                       # shared schemas and artifact contracts
  agentic-system-manifest.md
  agentic-system.answers.yaml      # selected environments, per-role operations, and evidence
  preservation-plan.json
  sources/                         # hashed mirrors, excluded from native discovery
  .baseline/                       # pristine generated files by repository-relative path
  skill-changelogs/
<environment-native-roots>/         # discovered only for selected clients/versions
  <native-registrations>            # direct copies or minimal verified adapters
<session-root>/                     # shared contract; access only the current session
```

## Batch Rules

- Create the smallest batch that can run the workflow end to end.
- Create only the currently approved batch.
- Generate matching agents and skills from Canonical Template Mirrors in `templates/agents/` and `templates/skills/` when they exist.
- Keep every canonical copy exact outside declared placeholders and tooling slots; native registration follows `contracts/platform-compatibility.md`.
- Fill only approved Personalization Slots. A required non-slot rewrite is a source-contract gap and blocks platform adaptation.
- Strip source-only `CANONICAL-TEMPLATE-SLOT` marker comments from final generated runtime files after applying approved slot content.
- Record each generated mirror's source path, generated path, approved slot replacements, approved placeholder values, source-only marker stripping, and native-adapter loading evidence in the manifest.
- Keep root instructions short, navigational, and prompt-sensitive. Put full authority rules in agent contracts, route each request to the relevant schemas, knowledge-index entries, glossary, partials, and validation commands, and do not bulk-load repository facts or full role contracts into every request.
- Keep the context glossary focused on repository code/domain vocabulary, not broad docs or agent-system narration.
- Keep the knowledge index separate from the glossary. It routes knowledge loading by `When to read` triggers.
- Keep mirrored agent files as the complete runtime authority for their canonical body. Use partial files only for repo-specific extensions, optional mode guidance, or custom roles without mirrors.
- When a task depends on a shared rule or repo-specific extension partial, load that dependent partial too. Do not use selective loading to hide or omit mirrored constraints.
- Leave room for repo-specific roles, role extensions, or split templates when the repository has stable needs beyond the baseline Agentic System roles. Apply selective loading only to those non-mirrored additions.
- Start every generated agent from the baseline tool surface in `agent-role-contracts.md`; add only discovered or approved MCP tools that fit the role.
- Discover tools and delegation for each selected environment; preserve the required operations and report any unavailable capability.
- Copy or adapt templates into the target repository so future agents can cite repo-local paths.
- Add scripts only when they reduce repeated manual work and can be validated deterministically.
- Record every omitted role, skill, or script with a reason in the file plan.

## Generated-System Completeness Check

Before asking for approval or handing off, confirm:

- Root instructions name every generated agent, generated skill location, template directory, session root, glossary path when present, knowledge-index path, plan-schema path, agentic-system manifest path, and Bootstrap changelog snapshot path.
- Root instructions are prompt-sensitive and navigational, not a monolithic fact dump: they tell agents what to consult for the current request and avoid bulk-loading repository facts or full role contracts.
- The agentic-system manifest records the Bootstrap skill version used, the Bootstrap contract version applied through, the installed Bootstrap skill changelog path, the repo-local Bootstrap changelog snapshot path, and the generated system paths Maintainer needs for future changelog-delta audits.
- The answers file records every slot the generated system uses, how each value was settled, the resolved capability map, and the generated-path-to-baseline-path pairs.
- The baseline directory holds one pristine copy per generated file, so a later maintenance run can tell a repository customization apart from an untouched baseline without guessing.
- The manifest carries a customization register, and every deliberate deviation from the generated baseline has a row there before handoff.
- Each generated main agent file explains which non-mirrored extension partials, if any, are loaded selectively and which shared or cross-role dependency partials must also be loaded when relevant.
- Every generated agent declares the baseline tool surface from `agent-role-contracts.md` or records an approved reduction.
- Discovered MCP or platform integrations are assigned to the relevant agent or generated skill, or omitted with a reason.
- Generated files preserve Canonical Template Mirror bodies outside approved Personalization Slots, and final runtime files do not contain source-only slot marker comments.
- Manifest records generated, skipped, and deferred Canonical Template Mirror skills with reasons.
- Core System includes Ask alongside Planner, Implementor, Tester or Integration Tester, Knowledge Builder, and root instructions unless the user explicitly approved a narrower first install before generation.
- Planner references the glossary path when present, knowledge-index path, and plan-schema path explicitly, and defines the per-question clarification format itself rather than deferring to a second file.
- Implementor requires approved plan metadata before editing and validates the touched behavior after the first edit.
- Tester cannot modify production code unless the repo explicitly uses a combined implementation/testing role and the user approved that boundary.
- Knowledge Builder can create or refine the knowledge index and propose glossary terms without editing application code.
- Vision exists when visual evidence affects planning, implementation, review, or testing.
- Handoff envelope includes session ID, current gate, approval state, selected knowledge, open questions, blocking risks, and next-agent definition of done.
- Validation commands are named, or unavailable validation is reported with a reason.
