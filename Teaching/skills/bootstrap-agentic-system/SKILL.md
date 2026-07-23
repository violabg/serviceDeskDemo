---
name: bootstrap-agentic-system
description: "Use when: bootstrapping a repository-specific coding agentic system with custom agents, gates, hidden subagents, skills, artifacts, handoffs, bounded knowledge loading, or a prompt-to-skill conversion for agent workflows."
argument-hint: "Target repo, preferred agent platform, and any known workflow risks"
disable-model-invocation: true
---

# Bootstrap Agentic System

Use this skill to design and optionally install a custom coding agentic system for a repository.

## Mission

Create a small, durable agentic workflow that prevents the repository's likely costly failures. The output system should include persistent custom agents, explicit gates, bounded hidden subagents, reusable skills or prompts, session artifacts, handoff contracts, and a knowledge-loading strategy.

## Bootstrap Boundary

- Do not modify application code, database schema, migrations, runtime config, or product tests.
- Before writing files, produce a file plan and wait for explicit approval.
- Generated files must live in agent-system locations such as `.github/agents/`, `.github/skills/`, `.claude/agents/`, `docs/agents/`, or the platform equivalent.
- Separate bootstrap behavior from generated-system behavior. A rule for the future Planner is not automatically a rule for this bootstrap run.
- Keep repository-specific recommendations separate from transferable principles.

## Required Reference Loads

Load these templates when their output is needed:

- `templates/bootstrap-file-plan.md` for the install proposal and approval gate.
- `templates/agent-contracts.md` when drafting custom agent contracts.
- `templates/artifact-gates.md` when designing artifacts, gates, and handoffs.
- `templates/knowledge-index-schema.md` when designing bounded knowledge loading.
- `templates/plan-schema.md` when drafting the generated Planner's implementation-plan artifact contract.
- `templates/question-schema.md` when drafting the generated Planner's clarification question contract.

Original source templates from this repository and this teaching skill:

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
- knowledge signals: `docs/`, architecture notes, domain docs, testing guides, contribution docs
- validation signals: package scripts, CI, lint/test commands, PR templates, review docs

Completion criterion: you can name the likely platform, tracker/session model, knowledge sources, and validation surface, or you can state which of those are unknown.

### Gate 2: Clarification

Ask only questions that materially change the system design:

- target agent platform
- output language
- issue/session system
- approval owner
- role boundaries
- mandatory artifacts
- acceptable gate cost
- whether the generated system should create or update a knowledge index in the first install batch
- whether tracker-backed planning should include optional intake skills for existing user stories and bugs
- whether tracker-backed workflows should include optional creation skills for new user-story tickets and bug tickets

Use bounded options when possible. Do not request file-plan approval while blocking questions remain open.

### Gate 3: System Proposal

Produce a concise proposal with:

1. costly failure modes
2. instruction hierarchy
3. recommended modes
4. user-invokable main agents
5. hidden subagents and delegation rules
6. artifacts and gates
7. reusable skills or prompts
8. knowledge map
9. handoff envelope
10. file-generation plan
11. three one-week validation experiments

The knowledge map must include an index-first loading strategy:

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

### Gate 4: File-Plan Approval

Use `templates/bootstrap-file-plan.md`. Mark approval false by default. Do not write files until the user explicitly approves the plan.

### Gate 5: Generation

After approval, create the smallest coherent file batch. Prefer templates and short role contracts over broad narrative docs.

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

### Gate 6: Validation

Validate frontmatter, markdown diagnostics, and internal links where tooling is available. Report any validation that could not run.

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
- If the template exists but was not created by this bootstrap run, confirm it contains equivalent structure to the source template.
- Report the file path and validation status in the final response.

**Question-Schema Template Validation:**
- Verify that `templates/question-schema.md` exists at the expected path.
- Verify that the file contains required sections: clarification table, answers table, per-question chat block, answer choices, and approval-blocking rule.
- Verify that the generated Planner agent contract explicitly references `templates/question-schema.md` by path (not generic wording like "repo question template").
- If the template exists but was not created by this bootstrap run, confirm it contains equivalent structure to the source template.
- Report the file path and validation status in the final response.

## Generated System Requirements

The generated system must have these properties.

### Main Agents

Create persistent, user-invokable custom agents for role boundaries that change authority:

- Planner: clarifies requirements and produces approved artifacts. **Must reference the generated knowledge-index path, `templates/plan-schema.md`, and `templates/question-schema.md` by path in its contract; read the knowledge index before loading knowledge files; produce implementation-plan.md files using the plan schema; and ask blocking clarification questions using the question schema.**
- Implementor: modifies code only from an approved plan.
- Tester: creates or runs test strategy for approved work.
- Reviewer: reviews plan/spec conformance, durable standards, defects, regressions, and gaps.

Optional user-invokable agents are useful when the work can happen outside feature planning: Ask, Knowledge Builder, Issue Intake, Visual Intake.

If the target repository uses a ticketing or issue-tracking system, consider optional user-invokable skills or prompts instead of main agents when the workflow is repeatable but narrow:

- Plan from existing user-story ticket
- Plan from existing bug ticket
- Create user-story ticket
- Create bug ticket

Keep these optional. During bootstrap clarification, ask whether tracker integration belongs in the first install batch, a later batch, or out of scope.

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
11. **load and verify `templates/plan-schema.md` exists** before producing implementation-plan.md artifacts; reference the file path explicitly in the Planner contract and in any generated implementation-plan output
12. **load and verify `templates/question-schema.md` exists** before asking blocking clarification questions; reference the file path explicitly in the Planner contract and in clarification artifacts

## Final Response Shape

Before writing files, end with the unapproved file plan and ask for explicit approval.

After writing files, report changed files, validations, and remaining risks.
