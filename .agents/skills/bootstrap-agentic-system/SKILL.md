---
name: bootstrap-agentic-system
description: "Use when: bootstrapping a repository-specific coding agentic system with custom agents, gates, hidden subagents, skills, artifacts, handoffs, bounded knowledge loading, or a prompt-to-skill conversion for agent workflows."
argument-hint: "Target repo, preferred agent platform, and any known workflow risks"
disable-model-invocation: true
---

# Bootstrap Agentic System

Use this skill to design and optionally install a custom coding agentic system for a repository.

## Mission

Create a small, durable agentic workflow that prevents the repository's likely costly failures. The output system should include persistent custom agents, explicit gates, bounded hidden subagents, reusable skills or prompts, session artifacts, handoff contracts, a context-glossary strategy, and a knowledge-loading strategy.

The generated system must include a Knowledge Builder agent. It is not optional: bootstrap proposals and file plans must create it in the first generated agent batch unless the user explicitly stops the bootstrap before generation.

Generated repo-local agents and skills must come from Canonical Template Mirrors when a matching mirror exists. A Canonical Template Mirror preserves the wording, gates, non-negotiable rules, tool frontmatter, delegated-agent frontmatter, and workflow structure of the public-safe canonical source. Bootstrap must generate from the mirror in copy-first mode: preserve every non-slot line and heading order, fill only approved Personalization Slots from target-repository evidence or user approval, apply approved inline placeholder values, and add only approved tool or integration entries. Final generated runtime files must not keep `CANONICAL-TEMPLATE-SLOT` marker comments; those markers remain in the source templates only. Record every slot decision and marker-stripping decision in the manifest so Maintainer can compare generated files back to their source mirrors. If the target repository suggests changing non-slot canonical wording, stop and ask the user before changing it.

Canonical Template Mirrors take precedence over older modularity, token-efficiency, and role-template guidance. Role-contract templates, partial instruction files, and repository-specific extensions may add guidance around a mirror, but they must not summarize, split, replace, reorder, weaken, or omit mirrored non-slot text unless the user explicitly approves the non-slot change.

Keep Bootstrap as one user-invokable orchestrator. Improve efficiency by splitting internal work into bounded scout lanes, decision records, templates, and audit checks; do not split the user-facing workflow into multiple public entrypoints unless a later repeatable workflow earns its own stable trigger and output.

When refactoring or maintaining this skill, preserve the current contract with a preservation matrix before changing generated behavior. Map every required behavior to its new home: boundary rules, required reference loads, Gate 0 through Gate 6 behavior, generated-system requirements, root instructions, Knowledge Builder mandate, Vision decision, tool-surface rules, tracker/session contract, context-glossary rules, template citations, validation checks, and final response requirements. No required behavior may disappear silently.

## Bootstrap Boundary

- Do not modify application code, database schema, migrations, runtime config, or product tests.
- Before writing files, produce a file plan and wait for explicit approval.
- Generated files must live in agent-system locations such as `.github/agents/`, `.github/skills/`, `.claude/agents/`, `docs/agents/`, or the platform equivalent.
- Every generated system must include a root `AGENTS.md` instruction file, or an explicit platform-equivalent root instruction file approved by the user. The root file orients future agents to the repo-local system, its gates, its agent/skill locations, the context glossary, and the knowledge index.
- Every generated system must include an agentic-system manifest, normally `docs/agents/agentic-system-manifest.md`, copied or adapted from `templates/agentic-system-manifest.md`. The manifest records the Bootstrap skill version used, the Bootstrap contract version applied through, the installed Bootstrap skill changelog path, the repo-local Bootstrap changelog snapshot path, generated system paths, and later maintenance history so Maintainer can compute future contract deltas.
- The installed Bootstrap skill `CHANGELOG.md` is a bootstrap-time provenance input only. Read it once to create the repo-local snapshot and manifest, then treat the manifest and repo-local snapshot as the durable repository evidence until a later Maintainer run refreshes them.
- Separate bootstrap behavior from generated-system behavior. A rule for the future Planner is not automatically a rule for this bootstrap run.
- Keep repository-specific recommendations separate from transferable principles.
- Do not create a `CONTEXT.md` just because it is missing. Create or update a context glossary only when stable repository code/domain terms, source-of-truth boundaries, module names, product concepts, data concepts, or role/artifact names have been resolved and need to persist. The context glossary is primarily for the target repo's code and domain vocabulary so future agents do not confuse concepts while working in the codebase. Agent-system terms may be included only as a short separate section when they clarify repo-local workflow names.
- Generated agents must preserve a deliberate tool surface. Start from the baseline VS Code tool lists in `templates/agent-role-contracts.md`, then add only repository-relevant MCP tools or platform integrations discovered in the target repository or approved by the user.
- Generated agents and skill templates must preserve existing baseline VS Code and custom-agent `tools:` and `agents:` frontmatter when the target platform supports it. Do not remove baseline tools or delegated-agent access unless the user explicitly approves the reduction. Add MCP or platform tools only by exact discovered or approved name, and record each addition in the tool and integration decision register.

## Bootstrap Execution Subagents

For non-trivial repositories, use bounded hidden subagents during bootstrap when the agent platform supports subagent delegation. Keep Bootstrap as the orchestrator and use subagents only to reduce context load and gather auditable evidence.

- Repository Workflow Scout: read-only discovery of agent platform signals, tracker/session model, repository code/domain vocabulary, knowledge sources, glossary terms, validation commands, and likely workflow risks.
- Contract Auditor: read-only comparison of the user's bootstrap request, this skill's required gates, selected templates, and the proposed or generated files.

The Repository Workflow Scout may be one subagent with lanes or multiple parallel read-only subagents. Use these lanes:

- Platform and Tooling: agent platform signals, customization folders, MCP configuration, tool allowlists, and platform constraints.
- Tracker and Session: issue tracker, local Markdown issue model, session roots, ID patterns, retrieval rules, and current-session-only restrictions.
- Knowledge and Glossary: `CONTEXT.md`, glossaries, ADRs, docs, source-of-truth boundaries, repeated repository code/domain vocabulary, competing terms, aliases, and near-synonyms.
- Visual Artifacts: screenshots, mockups, wireframes, diagrams, UI snapshots, image assets, issue attachments, browser screenshots, annotated QA evidence, and whether image evidence affects planning or testing.
- Validation Surface: package scripts, CI, lint/test commands, PR templates, review docs, and commands future agents should run.

Run subagents in parallel when the platform supports parallel delegation. Keep subagents read-only, give each a narrow input contract and evidence budget, and require compact findings with file paths, inferred facts, unknowns, and risks. Do not let subagents ask the user directly or write files. If subagents are unavailable, perform the same scout and auditor checks inline and report that delegation could not run.

Before Gate 4 file-plan approval for non-trivial repositories, run the Contract Auditor when subagent delegation is available. Require pass/fail findings for preservation of this skill's required behavior, template citations, role-contract baseline tools, approved MCP and platform-integration assignment reconciliation, tracker/session contract, glossary conflicts, glossary synonym normalization, Vision decision, root instruction strategy, and file-plan completeness. If subagents are unavailable, run the same checklist inline before requesting file-plan approval.

## Required Reference Loads

Load these templates when their output is needed:

- `templates/generated-system-blueprint.md` for the first-install file set, batch order, and repo-local directory strategy.
- `templates/bootstrap-file-plan.md` for the install proposal and approval gate.
- `templates/agents/` when drafting generated agent files that match Canonical Template Mirrors.
- `templates/skills/` when drafting generated skills that match Canonical Template Mirrors.
- `templates/agent-role-contracts.md` when confirming baseline tool surfaces, role boundaries, and generated platform conventions for mirrored agents, or when drafting role-specific Planner, Implementor, Tester, Knowledge Builder, Vision, Ask, or hidden auditor contracts that do not have a Canonical Template Mirror.
- `templates/agent-contracts.md` when drafting custom agent contracts that do not have a Canonical Template Mirror.
- `templates/agentic-system-manifest.md` when drafting the generated-system provenance ledger.
- `templates/artifact-gates.md` when designing artifacts, gates, and handoffs.
- `templates/knowledge-index-schema.md` when designing bounded knowledge loading.
- `templates/plan-schema.md` when drafting the generated Planner's implementation-plan artifact contract.
- `templates/question-schema.md` when drafting the generated Planner's clarification question contract.

If the target repo already has `CONTEXT.md`, read it as the repository code/domain glossary before proposing agent, gate, artifact, or skill names. Do not treat `CONTEXT.md` as a knowledge index or as permission to bulk-load repository docs. Do not rewrite it into an agent-system description; preserve or create repo vocabulary first, with agent-system vocabulary only in a clearly separate short section when needed.

Original source templates from this repository and this teaching skill:

- `templates/generated-system-blueprint.md` preserves the first-install system map for reuse in generated file plans.
- `templates/agents/` preserves public-safe Canonical Template Mirrors for Ask, Implementor, Integration Tester, Knowledge Builder, Planner, and Vision agents.
- `templates/skills/` preserves public-safe Canonical Template Mirrors for business-logic gap detection, integration-test knowledge checklist, bug planning, user-story planning, and user-story analysis skills.
- `templates/agentic-system-manifest.md` preserves the generated-system provenance ledger used by Maintainer for changelog-delta maintenance.
- `templates/agent-role-contracts.md` preserves role-specific contracts for the core generated agents.
- `templates/plan-schema.md` preserves the implementation-plan block for reuse in generated agent contracts.
- `templates/question-schema.md` preserves the clarification-question artifact and per-question chat shape for reuse in generated Planner contracts.
- `templates/knowledge-index-schema.md` preserves the knowledge-index shape for token-efficient knowledge selection before deep reading.
- If your target repository already has implementation-plan or clarification templates, adapt and reference those local equivalents.

### Knowledge-Index Citation Requirement

When the generated Planner selects repository knowledge:

- The generated Planner contract must explicitly name the knowledge-index file path it must read before selecting knowledge files.
- If a local equivalent is created, the generated Planner contract must explicitly state the file is derived from `templates/knowledge-index-schema.md`.
- The generated Planner must read the index first, match the task against `When to read` triggers, then load only the selected knowledge files.
- The generated Planner must not bulk-load all repository knowledge before selection.
- The generated Planner must record selected knowledge files and skipped relevant candidates in planning artifacts.
- Example language: "Read the generated knowledge index before loading knowledge files. Use `templates/knowledge-index-schema.md` as the source shape for that index."

### Plan-Schema.md Citation Requirement

When the generated Planner produces `implementation-plan.md` or references an implementation-plan template:

- The generated Planner contract must explicitly name the template file path it must use (e.g., `sessions/<id>/implementation-plan.md` or repo-local path).
- If a local equivalent is created, the generated Planner contract must explicitly state the file is derived from `templates/plan-schema.md`.
- The generated Planner must load the target repo's `templates/plan-schema.md` immediately before drafting or repairing an `implementation-plan.md` artifact.
- The generated Planner contract must state that plan-schema compliance overrides markdown diagnostics cleanup. If a linter flags schema-required links or inline anchors, report or waive the diagnostic instead of removing linked paths, anchors, or backlinks.
- Before requesting approval or handing work to an Implementor, the generated Planner must run a plan-schema adherence self-check: filesystem-tree path links, matching File Details anchors from the slug rule, backlinks to the tree, approval metadata, operations, validation commands, and risks/rollback must all be present.
- Do not use generic wording such as "using repo template" without a concrete file path and source attribution.
- Example language: "Produce `implementation-plan.md` using `templates/plan-schema.md`, or a copied local equivalent that explicitly states it is derived from `templates/plan-schema.md`."

### Question-Schema.md Citation Requirement

When the generated Planner asks blocking clarification questions or records clarification answers:

- The generated Planner contract must explicitly name the template file path it must use for clarification questions.
- If a local equivalent is created, the generated Planner contract must explicitly state the file is derived from `templates/question-schema.md`.
- The generated Planner contract must state that each blocking clarification shown in chat must use the template's `Per-Question Chat Shape`, not a compressed summary or ad hoc numbered reply list.
- The generated Planner must not request implementation-plan approval while unresolved blocking questions remain open.
- Do not use generic wording such as "using repo question template" without a concrete file path and source attribution.
- Example language: "Ask blocking clarification questions using `templates/question-schema.md`, or a copied local equivalent that explicitly states it is derived from `templates/question-schema.md`."

## Bootstrap Gates

### Gate 0: Scope Boundary

Confirm the task is agent-system design. Stop or ask for confirmation if the user asks for application feature work, database changes, or product tests.

### Gate 1: Repository Discovery

Inspect only workflow evidence:

- agent platform signals: `.github/agents/`, `.claude/agents/`, Cursor or Cline rules, Copilot customizations, MCP config
- issue/session signals: GitHub Issues, Jira, Linear, Azure DevOps, Notion, local `sessions/`, issue docs
- tool and integration signals: MCP server config, platform tool allowlists, issue-tracker integrations, documentation/context MCPs, design/image integrations, cloud/deployment integrations, and repository-specific tool restrictions
- knowledge signals: `CONTEXT.md`, glossaries, ADRs, `docs/`, architecture notes, domain docs, testing guides, contribution docs
- repository code/domain signals: package names, source tree names, module boundaries, public API names, route names, domain model names, config names, and terminology repeated across code and docs
- visual artifact signals: screenshots, mockups, wireframes, diagrams, design-review images, UI snapshots, image assets, browser screenshots, issue attachments, or QA evidence that must be interpreted before planning
- validation signals: package scripts, CI, lint/test commands, PR templates, review docs

Completion criterion: you can name the likely platform, baseline generated-agent tool surface, available MCP or platform integrations, tracker/session model, visual artifact needs, knowledge sources, and validation surface, or you can state which of those are unknown.

Organize discovery output by scout lane: Platform and Tooling, Tracker and Session, Knowledge and Glossary, Visual Artifacts, and Validation Surface. Each lane should report compact evidence, inferred facts, unknowns, and risks instead of broad repository summaries.

Before leaving this gate, produce a candidate tool and integration matrix for user review. The matrix must list:

- discovered MCPs, platform integrations, and built-in tool surfaces,
- candidate agents or skills that might receive each tool,
- reason each tool helps that role,
- risks from adding too much authority,
- tools intentionally omitted and why,
- unknown integrations that require user correction.

Do not treat the candidate matrix as approved. It is discovery output only.

### Gate 2: Clarification

Ask only questions that materially change the system design:

- target agent platform
- custom agent prefix name, or whether the bootstrap run should propose one
- output language
- issue tracker and session system; choose either a configured external tracker such as GitHub, Jira, Linear, Azure DevOps, or Notion, or a repository-local Markdown issue tracker with stable IDs
- available MCPs or platform integrations that should be added to generated agents, or named as adapters in generated work-item planning skills
- approval owner
- role boundaries
- mandatory artifacts
- acceptable gate cost
- whether the generated system should create or update a knowledge index in the first install batch
- whether the generated system should create or update a context glossary such as `CONTEXT.md` in the first install batch
- whether the generated system should use root `AGENTS.md` or an approved platform-equivalent root instruction file
- whether the repository workflow needs a Vision agent or visual-intake skill for screenshots, mockups, diagrams, UI snapshots, image assets, or image-based QA evidence
- how to resolve glossary conflicts when a proposed term, boundary, role name, artifact name, or workflow concept conflicts with an existing glossary definition
- whether tracker-backed planning should include optional intake skills for existing user stories and bugs
- whether tracker-backed workflows should include optional creation skills for new user-story tickets and bug tickets
- which Canonical Template Mirror skills should be generated, skipped, or deferred in the target repository
- local Markdown issue root, ID format, and lookup/index file when no external tracker is configured
- where Planner session folders should be stored
- whether the session path is internal to the destination repository or external
- how the generated agents will be restricted to reading only the current session folder

Convert clarification into a decision register before asking the user. Each decision must include the discovery evidence, recommendation, bounded choices, default or defer option when safe, and whether it blocks Gate 3. Hard blockers include target platform, tracker/session contract when ID-based planning is selected, root instruction strategy, tool and integration confirmation, glossary conflicts, synonymous or ambiguous glossary wording, and visual-artifact decision. Preserve the full clarification list above; the register changes presentation and sequencing, not the required decisions.

Always run a context-glossary intake before proposing files: scan repo wording from `CONTEXT.md`, README files, docs, contribution guides, source tree names, package names, module names, public API names, route names, domain model names, config names, tracker labels, role names, artifact names, and workflow terms. Summarize inferred repository code/domain vocabulary first, then agent-system vocabulary separately if needed. Ask the user to confirm, correct, or fill missing source-of-truth terms. If stable terms or boundaries cannot be inferred, propose candidate repo-code terms and ask bounded questions instead of silently skipping the glossary decision.

When the bootstrap run will create or update a context glossary such as `CONTEXT.md`, resolve synonymous, near-synonymous, or ambiguous wording before Gate 3. For each concept that could be named more than one way, ask the user to confirm the preferred term, terms to avoid, accepted aliases when they are truly needed, and distinctions from similar terms that must not be conflated. Do not create an empty or fake glossary just to document agent-system vocabulary; if no stable repository terms, boundaries, or ambiguous synonyms need persistence, record `Context Glossary: no change` with the reason.

Always ask a bounded visual-artifact question during clarification. If discovery found screenshots, mockups, diagrams, design-review images, UI snapshots, image assets, or image-based QA evidence, recommend adding a Vision agent. If no visual artifacts were found, ask whether such artifacts appear in the team's work anyway and record either the selected Vision agent, a smaller visual-intake skill, deferred support, or `Visual Artifacts: no change`.

Always ask the user to confirm the candidate tool and integration matrix before Gate 3. Use bounded choices for each proposed MCP or integration assignment: `add`, `omit`, `move to another agent or skill`, `recommend only`, or `needs more discovery`. Ask whether any available MCP or platform tool is missing from the matrix. Do not enter Gate 3 until the user confirms the tool and integration choices or explicitly defers them.

After confirmation, create an approved tool and integration decision register. The register must preserve each discovered or user-supplied MCP or integration by exact name, the user-selected choice, the target generated agent or skill, and the reason. Treat entries with choice `add` or `move to another agent or skill` as planned file changes, not recommendations. Later verification must compare this register to generated agent frontmatter or required-tool sections by exact tool name.

Always resolve the issue tracker before Gate 3. If no external tracker is configured, require a local Markdown issue tracker choice before planning generated ID-based work-item skills. The local Markdown tracker decision must name the issue root folder, ID format, and retrieval rule, such as direct path lookup by ID or an index file that maps IDs to Markdown files.

Use bounded options when possible. Do not request file-plan approval while blocking questions remain open.

### Gate 3: System Proposal

Produce a concise proposal with the required topics below. To keep review small, group them into these sections while preserving every topic:

- Failure Modes and Role Model: costly failure modes, instruction hierarchy, custom agent prefix, recommended modes, main agents, hidden subagents, and delegation rules.
- Artifacts and Gates: artifacts and gates, reusable skills or prompts, handoff envelope, and three one-week validation experiments.
- Knowledge, Glossary, and Visual Strategy: visual artifact strategy, context glossary rule, knowledge map, and post-bootstrap Knowledge Builder recommendations.
- File Batch and Tool Surface: generated-system blueprint, root instruction file strategy, agentic-system manifest strategy, generated tool surface and MCP assignment plan, file-generation plan, optional later batches, and post-bootstrap recommendations.

1. costly failure modes
2. instruction hierarchy
3. recommended custom agent prefix, or the requested prefix if already provided
4. recommended modes
5. generated-system blueprint, including first-install batch and optional later batches
6. user-invokable main agents
7. hidden subagents and delegation rules
8. artifacts and gates
9. reusable skills or prompts
10. visual artifact strategy
11. context glossary rule
12. knowledge map
13. handoff envelope
14. root instruction file strategy
15. agentic-system manifest strategy
16. generated tool surface and MCP assignment plan
17. file-generation plan
18. three one-week validation experiments
19. post-bootstrap recommendations

The visual artifact strategy must explicitly state whether the repo needs a Vision agent, a visual-intake skill, deferred support, or no visual support. Recommend a Vision agent when planning or review depends on screenshots, mockups, diagrams, UI snapshots, image assets, browser screenshots, annotated images, or image-based QA evidence. The Vision agent should convert image evidence into a deterministic text artifact that non-vision Planner, Implementor, and Tester agents can cite. If a Vision agent is not proposed, state why.

The context glossary rule must explicitly tell the user whether stable repository code/domain terms, source-of-truth boundaries, module names, product concepts, data concepts, role names, artifact names, workflow concepts, or ambiguous synonymous wording need a glossary. If they do, propose creating or editing `CONTEXT.md` or the target repo's equivalent in the file-generation plan. If they do not, state that no glossary edit is proposed and why. The glossary must not be mainly an agent-system explanation. If agent-system terms are needed, place them in a short separate section after the repo-code/domain vocabulary.

For each glossary-worthy concept with competing names, the proposal must include a terminology normalization decision: preferred term, terms to avoid, accepted aliases when needed, and distinctions from similar terms that future agents must not conflate. If the user has not resolved these decisions, ask bounded questions and do not request file-plan approval.

The root instruction file strategy must propose `AGENTS.md` at the repository root by default. Use a platform-equivalent root instruction file only when the target platform clearly requires it and the user approves that equivalent. The root file must point to generated agents, skills, templates, session rules, the context glossary path when one exists, and the knowledge-index path. It must not duplicate full agent contracts.

The agentic-system manifest strategy must propose a durable manifest path, normally `docs/agents/agentic-system-manifest.md`. It must also propose a repo-local Bootstrap changelog snapshot path, normally `docs/agents/skill-changelogs/bootstrap-agentic-system.CHANGELOG.md`. The manifest must record the Bootstrap skill version used, the Bootstrap contract version applied through, the installed Bootstrap skill changelog path, the repo-local snapshot path, generated root/agent/template/knowledge/session paths, and maintenance history. Use `templates/agentic-system-manifest.md` as the source shape. If the target repository already has an equivalent manifest or snapshot path, update them instead of creating duplicates and record the equivalent paths in the file plan.

The generated-system blueprint must use `templates/generated-system-blueprint.md` as the source shape. It must identify a staged batch plan and any optional later batches. Bootstrap must produce one master file plan and then ask for approval before each write batch. The staged batch order is: Core System, Vision Evidence when selected, Knowledge Builder Bootstrap, Skill Template Generation, and Contract Audit. Do not write all generated system files at once unless the user explicitly approves collapsing those batches.

The Core System batch should create root instructions, context glossary only when glossary-worthy terms are resolved, manifest, Bootstrap changelog snapshot, knowledge-index shell, repo-local plan/question/artifact templates, Planner, Implementor, Tester, Knowledge Builder, and Ask when selected. Do not generate Vision in the Core System batch.

The Vision Evidence batch runs only when the user selected Vision support. Ask for only relevant screenshots, mockups, diagrams, UI snapshots, image assets, browser screenshots, issue attachments, or QA images needed to configure the workflow. Generate Vision last among agents, and wire Planner-to-Vision handoff only after the visual-evidence strategy is known.

The Knowledge Builder Bootstrap batch should ask the user to run or use the generated Knowledge Builder to fill missing repository knowledge before skill generation. Create or update selected knowledge files and knowledge-index entries from evidence, while keeping the context glossary separate from the knowledge index.

The Skill Template Generation batch must present the full Canonical Template Mirror skill inventory, recommend defaults from repository evidence, and let the user choose `generate`, `skip`, or `defer` for each skill. Generate selected skills from `templates/skills/`, fill only approved Personalization Slots, and record every skill decision in the manifest.

The Contract Audit batch must verify preserved canonical wording outside approved slots, baseline tool surfaces plus exact approved MCP or platform tools, manifest records for generated/skipped/deferred files, and tracker/session/glossary/knowledge/visual decisions reflected in generated files.

The generated agent-file strategy must preserve Canonical Template Mirrors as the runtime authority when a mirror exists. Generate the mirrored agent or skill body in the main runtime file after applying approved slot replacements and stripping source-only slot marker comments. Use partial Markdown files only for repository-specific extensions, optional mode guidance, or custom roles that do not have a Canonical Template Mirror. Partial files must never replace mirrored non-slot content, and no mirrored gate or rule may move to a partial unless the user explicitly approves that non-slot relocation.

Selective loading is allowed only for non-mirrored additions. If a task depends on another role's guardrails, a shared repository rule, or a repo-specific extension partial, Bootstrap must require the generated contract to load that dependent partial too. The goal is relevance and token efficiency for additions, not omission of mirrored constraints.

Leave room for repository-specific roles, role extensions, or split templates when the target repository has durable needs beyond the baseline Agentic System roles. Apply the same case-by-case rule only to non-mirrored additions: keep always-needed repository-specific instructions in the main role or shared module when they are worth loading every time, and keep prompt-specific repository instructions in selective partials.

The generated tool surface and MCP assignment plan must:

- start from the exact baseline tools in `templates/agent-role-contracts.md` for Planner, Implementor, Tester, Knowledge Builder, Ask, and Vision,
- use only user-confirmed or explicitly deferred MCP and integration assignments from Gate 2,
- carry forward every Gate 2 decision-register entry with choice `add` or `move to another agent or skill` into the named generated agent's tool surface, using the exact approved MCP or integration tool name,
- add issue-tracker MCPs or platform integrations to Planner when the target workflow uses GitHub, Jira, Linear, Azure DevOps, Notion, or another tracker, and name the selected adapter in generated work-item planning skill bodies,
- use a repository-local Markdown issue tracker when no external tracker is configured, with an explicit ID lookup contract shared by Planner and generated work-item planning skills,
- add documentation, context, framework, or repository-knowledge MCPs to Planner, Knowledge Builder, and Ask when those tools help planning or knowledge selection,
- add design or image MCPs to Vision and Planner only when visual evidence affects the workflow,
- add cloud, deployment, test, or runtime MCPs to Implementor or Tester only when the approved repository workflow needs those capabilities,
- recommend installing a useful MCP only when the repository workflow clearly benefits and no equivalent configured tool exists,
- never invent MCP tool names that were not discovered or explicitly approved,
- record omitted discovered MCPs with the reason they do not belong in the generated agents.
- mark deferred tool choices as recommendations or open questions, not planned file changes.

If proposed glossary terms conflict with an existing glossary, do not silently choose one definition. List each conflict, show the existing meaning and proposed meaning, and ask the user how to resolve it using bounded options such as keep existing, replace existing, rename proposed term, split into two terms, or mark for later. Do not request file-plan approval while glossary conflicts remain unresolved.

The knowledge map must include an index-first loading strategy:

- keep context glossary usage separate from knowledge-index selection
- read an existing context glossary for stable vocabulary before naming roles, gates, artifacts, or skills
- create or reuse one knowledge index
- list knowledge files with `When to read` triggers
- require generated Planners to read the index first
- require generated Planners to load only selected files
- require generated Planners to record selected knowledge in artifacts
- forbid broad knowledge loading before task-specific selection

The first install batch should create or adapt the knowledge-index shape and obvious stable entries only when evidence supports them. Deep repository knowledge population should usually be delegated to the generated Knowledge Builder agent after bootstrap so Bootstrap does not bulk-load or over-summarize the target repository.

If repository discovery finds a ticketing or issue-tracking system, also propose optional tracker skills when useful:

- planning intake from existing user-story tickets
- planning intake from existing bug tickets
- creating new user-story tickets from clarified requirements
- creating new bug tickets from QA findings or bug reports

These tracker skills are not mandatory. Recommend them only when they reduce repeated manual intake, preserve tracker metadata, or prevent unclear work from entering planning.

Every generated Agentic System must have an issue tracker contract for ID-based work. The contract may use an external tracker adapter or a local Markdown issue tracker, but it must define how bug and user-story IDs resolve to source evidence before any `plan-bug-from-id` or `plan-user-story-from-id` skill is created.

When the target workflow plans from existing bug or user-story IDs, propose repository-local `plan-bug-from-id` and `plan-user-story-from-id` skills from `templates/skills/` during the Skill Template Generation batch. Treat the public `create-work-item-planning-skills` skill as a post-bootstrap add-on for future refinement or regeneration, not as the main initial creation path.

The proposal must require both generated skills to:

- accept a bug or user-story ID and derive a stable filesystem-safe session ID,
- create or resume one session folder before evidence gathering,
- persist source metadata, evidence, decisions, and the implementation plan in that session,
- use a selected tracker adapter when GitHub, Jira, or another issue system is configured,
- use a repository-local Markdown adapter when no external tracker is configured,
- define the local Markdown issue root, accepted ID pattern, lookup/index rule, required issue fields, and missing-ID behavior,
- make the session path and adapter explicit in the final handoff.
- invoke the generated planning skills only from the Planner agent; no other agent may invoke them.

The post-bootstrap recommendations section is always required. It must recommend running the generated Knowledge Builder agent to scan the repository, create or refine the knowledge index, suggest context-glossary terms from repository wording, and ask bounded questions for knowledge areas that cannot be inferred. It must also recommend the public `create-work-item-planning-skills` skill for creating repository-local `plan-bug-from-id` and `plan-user-story-from-id` skills, and the public `create-work-item-from-description` skill when the team creates new user-story or bug tickets from clarified work.

### Gate 4: File-Plan Approval

Use `templates/bootstrap-file-plan.md`. Mark approval false by default. Do not write files until the user explicitly approves the plan.
The file plan must record the chosen custom agent prefix and show it in proposed agent file names.
The file plan must include a Visual Artifacts section. If visual support is selected, include the proposed Vision agent or visual-intake skill file operation and the artifact path where extracted visual evidence will be saved. If visual support is deferred or out of scope, record the reason and the user's selected option.
The file plan must include a Context Glossary section. If glossary-worthy terms were identified, include the proposed `CONTEXT.md` creation or edit as a proposed file operation. If no glossary-worthy terms were identified, record `Context Glossary: no change` with the reason. If glossary conflicts were found, record the user's chosen resolution for each conflict before asking for approval. If synonymous, near-synonymous, or ambiguous wording was found, record the chosen preferred term, terms to avoid, accepted aliases when needed, and distinctions from similar terms before asking for approval.
The file plan must include a Root Instructions section. Include `AGENTS.md` as a proposed new or modified file unless the user approved a platform-equivalent root instruction file. If a platform-equivalent root file is used, record the approved path and why `AGENTS.md` is not being created.
The file plan must include an Agent Instruction Structure section. For every Canonical Template Mirror, record the source mirror path, generated path, approved slot replacements, approved placeholder values, source-only marker stripping, and any approved non-slot wording or relocation changes. For non-mirrored additions, record any partial-directory path, roles using prompt-specific partials, shared or cross-role dependency partials, repo-specific roles or split templates, and loading rules that preserve dependency completeness.
The file plan must include a Version Provenance section. Include a proposed agentic-system manifest file operation, a proposed repo-local Bootstrap changelog snapshot file operation, the installed Bootstrap skill changelog path, the Bootstrap skill version used, the Bootstrap contract version applied through, the Bootstrap snapshot source status, the Maintain skill version available, any installed Maintain skill changelog path, optional package changelog context, and concise bootstrap baseline notes. If the version or installed changelog source cannot be found, record the gap, state whether the baseline is being inferred from repository evidence, and ask whether to proceed before file-plan approval.
The file plan must include an MCP and Platform Integration Assignment section. It must copy the Gate 2 approved decision register, list the exact generated files that will receive each `add` or `move to another agent or skill` entry, and list omitted, deferred, or recommendation-only integrations with their approved reasons.
The file plan must include a Batch Approval Plan section. It must list Core System, Vision Evidence when selected, Knowledge Builder Bootstrap, Skill Template Generation, and Contract Audit as separate approval checkpoints, with proposed files, blocking decisions, and validation for each batch.
The file plan must include a Canonical Template Mirrors section. It must list the agent and skill mirrors used, the matching generated file path, approved Personalization Slots, and any proposed non-slot canonical wording change. Non-slot wording changes require explicit user approval before generation.
The file plan must include a Canonical Skill Inventory section. It must list every skill mirror under `templates/skills/`, the recommendation from repository evidence, the user choice (`generate`, `skip`, or `defer`), and the manifest record that will be written for that choice.
For non-trivial repositories, the file plan must include a Contract Auditor section or inline audit result before approval. The audit must state whether required Bootstrap behavior was preserved and whether any required contract element is missing, moved, strengthened, deferred, or intentionally unchanged.

### Gate 5: Generation

After approval, create only the currently approved batch. Prefer Canonical Template Mirrors, repo-local templates, and short role contracts over broad narrative docs.

**Canonical Template Mirror Requirement:**

- Generate matching agents and skills from `templates/agents/` and `templates/skills/` when a mirror exists.
- Preserve the mirror's non-slot canonical wording, gates, non-negotiable rules, baseline tool frontmatter, delegated-agent frontmatter, and workflow structure in the main generated runtime file.
- Fill only approved Personalization Slots from target-repository evidence or explicit user approval.
- Use inline placeholders such as `{{VISION_AGENT_NAME}}` for small values in source mirrors, and non-nested block markers such as `<!-- CANONICAL-TEMPLATE-SLOT: SESSION_ACTIVATION START -->` / `<!-- CANONICAL-TEMPLATE-SLOT: SESSION_ACTIVATION END -->` for larger repo-dependent assumptions in source mirrors.
- Strip `CANONICAL-TEMPLATE-SLOT` marker comments from final generated runtime files after applying approved slot content. Do not leave template-maintenance markers in generated agents or skills.
- Treat block-slot content as canonical fallback that may be replaced by target-repository evidence.
- Do not silently paraphrase, reorder, or weaken the Preserved Canonical Body.
- Do not move mirrored non-slot content into partial files unless the user explicitly approves that non-slot relocation.
- If repository evidence requires changing non-slot wording, pause generation for that file and request explicit approval for the wording change.
- Record generated, skipped, and deferred mirror decisions in the manifest, including source mirror path, generated path, approved slot replacements, approved placeholder values, source-only marker stripping, and any approved non-slot wording or relocation changes.

**Root Instruction File Requirement:**

- Create or update root `AGENTS.md` unless the approved file plan names a platform-equivalent root instruction file.
- The root instruction file must briefly explain the repo-local Agentic System entrypoints and must link or name the generated Planner, Implementor, Tester, and Knowledge Builder contracts.
- The root instruction file must name the context-glossary path when one exists and describe it as repository code/domain vocabulary, not as a knowledge index.
- The root instruction file must name the knowledge-index path and require agents to use index-first loading before reading knowledge files.
- The root instruction file must name the agentic-system manifest path and state that Maintainer uses it with the repo-local Bootstrap changelog snapshot and the currently installed Bootstrap skill `CHANGELOG.md` to detect Bootstrap contract deltas.
- The root instruction file must name any generated partial-instruction directory or equivalent routing rule when non-mirrored extensions use partials. It must state that Canonical Template Mirror bodies live in the main generated runtime files, while partials are additive extensions only.
- The root instruction file must summarize approval gates, session storage rules, validation expectations, and where to find generated skills or templates.
- Do not duplicate full agent contracts in `AGENTS.md`; keep it as the stable entrypoint and navigation layer.

**Generated-System Blueprint Requirement:**

- Before writing generated files, load `templates/generated-system-blueprint.md` and use it to decide the first install batch, optional later batches, session path strategy, generated template paths, and role file names.
- Before writing generated files, load `templates/agentic-system-manifest.md` and use it to create or update the repo-local manifest named in the approved file plan.
- Keep the generated structure tailored to the target repository and selected platform, but preserve the blueprint's separation between root instructions, user-invokable agents, hidden agents, skills, templates, knowledge index, context glossary, session artifacts, and validation.
- Prefer templates over generated scripts unless the target repository already has a clear script runner and the script will perform deterministic validation or repeatable file generation that users would otherwise run manually.
- If a script is proposed, include its command, owner, expected output, and validation in the file plan before asking for approval.

**Role Contract Template Requirement:**

- Before drafting generated agent contracts, load `templates/agent-role-contracts.md` to confirm baseline tool surfaces, role boundaries, and generated platform conventions.
- When a Canonical Template Mirror exists, use the mirror as the generated contract source of truth. Use `templates/agent-role-contracts.md` only to check baseline tools, delegated agents, and role boundaries, not to replace, summarize, rename, or remove mirrored gates or rules.
- When no Canonical Template Mirror exists, adapt the role-specific shapes from `templates/agent-role-contracts.md`.
- Generated Planner, Implementor, Tester, and Knowledge Builder contracts must have explicit role boundaries, non-negotiable rules, numbered gates, artifact outputs, validation expectations, and handoff obligations.
- Generated Ask and Vision agents are optional, but when selected they must also stay within their authority boundaries.
- Generated hidden subagents, including a Contract Auditor when available, must be read-only unless the approved file plan explicitly gives them a narrow write artifact.
- Prompt-scoped partials are allowed only for non-mirrored additions or custom roles unless the user explicitly approves relocating mirrored non-slot content.

**Generated Tool Surface Requirement:**

- Every generated agent contract must include a deliberate `tools:` frontmatter list when the target platform supports tool frontmatter. If the platform does not support tool frontmatter, create a `Required Tools` section near the top of the generated agent contract.
- Every generated agent contract must include the baseline `agents:` frontmatter list from `templates/agent-role-contracts.md` when the target platform supports delegated-agent frontmatter and the role has baseline delegated agents. If the platform does not support `agents:` frontmatter, create a `Delegated Agents` section near the top of the generated agent contract.
- Use the exact baseline tool lists from `templates/agent-role-contracts.md` before adding repository-specific integrations.
- Preserve delegated-agent entries such as `agent` for Planner and Tester, and add the generated Vision agent to Planner only when Vision support is selected and named in the file plan.
- Do not reduce the baseline tool list unless the target platform lacks the tool or the user explicitly approves a smaller authority surface. Record every reduction in the file plan.
- Do not reduce or remove baseline delegated-agent access unless the target platform lacks delegated agents or the user explicitly approves the smaller delegation surface. Record every reduction in the file plan.
- Do not add broad wildcard MCP access by default. Prefer named MCP tools or named integration capability groups tied to the agent's role.
- Planner gets repository planning, session, read, ask, bounded search, artifact write, optional subagent, tracker, and context/documentation integrations.
- Implementor gets edit, terminal, diagnostics, focused search, artifact write, and implementation-specific integrations approved by the plan.
- Tester gets ask, terminal, diagnostics, read, focused search, artifact write, and test-specific integrations approved by the plan.
- Knowledge Builder gets ask, read, focused search, artifact write, and knowledge/documentation/context integrations.
- Ask gets ask, read, focused search, and optional knowledge/documentation/context integrations, but no edit tools.
- Vision gets visual input tools when available and artifact write tools; non-vision agents must consume Vision artifacts instead of raw images.
- Contract Auditor and scout subagents stay read-only unless the approved file plan grants a narrow artifact write.
- Generated `plan-bug-from-id` and `plan-user-story-from-id` skills must not include skill-level `tools:` frontmatter. They must state the selected tracker adapter or local Markdown adapter in the skill body and use inline `#tool:agent/runSubagent` work-item gathering instructions.
- `plan-bug-from-id` must include: `use #tool:agent/runSubagent to delegate work item gathering to a built-in agent subagent.`
- `plan-user-story-from-id` must include: `use #tool:agent/runSubagent to delegate work item gathering to a default subagent (leave argument args.agentName empty).`

**Context Glossary Creation Requirement:**

- If the target repository has a `CONTEXT.md` or equivalent glossary, preserve it as the vocabulary source for repository code/domain terms and then generated agent, gate, artifact, and skill names.
- If the approved file plan includes new stable repo-code terms, domain terms, module boundaries, product concepts, data concepts, or source-of-truth boundaries and no glossary exists, create `CONTEXT.md` as a short glossary with term definitions and terms to avoid.
- If the approved file plan includes synonymous, near-synonymous, or ambiguous wording for the same concept, create or update the glossary so it records the preferred term, terms to avoid, accepted aliases when needed, and distinctions from similar terms that must not be conflated.
- If no stable vocabulary was resolved during bootstrap, do not create `CONTEXT.md`; record the no-op in the file plan.
- Document the glossary path explicitly in the generated Planner contract when one exists.
- State that the context glossary is for stable repository vocabulary, not for broad docs, implementation instructions, or knowledge-file selection. The Planner must still use the knowledge index for bounded knowledge loading.
- Do not make `CONTEXT.md` mainly about the Agentic System. If repo-local agent-system vocabulary is needed, place it after the repo code/domain glossary in a short section named `Agentic System Terms` or equivalent.

**Knowledge-Index Template Creation Requirement:**

- If the target repository has no knowledge index, create one during generation using this skill's `templates/knowledge-index-schema.md` as the source shape.
- If the target repository already has a knowledge index, verify that it contains knowledge file paths, `When to read` triggers, token-budget guidance, and artifact-recording rules.
- Document the knowledge-index location explicitly in the generated Planner agent contract so the Planner knows what to read before selecting knowledge files.
- Example: In the generated Planner's `.md` or `.agent.md` file, include: "Read `<knowledge-index-path>` before loading any repository knowledge files. Load only files whose `When to read` triggers match the planning task."

**Agentic-System Manifest Creation Requirement:**

- Create or update the manifest path named in the approved file plan, normally `docs/agents/agentic-system-manifest.md`, using `templates/agentic-system-manifest.md` as the source shape.
- Read the installed Bootstrap skill `CHANGELOG.md` and copy it to the repo-local Bootstrap changelog snapshot path named in the approved file plan, normally `docs/agents/skill-changelogs/bootstrap-agentic-system.CHANGELOG.md`, when that installed skill changelog is available.
- Fill `Bootstrap Skill Version Used`, `Bootstrap Contract Applied Through`, `Bootstrap Snapshot Source Status`, and `Maintain Skill Version Last Applied` from the installed skill-local changelogs when available. If the installed Bootstrap skill changelog is unavailable, infer the best available baseline from repository evidence and record `Bootstrap Snapshot Source Status` as `inferred from repo evidence` or `unknown`.
- Record the installed changelog paths used so Maintainer knows which ledgers were the source of truth during generation.
- Record generated root instruction, context glossary, knowledge index, schema template, agent directory, skill directory, and session-root paths.
- Do not use the manifest or repo-local snapshot as substitutes for direct repository inspection; they are maintenance aids, and Maintainer must still verify whether the current repo files already satisfy later release requirements.

**Plan-Schema Template Creation Requirement:**

- If `templates/plan-schema.md` does not exist in the target repository, create it during generation using the source template from this skill's `templates/plan-schema.md`.
- If `templates/plan-schema.md` already exists in the target repository, verify that it contains the core sections: approval block, filesystem tree, file details, operations, validation, and risks.
- Document the location of `templates/plan-schema.md` explicitly in the generated Planner agent contract so the Planner knows where to reference it for implementation-plan.md output.
- Example: In the generated Planner's `.md` or `.agent.md` file, include: "Use `templates/plan-schema.md` as the source template when producing implementation-plan.md artifacts."

**Question-Schema Template Creation Requirement:**

- If `templates/question-schema.md` does not exist in the target repository, create it during generation using the source template from this skill's `templates/question-schema.md`.
- If `templates/question-schema.md` already exists in the target repository, verify that it contains the core sections: clarification table, answers table, per-question chat shape, answer choices, and approval-blocking rule.
- Document the location of `templates/question-schema.md` explicitly in the generated Planner agent contract so the Planner knows where to reference it for blocking clarification questions and answer records.
- Example: In the generated Planner's `.md` or `.agent.md` file, include: "Use `templates/question-schema.md` as the source template when asking blocking clarification questions and recording answers. Present each blocking clarification in chat using the template's `Per-Question Chat Shape`; do not collapse it into an open-question summary or an ad hoc numbered reply list."

**Vision Agent Creation Requirement:**

- If the approved file plan selects Vision support, create a Vision agent contract or approved visual-intake skill only in the approved Vision Evidence batch.
- The Vision agent must accept image evidence such as screenshots, mockups, wireframes, diagrams, UI snapshots, browser screenshots, issue attachments, or annotated QA images.
- The Vision agent must output a deterministic text artifact in the session, such as SlimUI, structured Markdown, or another approved repo-local format.
- The Vision agent must preserve visible reviewer annotations separately from the underlying UI or diagram content.
- Planner, Implementor, and Tester contracts must reference the visual artifact instead of asking non-vision agents to infer from raw images.
- If Vision support is deferred or out of scope, record that no-op in the file plan and final response.

**Skill Template Generation Requirement:**

- Before generating repository-local skills, load `templates/skills/` and present the full canonical skill inventory for user choice.
- Recommend which skills to generate from repository evidence, but let the user select `generate`, `skip`, or `defer` for every skill.
- Generate selected skills from their Canonical Template Mirrors, filling only approved Personalization Slots.
- Record every generated, skipped, and deferred skill decision in the manifest.
- Keep `create-work-item-planning-skills` as an optional post-bootstrap add-on for future refinement.

### Gate 6: Validation

Validate frontmatter, markdown diagnostics, and internal links where tooling is available. Report any validation that could not run.

**Context Glossary Validation:**

- If the file plan includes a context glossary, verify that it exists at the expected path and defines stable repository code/domain terms or boundaries rather than broad narrative documentation.
- If the file plan includes synonym or ambiguity normalization, verify that the glossary records preferred terms, terms to avoid, accepted aliases when needed, and distinctions from similar terms that future agents must not conflate.
- Verify that `CONTEXT.md` or the repo glossary is not mainly about the generated Agentic System. Agent-system terms must be secondary and clearly separated from repo code/domain terms.
- Verify that the generated Planner contract references the glossary path before instructions that name roles, gates, artifacts, or skills.
- Verify that the generated Planner contract keeps glossary reading separate from knowledge-index selection and forbids treating the glossary as a replacement for the knowledge index.
- If the file plan intentionally omits a context glossary, confirm that the no-op is recorded.

**Root Instruction File Validation:**

- Verify that root `AGENTS.md` exists, or that the approved platform-equivalent root instruction path exists and the file plan records why `AGENTS.md` was not created.
- Verify that the root instruction file names the generated Planner, Implementor, Tester, and Knowledge Builder contracts.
- Verify that it names the context-glossary path when one exists and describes it as repository code/domain vocabulary.
- Verify that it names the knowledge-index path and requires index-first knowledge loading.
- Verify that it names the agentic-system manifest path and describes it as version provenance for maintenance.
- Verify that it names the partial-instruction directory or equivalent loading rule when generated agent files are modularized, including always-loaded guidance and shared dependency loading rules when present.
- Verify that it summarizes approval gates, session storage rules, validation expectations, and generated skill or template locations without duplicating full contracts.

**Agentic-System Manifest Validation:**

- Verify that the manifest path named in the file plan exists.
- Verify that the manifest records `Bootstrap Skill Version Used`, `Bootstrap Contract Applied Through`, the installed Bootstrap skill changelog path, the repo-local Bootstrap changelog snapshot path, generated system paths, and maintenance history.
- Verify that the root instruction file references the manifest path.
- Verify that `Bootstrap Contract Applied Through` is not newer than the current version recorded in the installed Bootstrap skill `CHANGELOG.md` when that file is available.

**Knowledge-Index Validation:**

- Verify that the generated knowledge index exists at the expected path when the file plan includes repository knowledge.
- Verify that the index contains required sections: purpose, token budget rule, knowledge entries, `When to read` triggers, selection workflow, and artifact record.
- Verify that the generated Planner agent contract explicitly references the knowledge-index path before any instruction to load knowledge files.
- Verify that the generated Planner contract forbids bulk-loading all knowledge before index selection.
- Report the file path and validation status in the final response.

**Agent Instruction Structure Validation:**

- Verify that every generated agent or skill with a Canonical Template Mirror preserves non-slot canonical wording, gates, non-negotiable rules, baseline tool frontmatter, delegated-agent frontmatter, and workflow structure in the main generated runtime file unless the file plan records explicit approval for a non-slot wording or relocation change.
- Verify that final generated runtime files do not contain `CANONICAL-TEMPLATE-SLOT` marker comments.
- Verify that the manifest records each generated mirror's source path, generated path, approved slot replacements, approved placeholder values, source-only marker stripping, and any approved non-slot wording or relocation changes.
- Verify that prompt-specific partial files, when present, contain only non-mirrored additions or approved relocations and are placed in the approved partial directory or equivalent platform path.
- Verify that the main generated agent contracts state when to load any shared or cross-role dependency modules used by non-mirrored additions.
- Verify that repo-specific roles, role extensions, or split templates are included when discovery found durable repository-specific needs.

**Plan-Schema Template Validation:**

- Verify that `templates/plan-schema.md` exists at the expected path.
- Verify that the file contains required sections: approval block, filesystem tree, file details, operations timeline, validation commands, and risks/rollback.
- Verify that the generated Planner agent contract explicitly references `templates/plan-schema.md` by path (not generic wording like "repo template").
- Verify that the generated Planner contract treats plan-schema adherence as higher priority than markdown diagnostics cleanup, especially for linked filesystem-tree paths, File Details anchors, and backlinks.
- If the template exists but was not created by this bootstrap run, confirm it contains equivalent structure to the source template.
- Report the file path and validation status in the final response.

**Implementation-Plan Artifact Validation:**

- When the bootstrap run creates a Planner example, sample, or active `implementation-plan.md`, verify the artifact itself against `templates/plan-schema.md` before approval or handoff.
- Verify that every Filesystem Tree path is a markdown link to a matching File Details anchor generated with the schema slug rule.
- Verify that every File Details entry includes a matching anchor and a backlink to the Filesystem Tree.
- Verify that markdown cleanup did not replace schema-required links with code spans or remove inline anchors. Treat this drift as a blocking validation failure even when it reduces diagnostics.
- If markdown tooling flags schema-required inline HTML, report or waive that diagnostic explicitly after schema validation passes.

**Question-Schema Template Validation:**

- Verify that `templates/question-schema.md` exists at the expected path.
- Verify that the file contains required sections: clarification table, answers table, per-question chat shape, answer choices, and approval-blocking rule.
- Verify that the generated Planner agent contract explicitly references `templates/question-schema.md` by path (not generic wording like "repo question template").
- If the template exists but was not created by this bootstrap run, confirm it contains equivalent structure to the source template.
- Report the file path and validation status in the final response.

**Vision Agent Validation:**

- If the file plan selects Vision support, verify that the generated Vision agent or visual-intake skill exists at the expected path.
- Verify that it accepts image evidence and writes a deterministic text artifact to the session.
- Verify that it preserves reviewer annotations separately from underlying UI, diagram, or screenshot content.
- Verify that Planner, Implementor, or Tester handoffs reference the produced visual artifact instead of requiring non-vision agents to inspect raw images.
- If the file plan intentionally omits Vision support, confirm that the no-op is recorded.

**Generated Tool Surface Validation:**

- Verify every generated agent has the baseline tools required by `templates/agent-role-contracts.md`, unless the file plan records an approved reduction.
- Verify every generated agent has the baseline `agents:` frontmatter required by `templates/agent-role-contracts.md`, unless the file plan records an approved reduction or the platform does not support delegated-agent frontmatter.
- Verify generated agents and skills that come from Canonical Template Mirrors preserve baseline VS Code/custom-agent tool guidance and delegated-agent access outside approved Personalization Slots.
- Verify every Gate 2 decision-register entry with choice `add` or `move to another agent or skill` appears by exact MCP or integration tool name in the approved target generated agent's frontmatter, or in its required-tool section when the platform cannot express tool frontmatter. Treat a missing approved MCP assignment as a blocking validation failure.
- Verify every omitted, deferred, or recommendation-only MCP decision is absent from generated agent tool surfaces unless the user later approved adding it, and that the approved reason is recorded.
- Verify discovered MCPs or platform integrations are assigned only to agents or generated skills that need them.
- Verify tracker MCPs or tracker adapters are assigned to Planner when ID-based planning is selected, and that generated work-item planning skills name the selected adapter in their bodies.
- Verify the issue tracker contract exists and names either the external tracker adapter or the local Markdown issue root, ID format, lookup/index rule, required fields, and missing-ID behavior.
- Verify context, documentation, or framework MCPs are assigned to Planner, Knowledge Builder, or Ask when available and relevant.
- Verify omitted MCPs are recorded with reasons.
- Verify generated `plan-bug-from-id` and `plan-user-story-from-id` skills do not include `tools:` frontmatter and do include the required inline `#tool:agent/runSubagent` work-item gathering instructions.

**Final Bootstrap Contract Validation:**

Before final response, compare the approved file plan, the user's stated requirements, this skill's required outputs, and the generated files. Treat missing required contract elements as blocking validation failures unless the user explicitly approved their omission.

Required final checks:

- Every approved file operation was completed, skipped with an approved reason, or reported as blocked.
- Root `AGENTS.md` exists, or an approved platform-equivalent root instruction file exists and the approved reason for not creating `AGENTS.md` is recorded.
- Required generated agents exist, including Planner, Implementor, Tester, and Knowledge Builder.
- Required generated agents with Canonical Template Mirrors were generated from those mirrors in copy-first mode; required generated agents without mirrors were drafted from `templates/agent-role-contracts.md` or an approved local equivalent, with repo-specific gate additions and removals recorded.
- Required generated agents include the baseline tool surfaces from `templates/agent-role-contracts.md`, plus every Gate 2 approved repository-specific MCP or platform integration assigned to that agent by exact tool name.
- Required generated agents preserve baseline `agents:` frontmatter from `templates/agent-role-contracts.md`, including delegated `agent` access for Planner and Tester when supported.
- The generated first-install batch follows `templates/generated-system-blueprint.md` or records approved deviations.
- Generation followed the approved staged batch plan, or the user explicitly approved any collapsed batch.
- Every generated agent or skill with a Canonical Template Mirror preserves non-slot canonical wording in the main generated runtime file unless the file plan records explicit approval for a wording or relocation change, and final generated runtime files contain no `CANONICAL-TEMPLATE-SLOT` marker comments.
- The generated manifest follows `templates/agentic-system-manifest.md`, records the Bootstrap contract version applied through, records the repo-local Bootstrap changelog snapshot path, and is referenced by root instructions.
- The visual-artifact decision is reflected in generated files or recorded as an intentional no-op; when selected, the Vision agent or visual-intake skill exists and produces a session artifact.
- The generated Knowledge Builder contract requires repository scanning, knowledge-index creation or refinement, context-glossary term suggestions, and bounded questions for missing knowledge areas.
- The generated Planner contract references the context-glossary path when one exists, the knowledge-index path, `templates/plan-schema.md`, and `templates/question-schema.md` by explicit path.
- The generated Planner contract forbids bulk-loading repository knowledge before index selection.
- The context-glossary decision from the file plan is reflected in generated files or recorded as an intentional no-op, any generated glossary is primarily about repository code/domain vocabulary rather than the Agentic System, and any required synonym or ambiguity normalization is present.
- Post-bootstrap recommendations include running Knowledge Builder, `create-work-item-planning-skills`, and `create-work-item-from-description`.
- Generated work-item planning skills include the selected tracker or local Markdown adapter, issue ID retrieval contract, no `tools:` frontmatter, and the required inline `#tool:agent/runSubagent` gathering instructions.
- The manifest records each canonical skill mirror as generated, skipped, or deferred with the user's reason.
- Validation commands from the proposal were run where available, or each skipped command has a reason.

If the Contract Auditor subagent is available, run it after generation with the final file list and require it to report pass/fail for these checks. If not, run the checklist inline.

## Generated System Requirements

The generated system must have these properties.

### Main Agents

Create persistent, user-invokable custom agents for role boundaries that change authority:

- Agent naming: before generation, either ask for a custom agent prefix or propose one derived from repository language. Apply the chosen prefix consistently to generated user-invokable and hidden custom agent names so they do not collide with generic names from other repositories.

- Planner: clarifies requirements and produces approved artifacts. **Must reference the generated context-glossary path when one exists, the generated knowledge-index path, `templates/plan-schema.md`, and `templates/question-schema.md` by path in its contract; read the context glossary for repository code/domain vocabulary, source-of-truth terms, and naming boundaries before defining roles, gates, artifacts, or skills; read the knowledge index before loading knowledge files; produce implementation-plan.md files using the plan schema; preserve schema-required links, anchors, and backlinks even when markdown diagnostics object; and ask blocking clarification questions using the question schema.**
- Implementor: modifies code only from an approved plan.
- Tester: creates or runs test strategy for approved work.
- Knowledge Builder: scans repository knowledge surfaces, proposes or updates the knowledge index, extracts stable repository code/domain vocabulary candidates for the context glossary, and asks bounded questions when the repo does not reveal what knowledge is needed. **Must be generated in the first agent batch. Must keep `CONTEXT.md` or the repo glossary separate from the knowledge index. Must keep repo code/domain vocabulary primary and agent-system vocabulary secondary. Must recommend concrete knowledge entries with `When to read` triggers rather than bulk-loading docs.**
- Vision: converts screenshots, mockups, wireframes, diagrams, UI snapshots, image assets, browser screenshots, issue attachments, and annotated QA images into deterministic text artifacts for non-vision agents. Generate this agent when visual evidence materially affects planning, implementation, review, or testing. If the repo does not use visual artifacts, record `Vision: no change` with the reason.

Use `templates/agent-role-contracts.md` to confirm baseline tool surfaces and strong role boundaries for mirrored agents, and to draft agents only when no Canonical Template Mirror exists. Add the Ask shape only when the repository benefits from a Q&A-only agent that cannot implement. Add the Vision shape only when visual evidence is part of the workflow.

When `templates/agents/` contains a matching Canonical Template Mirror, start from that mirror rather than drafting from summary shapes alone. Use `templates/agent-role-contracts.md` to confirm baseline tool surfaces, role boundaries, and generated platform conventions, not to replace preserved canonical wording.

Review is a required capability, not a mandatory default agent. Add a dedicated reviewer agent only when repository discovery shows that review has its own authority boundary, context boundary, or durable output contract. Otherwise, represent review through gates, validation commands, human review, PR review surfaces, or maintenance checks.

Optional user-invokable agents are useful when the work can happen outside feature planning and does not duplicate the required agents: Ask, Issue Intake, Visual Intake. Prefer a Vision agent over a vague Visual Intake role when the output must be a reusable image-to-text artifact consumed by non-vision agents.

If the target repository uses a ticketing or issue-tracking system, consider optional user-invokable skills or prompts instead of main agents when the workflow is repeatable but narrow:

- Plan from existing user-story ticket
- Plan from existing bug ticket
- Create `plan-user-story-from-id` and `plan-bug-from-id` through `create-work-item-planning-skills`
- Create work items through `create-work-item-from-description` when ticket creation is needed
- Create user-story ticket
- Create bug ticket

Keep tracker integration optional, but treat session creation and persistence as mandatory for generated ID-based planning skills. Work-item creation must not create a planning session. During bootstrap clarification, ask whether the generated work-item planning skills belong in the first install batch, a later batch, or out of scope. Always record `create-work-item-planning-skills` and `create-work-item-from-description` in the final post-bootstrap recommendations, even when they are not selected for the current file batch.

### Gates Inside Main Agents

For custom agents without Canonical Template Mirrors, main agents should include gates only where the repository's real workflow risk changes. Evaluate each candidate, then remove, add, rename, or merge gates so the contract fits the target repo. For generated agents with Canonical Template Mirrors, preserve mirrored gates exactly outside approved Personalization Slots or explicit user-approved non-slot changes.

**Gate Numbering and Labeling Requirement:**

- Every gate must be labeled and numbered using the format `Gate <n>: <gate name>` (e.g., `Gate 0: Scope Intake`, `Gate 1: Clarification`).
- Do not use unnumbered gates or omit the word "Gate" from the label.
- Gates must be numbered sequentially starting from 0 or 1 depending on repo convention, but the number and label must always be explicit.

Candidate gates to evaluate:

- scope intake gate
- clarification resolved gate
- selected-knowledge/rule-inventory gate
- bounded codebase-discovery gate
- implementation-plan approval gate
- handoff completeness gate
- focused-validation gate
- review readiness gate

For each accepted gate, define trigger, pass condition, fail condition, approving or waiving owner, artifact record, and rollback path. For each rejected candidate, briefly state why it is unnecessary for this repo.

### Hidden Subagents

Use hidden subagents when a main agent needs specialist work with smaller, cleaner context.

Hidden subagent rules:

- `user-invocable: false`
- minimal tools
- single purpose
- clear input contract
- compact output format
- no direct user questions unless explicitly designed for intake
- no broad repository tours
- optional `model:` only when the exact local model name is verified

Good hidden subagents include context scouts, issue fetchers, visual normalizers, requirements analysts, and task builders. The main agent should pass only the excerpt, selected knowledge references, candidate paths or terms, exact question, and evidence budget.

### Skills

Package repeatable procedures as skills when the workflow has a stable trigger and output. Candidate skills: requirements analysis, task decomposition, implementation planning, test strategy, review checklist, artifact workflow, knowledge selection, evidence intake.

When a ticketing or issue-tracking system is present, also evaluate optional tracker skills:

- intake from an existing user-story ticket into the Planner's session artifacts
- intake from an existing bug ticket into the Planner's session artifacts
- creation of a user-story ticket from clarified requirements, acceptance criteria, and scope notes
- creation of a bug ticket from reproducible behavior, expected behavior, impact, evidence, and affected surface

For ID-based planning, prefer one generator skill, `create-work-item-planning-skills`, that creates both `plan-bug-from-id` and `plan-user-story-from-id` with the same session interface and different evidence gates. Do not generate either skill without the session interface.

Both generated skills must be Planner-only and must never be invoked by other agents.

Do not make tracker skills mandatory. Include them only when the team repeatedly moves work between chat, artifacts, and tickets.

During Bootstrap, propose all Canonical Template Mirror skills under `templates/skills/`, recommend defaults from repository evidence, and let the user choose which skills are generated, skipped, or deferred. Use `create-work-item-planning-skills` after Bootstrap only when the team wants to refine or regenerate work-item planning skills.

### Knowledge Loading

Generated planners must load knowledge deliberately:

1. read the generated knowledge index first
2. match the planning task against `When to read` triggers
3. select only knowledge files whose triggers match the task
4. do not bulk-load old knowledge, stale knowledge, or every knowledge file before selection
5. extract a rule inventory from selected files only
6. record selected knowledge files, skipped candidates, and selection rationale in artifacts
7. cluster likely codebase surface before deep reading
8. use hidden context scouts for bounded evidence questions
9. align the plan against selected rules before approval
10. **load and verify `templates/knowledge-index-schema.md` exists** before creating or updating a knowledge index; reference the generated knowledge-index path explicitly in the Planner contract
11. **load and verify `templates/plan-schema.md` exists** before producing or repairing implementation-plan.md artifacts; reference the file path explicitly in the Planner contract and in any generated implementation-plan output; run a final schema-adherence self-check before approval or handoff
12. **load and verify `templates/question-schema.md` exists** before asking blocking clarification questions; reference the file path explicitly in the Planner contract and in clarification artifacts

## Final Response Shape

Before writing files, end with the unapproved file plan and ask for explicit approval.

After writing files, report changed files, validations, and remaining risks.

Always include post-bootstrap recommendations after generation:

- Run the generated Knowledge Builder agent to scan the repository, build or refine the knowledge index, propose glossary updates from repository wording, and ask the user for missing knowledge boundaries.
- Run `create-work-item-planning-skills` when the team wants `plan-bug-from-id` and `plan-user-story-from-id` skills.
- Run `create-work-item-from-description` when the team wants repeatable creation of user-story or bug tickets from clarified work.
