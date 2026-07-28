# bootstrap-agentic-system Changelog

Install-safe release history for the `bootstrap-agentic-system` skill. Bootstrap reads this file once during setup to capture the initial local baseline in the target repository. Maintainer later compares the repo-local snapshot against the currently installed copy of this file, then confirms any gap against actual repository files.

## Current Version

- `1.19.0`

## 2026-07-28

### 1.19.0

- Required Bootstrap to collect one evidence-backed decision at a time and keep recommendations separate from approvals, including user-controlled batch composition and checkpoints.
- Required generated tracker/session contracts to distinguish External Issue ID from Planning Session ID, isolate current-issue retrieval and session access, record explicit-reference dependencies, and resume directly by known session ID.
- Required generated Planner and work-item skills to ask clarification only for genuine blocking uncertainty and otherwise complete all mandatory artifacts and plans uninterrupted.

## 2026-07-27

### 1.18.2

- Refined root-instruction, file-plan, and generated-system templates so schema paths, manifest provenance, prompt-sensitive routing, and non-monolithic root instructions are explicit in supporting artifacts.

### 1.18.1

- Required Bootstrap to copy `templates/plan-schema.md` and `templates/question-schema.md` into the approved repo-local schema paths unless an approved stronger equivalent is recorded.
- Clarified that generated root instructions must stay prompt-sensitive and navigational instead of becoming a monolithic fact dump or duplicated agent-contract bundle.

### 1.18.0

- Rewrote the public Bootstrap skill around the generated-template source model and a phase-based workflow from intake through maintenance handoff.
- Made enriched Canonical Template Mirrors the primary generated-runtime source, with Bootstrap responsible for placeholder fill, marker stripping, schema-path verification, contract audit, and manifest evidence.
- Added explicit handling for string-valued `tools:` entries, including replacing `"{{APPROVED_MCP_TOOLS}}"` with exact approved quoted tool names or removing it when no additional tools are approved.

### 1.17.0

- Made Canonical Template Mirror generation copy-first and authoritative over older modularity or role-template guidance.
- Required final generated runtime agents and skills to strip source-only `CANONICAL-TEMPLATE-SLOT` marker comments while recording slot decisions in the manifest.
- Limited prompt-scoped partials and role-contract template adaptation to non-mirrored additions unless the user explicitly approves relocating mirrored non-slot content.

### 1.16.0

- Added inline and block Personalization Slot syntax for repo-dependent template assumptions.
- Added allowlisted Personalization Slots to canonical agent and skill mirrors while preserving non-slot canonical wording.
- Updated mirror validation to accept approved inline placeholders and non-nested block slots while rejecting unknown or malformed slot markers.

### 1.15.0

- Added Canonical Template Mirrors for generated agents and skills, requiring Bootstrap to preserve non-slot canonical wording while filling only approved personalization slots.
- Changed Bootstrap generation to use staged batch approvals for Core System, Vision Evidence, Knowledge Builder Bootstrap, Skill Template Generation, and Contract Audit.
- Required Bootstrap to present the full canonical skill template inventory and record each skill as generated, skipped, or deferred.

### 1.14.1

- Refined modular agent generation so always-needed core guidance can remain in the main role contract when warranted.
- Required generated agents to load shared or cross-role dependency partials and repo-specific role extensions when the current prompt depends on them.

### 1.14.0

- Required Bootstrap to generate thin main Markdown agent contracts plus prompt-scoped partial instruction files, so generated systems load only the instruction fragments relevant to the current prompt.
- Added file-plan, blueprint, and validation requirements for modular agent instruction loading.

### 1.13.1

- Simplified the manifest so the repo-local Bootstrap changelog snapshot carries release history while the manifest carries only current applied-through state, paths, and maintenance history.

### 1.13.0

- Added an install-safe skill-local `CHANGELOG.md` inside the Bootstrap skill folder.
- Required Bootstrap to read this file once during setup, copy it into the generated repository as a local snapshot, and record the installed changelog path plus snapshot path in the manifest.
- Clarified that Maintainer should compare the repo-local snapshot against the current installed Bootstrap changelog, then confirm any gap against the actual repository files before proposing updates.

### 1.12.0

- Required generated systems to include an agentic-system manifest recording the Bootstrap skill version used, the Bootstrap contract applied-through version, changelog provenance, generated system paths, applied Bootstrap changelog entries, and maintenance history.
- Added a manifest template and Version Provenance file-plan section for future maintenance.

### 1.11.3

- Required generated Planner contracts to present blocking clarification questions in chat using the question schema's per-question chat shape, not only record that schema in artifacts.

### 1.11.2

- Added blocking verification that every MCP or platform integration approved during Bootstrap clarification is carried into the named generated agent tool surface by exact tool name.

### 1.11.1

- Required generated `plan-bug-from-id` and `plan-user-story-from-id` skills to omit skill-level `tools:` frontmatter and use inline `#tool:agent/runSubagent` gathering instructions instead.

### 1.11.0

- Kept Bootstrap as one public orchestrator while structuring repository discovery into bounded scout lanes and Gate 2 clarification into a decision register.
- Required non-trivial Bootstrap runs to audit preservation of the current contract before file-plan approval when subagents are available, with an inline equivalent when unavailable.
- Required context glossaries created or updated by Bootstrap to normalize synonymous or ambiguous repository wording with preferred terms, terms to avoid, accepted aliases, and distinctions.

### 1.10.0

- Required generated Planner and Tester contracts to preserve baseline `agents:` frontmatter when delegated agents are supported.
- Required Bootstrap to resolve an issue tracker contract before planning ID-based bug or user-story skills, using either an external tracker adapter or a local Markdown issue tracker.

### 1.9.1

- Required Bootstrap to present discovered MCP and tool assignments for user confirmation before entering system proposal planning.
- Added bounded choices to add, omit, move, recommend only, or investigate more for each candidate MCP or integration.

### 1.9.0

- Required generated agents to start from explicit baseline VS Code tool lists and record approved reductions.
- Added repository MCP discovery and role-based assignment rules for tracker, documentation, context, visual, cloud, runtime, and test integrations.

## 2026-07-26

### 1.8.0

- Added generated-system blueprint and role-contract templates so Bootstrap can install Planner, Implementor, Tester, Knowledge Builder, Vision, Ask, and hidden auditor contracts with stronger public-safe structure.
- Required Bootstrap proposals and generated files to use the blueprint and role-specific templates, including first-install batch decisions, role boundaries, numbered gates, artifacts, validation, and handoff obligations.

### 1.7.0

- Added mandatory visual-artifact clarification during bootstrap discovery and proposal.
- Required a Vision agent or visual-intake skill when screenshots, mockups, diagrams, UI snapshots, image assets, or image-based QA evidence materially affect the workflow.

### 1.6.0

- Clarified that generated `CONTEXT.md` files must be primarily about repository code/domain vocabulary, with agent-system terms only as a separated secondary section when needed.
- Required generated systems to include root `AGENTS.md` by default, or an approved platform-equivalent root instruction file.

### 1.5.0

- Added bounded bootstrap execution subagents for repository workflow discovery and contract auditing when supported by the agent platform.
- Added final bootstrap contract validation to compare generated files against the approved file plan, user requirements, and required skill outputs before final response.

### 1.4.0

- Made the generated Knowledge Builder agent mandatory in the first bootstrap agent batch.
- Required stronger context-glossary intake from repository wording before file-plan approval.
- Added mandatory post-bootstrap recommendations to run Knowledge Builder and propose work-item planning and creation skills.

## 2026-07-24

### 1.3.2

- Split session clarification into explicit questions about storage location, internal versus external placement, and current-session-only access.

### 1.3.1

- Clarified that Planner sessions are configured during bootstrap, isolated to the current session, and required for Planner-only ID-based planning skills.

### 1.3.0

- Added a final post-bootstrap proposal for `create-work-item-planning-skills`, including mandatory safe session persistence for generated bug and user-story planning skills.

### 1.2.2

- Required bootstrap proposals to surface glossary conflicts and ask the user how to resolve them before file-plan approval.

### 1.2.1

- Required bootstrap proposals and file plans to explicitly offer `CONTEXT.md` creation or edits when stable terms or source-of-truth boundaries need a glossary.

### 1.2.0

- Added context-glossary guidance so generated systems can use `CONTEXT.md` for stable vocabulary and source-of-truth boundaries without confusing it with knowledge-index loading.

### 1.1.1

- Enforced implementation-plan schema adherence in generated Planner contracts, including linked filesystem-tree paths, File Details anchors, backlinks, and schema-over-lint validation behavior.

### 1.1.0

- Added stricter generated-system requirements for knowledge-index, plan-schema, and question-schema template references.
- Added optional tracker-backed intake and ticket-creation guidance for repositories with issue-tracking workflows.
