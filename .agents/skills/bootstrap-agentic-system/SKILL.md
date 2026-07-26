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

## Bootstrap Boundary

- Do not modify application code, database schema, migrations, runtime config, or product tests.
- Before writing files, produce a file plan and wait for explicit approval.
- Generated files must live in agent-system locations such as `.github/agents/`, `.github/skills/`, `.claude/agents/`, `docs/agents/`, or the platform equivalent.
- Every generated system must include a root `AGENTS.md` instruction file, or an explicit platform-equivalent root instruction file approved by the user. The root file orients future agents to the repo-local system, its gates, its agent/skill locations, the context glossary, and the knowledge index.
- Separate bootstrap behavior from generated-system behavior. A rule for the future Planner is not automatically a rule for this bootstrap run.
- Keep repository-specific recommendations separate from transferable principles.
- Do not create a `CONTEXT.md` just because it is missing. Create or update a context glossary only when stable repository code/domain terms, source-of-truth boundaries, module names, product concepts, data concepts, or role/artifact names have been resolved and need to persist. The context glossary is primarily for the target repo's code and domain vocabulary so future agents do not confuse concepts while working in the codebase. Agent-system terms may be included only as a short separate section when they clarify repo-local workflow names.

## Bootstrap Execution Subagents

For non-trivial repositories, use two bounded hidden subagents during bootstrap when the agent platform supports subagent delegation:

- Repository Workflow Scout: read-only discovery of agent platform signals, tracker/session model, repository code/domain vocabulary, knowledge sources, glossary terms, validation commands, and likely workflow risks.
- Contract Auditor: read-only comparison of the user's bootstrap request, this skill's required gates, selected templates, and the proposed or generated files.

Run these subagents in parallel when the platform supports parallel delegation. Keep both subagents read-only, give each a narrow input contract and evidence budget, and require compact findings with file paths, inferred facts, unknowns, and risks. Do not let subagents ask the user directly or write files. If subagents are unavailable, perform the same scout and auditor checks inline and report that delegation could not run.

## Required Reference Loads

Load these templates when their output is needed:

- `templates/generated-system-blueprint.md` for the first-install file set, batch order, and repo-local directory strategy.
- `templates/bootstrap-file-plan.md` for the install proposal and approval gate.
- `templates/agent-role-contracts.md` when drafting role-specific Planner, Implementor, Tester, Knowledge Builder, Vision, Ask, or hidden auditor contracts.
- `templates/agent-contracts.md` when drafting custom agent contracts.
- `templates/artifact-gates.md` when designing artifacts, gates, and handoffs.
- `templates/knowledge-index-schema.md` when designing bounded knowledge loading.
- `templates/plan-schema.md` when drafting the generated Planner's implementation-plan artifact contract.
- `templates/question-schema.md` when drafting the generated Planner's clarification question contract.

If the target repo already has `CONTEXT.md`, read it as the repository code/domain glossary before proposing agent, gate, artifact, or skill names. Do not treat `CONTEXT.md` as a knowledge index or as permission to bulk-load repository docs. Do not rewrite it into an agent-system description; preserve or create repo vocabulary first, with agent-system vocabulary only in a clearly separate short section when needed.

Original source templates from this repository and this teaching skill:

- `templates/generated-system-blueprint.md` preserves the first-install system map for reuse in generated file plans.
- `templates/agent-role-contracts.md` preserves role-specific contracts for the core generated agents.
- `templates/plan-schema.md` preserves the implementation-plan block for reuse in generated agent contracts.
- `templates/question-schema.md` preserves the clarification-question artifact and per-question chat block for reuse in generated Planner contracts.
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
- knowledge signals: `CONTEXT.md`, glossaries, ADRs, `docs/`, architecture notes, domain docs, testing guides, contribution docs
- repository code/domain signals: package names, source tree names, module boundaries, public API names, route names, domain model names, config names, and terminology repeated across code and docs
- visual artifact signals: screenshots, mockups, wireframes, diagrams, design-review images, UI snapshots, image assets, browser screenshots, issue attachments, or QA evidence that must be interpreted before planning
- validation signals: package scripts, CI, lint/test commands, PR templates, review docs

Completion criterion: you can name the likely platform, tracker/session model, visual artifact needs, knowledge sources, and validation surface, or you can state which of those are unknown.

### Gate 2: Clarification

Ask only questions that materially change the system design:

- target agent platform
- custom agent prefix name, or whether the bootstrap run should propose one
- output language
- issue/session system
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
- where Planner session folders should be stored
- whether the session path is internal to the destination repository or external
- how the generated agents will be restricted to reading only the current session folder

Always run a context-glossary intake before proposing files: scan repo wording from `CONTEXT.md`, README files, docs, contribution guides, source tree names, package names, module names, public API names, route names, domain model names, config names, tracker labels, role names, artifact names, and workflow terms. Summarize inferred repository code/domain vocabulary first, then agent-system vocabulary separately if needed. Ask the user to confirm, correct, or fill missing source-of-truth terms. If stable terms or boundaries cannot be inferred, propose candidate repo-code terms and ask bounded questions instead of silently skipping the glossary decision.

Always ask a bounded visual-artifact question during clarification. If discovery found screenshots, mockups, diagrams, design-review images, UI snapshots, image assets, or image-based QA evidence, recommend adding a Vision agent. If no visual artifacts were found, ask whether such artifacts appear in the team's work anyway and record either the selected Vision agent, a smaller visual-intake skill, deferred support, or `Visual Artifacts: no change`.

Use bounded options when possible. Do not request file-plan approval while blocking questions remain open.

### Gate 3: System Proposal

Produce a concise proposal with:

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
15. file-generation plan
16. three one-week validation experiments
17. post-bootstrap recommendations

The visual artifact strategy must explicitly state whether the repo needs a Vision agent, a visual-intake skill, deferred support, or no visual support. Recommend a Vision agent when planning or review depends on screenshots, mockups, diagrams, UI snapshots, image assets, browser screenshots, annotated images, or image-based QA evidence. The Vision agent should convert image evidence into a deterministic text artifact that non-vision Planner, Implementor, and Tester agents can cite. If a Vision agent is not proposed, state why.

The context glossary rule must explicitly tell the user whether stable repository code/domain terms, source-of-truth boundaries, module names, product concepts, data concepts, role names, artifact names, or workflow concepts need a glossary. If they do, propose creating or editing `CONTEXT.md` or the target repo's equivalent in the file-generation plan. If they do not, state that no glossary edit is proposed and why. The glossary must not be mainly an agent-system explanation. If agent-system terms are needed, place them in a short separate section after the repo-code/domain vocabulary.

The root instruction file strategy must propose `AGENTS.md` at the repository root by default. Use a platform-equivalent root instruction file only when the target platform clearly requires it and the user approves that equivalent. The root file must point to generated agents, skills, templates, session rules, the context glossary path when one exists, and the knowledge-index path. It must not duplicate full agent contracts.

The generated-system blueprint must use `templates/generated-system-blueprint.md` as the source shape. It must identify the first coherent install batch and any optional later batches. The first batch should normally include root instructions, Planner, Implementor, Tester, Knowledge Builder, knowledge index, plan schema, question schema, artifact/handoff rules, and Vision when visual support was selected. Ask and tracker/work-item skills may be first-batch only when the repo workflow clearly needs them immediately.

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

If repository discovery finds a ticketing or issue-tracking system, also propose optional tracker skills when useful:

- planning intake from existing user-story tickets
- planning intake from existing bug tickets
- creating new user-story tickets from clarified requirements
- creating new bug tickets from QA findings or bug reports

These tracker skills are not mandatory. Recommend them only when they reduce repeated manual intake, preserve tracker metadata, or prevent unclear work from entering planning.

When the target workflow plans from existing bug or user-story IDs, propose the public `create-work-item-planning-skills` skill as the final bootstrap extension. It creates the repository-local `plan-bug-from-id` and `plan-user-story-from-id` skills rather than embedding vendor-specific intake logic in the bootstrap skill.

The proposal must require both generated skills to:

- accept a bug or user-story ID and derive a stable filesystem-safe session ID,
- create or resume one session folder before evidence gathering,
- persist source metadata, evidence, decisions, and the implementation plan in that session,
- use a selected tracker adapter when GitHub, Jira, or another issue system is configured,
- use a repository-local Markdown adapter when no tracker is configured,
- make the session path and adapter explicit in the final handoff.
- invoke the generated planning skills only from the Planner agent; no other agent may invoke them.

The post-bootstrap recommendations section is always required. It must recommend running the generated Knowledge Builder agent to scan the repository, create or refine the knowledge index, suggest context-glossary terms from repository wording, and ask bounded questions for knowledge areas that cannot be inferred. It must also recommend the public `create-work-item-planning-skills` skill for creating repository-local `plan-bug-from-id` and `plan-user-story-from-id` skills, and the public `create-work-item-from-description` skill when the team creates new user-story or bug tickets from clarified work.

### Gate 4: File-Plan Approval

Use `templates/bootstrap-file-plan.md`. Mark approval false by default. Do not write files until the user explicitly approves the plan.
The file plan must record the chosen custom agent prefix and show it in proposed agent file names.
The file plan must include a Visual Artifacts section. If visual support is selected, include the proposed Vision agent or visual-intake skill file operation and the artifact path where extracted visual evidence will be saved. If visual support is deferred or out of scope, record the reason and the user's selected option.
The file plan must include a Context Glossary section. If glossary-worthy terms were identified, include the proposed `CONTEXT.md` creation or edit as a proposed file operation. If no glossary-worthy terms were identified, record `Context Glossary: no change` with the reason. If glossary conflicts were found, record the user's chosen resolution for each conflict before asking for approval.
The file plan must include a Root Instructions section. Include `AGENTS.md` as a proposed new or modified file unless the user approved a platform-equivalent root instruction file. If a platform-equivalent root file is used, record the approved path and why `AGENTS.md` is not being created.

### Gate 5: Generation

After approval, create the smallest coherent file batch. Prefer templates and short role contracts over broad narrative docs.

**Root Instruction File Requirement:**

- Create or update root `AGENTS.md` unless the approved file plan names a platform-equivalent root instruction file.
- The root instruction file must briefly explain the repo-local Agentic System entrypoints and must link or name the generated Planner, Implementor, Tester, and Knowledge Builder contracts.
- The root instruction file must name the context-glossary path when one exists and describe it as repository code/domain vocabulary, not as a knowledge index.
- The root instruction file must name the knowledge-index path and require agents to use index-first loading before reading knowledge files.
- The root instruction file must summarize approval gates, session storage rules, validation expectations, and where to find generated skills or templates.
- Do not duplicate full agent contracts in `AGENTS.md`; keep it as the stable entrypoint and navigation layer.

**Generated-System Blueprint Requirement:**

- Before writing generated files, load `templates/generated-system-blueprint.md` and use it to decide the first install batch, optional later batches, session path strategy, generated template paths, and role file names.
- Keep the generated structure tailored to the target repository and selected platform, but preserve the blueprint's separation between root instructions, user-invokable agents, hidden agents, skills, templates, knowledge index, context glossary, session artifacts, and validation.
- Prefer templates over generated scripts unless the target repository already has a clear script runner and the script will perform deterministic validation or repeatable file generation that users would otherwise run manually.
- If a script is proposed, include its command, owner, expected output, and validation in the file plan before asking for approval.

**Role Contract Template Requirement:**

- Before drafting generated agent contracts, load `templates/agent-role-contracts.md` and adapt its role-specific shapes.
- Generated Planner, Implementor, Tester, and Knowledge Builder contracts must have explicit role boundaries, non-negotiable rules, numbered gates, artifact outputs, validation expectations, and handoff obligations.
- Generated Ask and Vision agents are optional, but when selected they must also follow the role contract template and stay within their authority boundaries.
- Generated hidden subagents, including a Contract Auditor when available, must be read-only unless the approved file plan explicitly gives them a narrow write artifact.
- Do not copy role templates blindly. Remove gates that do not prevent a target-repo failure mode, and record why high-cost gates were omitted.

**Context Glossary Creation Requirement:**

- If the target repository has a `CONTEXT.md` or equivalent glossary, preserve it as the vocabulary source for repository code/domain terms and then generated agent, gate, artifact, and skill names.
- If the approved file plan includes new stable repo-code terms, domain terms, module boundaries, product concepts, data concepts, or source-of-truth boundaries and no glossary exists, create `CONTEXT.md` as a short glossary with term definitions and terms to avoid.
- If no stable vocabulary was resolved during bootstrap, do not create `CONTEXT.md`; record the no-op in the file plan.
- Document the glossary path explicitly in the generated Planner contract when one exists.
- State that the context glossary is for stable repository vocabulary, not for broad docs, implementation instructions, or knowledge-file selection. The Planner must still use the knowledge index for bounded knowledge loading.
- Do not make `CONTEXT.md` mainly about the Agentic System. If repo-local agent-system vocabulary is needed, place it after the repo code/domain glossary in a short section named `Agentic System Terms` or equivalent.

**Knowledge-Index Template Creation Requirement:**

- If the target repository has no knowledge index, create one during generation using this skill's `templates/knowledge-index-schema.md` as the source shape.
- If the target repository already has a knowledge index, verify that it contains knowledge file paths, `When to read` triggers, token-budget guidance, and artifact-recording rules.
- Document the knowledge-index location explicitly in the generated Planner agent contract so the Planner knows what to read before selecting knowledge files.
- Example: In the generated Planner's `.md` or `.agent.md` file, include: "Read `<knowledge-index-path>` before loading any repository knowledge files. Load only files whose `When to read` triggers match the planning task."

**Plan-Schema Template Creation Requirement:**

- If `templates/plan-schema.md` does not exist in the target repository, create it during generation using the source template from this skill's `templates/plan-schema.md`.
- If `templates/plan-schema.md` already exists in the target repository, verify that it contains the core sections: approval block, filesystem tree, file details, operations, validation, and risks.
- Document the location of `templates/plan-schema.md` explicitly in the generated Planner agent contract so the Planner knows where to reference it for implementation-plan.md output.
- Example: In the generated Planner's `.md` or `.agent.md` file, include: "Use `templates/plan-schema.md` as the source template when producing implementation-plan.md artifacts."

**Question-Schema Template Creation Requirement:**

- If `templates/question-schema.md` does not exist in the target repository, create it during generation using the source template from this skill's `templates/question-schema.md`.
- If `templates/question-schema.md` already exists in the target repository, verify that it contains the core sections: clarification table, answers table, per-question chat block, answer choices, and approval-blocking rule.
- Document the location of `templates/question-schema.md` explicitly in the generated Planner agent contract so the Planner knows where to reference it for blocking clarification questions and answer records.
- Example: In the generated Planner's `.md` or `.agent.md` file, include: "Use `templates/question-schema.md` as the source template when asking blocking clarification questions and recording answers."

**Vision Agent Creation Requirement:**

- If the approved file plan selects Vision support, create a Vision agent contract or approved visual-intake skill in the first file batch.
- The Vision agent must accept image evidence such as screenshots, mockups, wireframes, diagrams, UI snapshots, browser screenshots, issue attachments, or annotated QA images.
- The Vision agent must output a deterministic text artifact in the session, such as SlimUI, structured Markdown, or another approved repo-local format.
- The Vision agent must preserve visible reviewer annotations separately from the underlying UI or diagram content.
- Planner, Implementor, and Tester contracts must reference the visual artifact instead of asking non-vision agents to infer from raw images.
- If Vision support is deferred or out of scope, record that no-op in the file plan and final response.

### Gate 6: Validation

Validate frontmatter, markdown diagnostics, and internal links where tooling is available. Report any validation that could not run.

**Context Glossary Validation:**

- If the file plan includes a context glossary, verify that it exists at the expected path and defines stable repository code/domain terms or boundaries rather than broad narrative documentation.
- Verify that `CONTEXT.md` or the repo glossary is not mainly about the generated Agentic System. Agent-system terms must be secondary and clearly separated from repo code/domain terms.
- Verify that the generated Planner contract references the glossary path before instructions that name roles, gates, artifacts, or skills.
- Verify that the generated Planner contract keeps glossary reading separate from knowledge-index selection and forbids treating the glossary as a replacement for the knowledge index.
- If the file plan intentionally omits a context glossary, confirm that the no-op is recorded.

**Root Instruction File Validation:**

- Verify that root `AGENTS.md` exists, or that the approved platform-equivalent root instruction path exists and the file plan records why `AGENTS.md` was not created.
- Verify that the root instruction file names the generated Planner, Implementor, Tester, and Knowledge Builder contracts.
- Verify that it names the context-glossary path when one exists and describes it as repository code/domain vocabulary.
- Verify that it names the knowledge-index path and requires index-first knowledge loading.
- Verify that it summarizes approval gates, session storage rules, validation expectations, and generated skill or template locations without duplicating full contracts.

**Knowledge-Index Validation:**

- Verify that the generated knowledge index exists at the expected path when the file plan includes repository knowledge.
- Verify that the index contains required sections: purpose, token budget rule, knowledge entries, `When to read` triggers, selection workflow, and artifact record.
- Verify that the generated Planner agent contract explicitly references the knowledge-index path before any instruction to load knowledge files.
- Verify that the generated Planner contract forbids bulk-loading all knowledge before index selection.
- Report the file path and validation status in the final response.

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
- Verify that the file contains required sections: clarification table, answers table, per-question chat block, answer choices, and approval-blocking rule.
- Verify that the generated Planner agent contract explicitly references `templates/question-schema.md` by path (not generic wording like "repo question template").
- If the template exists but was not created by this bootstrap run, confirm it contains equivalent structure to the source template.
- Report the file path and validation status in the final response.

**Vision Agent Validation:**

- If the file plan selects Vision support, verify that the generated Vision agent or visual-intake skill exists at the expected path.
- Verify that it accepts image evidence and writes a deterministic text artifact to the session.
- Verify that it preserves reviewer annotations separately from underlying UI, diagram, or screenshot content.
- Verify that Planner, Implementor, or Tester handoffs reference the produced visual artifact instead of requiring non-vision agents to inspect raw images.
- If the file plan intentionally omits Vision support, confirm that the no-op is recorded.

**Final Bootstrap Contract Validation:**

Before final response, compare the approved file plan, the user's stated requirements, this skill's required outputs, and the generated files. Treat missing required contract elements as blocking validation failures unless the user explicitly approved their omission.

Required final checks:

- Every approved file operation was completed, skipped with an approved reason, or reported as blocked.
- Root `AGENTS.md` exists, or an approved platform-equivalent root instruction file exists and the approved reason for not creating `AGENTS.md` is recorded.
- Required generated agents exist, including Planner, Implementor, Tester, and Knowledge Builder.
- Required generated agents were drafted from `templates/agent-role-contracts.md` or an approved local equivalent, with repo-specific gate additions and removals recorded.
- The generated first-install batch follows `templates/generated-system-blueprint.md` or records approved deviations.
- The visual-artifact decision is reflected in generated files or recorded as an intentional no-op; when selected, the Vision agent or visual-intake skill exists and produces a session artifact.
- The generated Knowledge Builder contract requires repository scanning, knowledge-index creation or refinement, context-glossary term suggestions, and bounded questions for missing knowledge areas.
- The generated Planner contract references the context-glossary path when one exists, the knowledge-index path, `templates/plan-schema.md`, and `templates/question-schema.md` by explicit path.
- The generated Planner contract forbids bulk-loading repository knowledge before index selection.
- The context-glossary decision from the file plan is reflected in generated files or recorded as an intentional no-op, and any generated glossary is primarily about repository code/domain vocabulary rather than the Agentic System.
- Post-bootstrap recommendations include running Knowledge Builder, `create-work-item-planning-skills`, and `create-work-item-from-description`.
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

Use `templates/agent-role-contracts.md` to draft these agents so the generated system preserves strong role boundaries instead of producing generic assistant personas. At minimum, adapt the Planner, Implementor, Tester, and Knowledge Builder shapes. Add the Ask shape only when the repository benefits from a Q&A-only agent that cannot implement. Add the Vision shape only when visual evidence is part of the workflow.

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

Main agents should include gates only where the repository's real workflow risk changes. Do not copy this gate list blindly. Evaluate each candidate, then remove, add, rename, or merge gates so the contract fits the target repo.

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
