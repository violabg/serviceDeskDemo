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
- `templates/plan-schema.md` when drafting the generated Planner's implementation-plan artifact contract.

Original source templates from this repository and this teaching skill:

- `templates/plan-schema.md` preserves the implementation-plan block for reuse in generated agent contracts.
- Per-question clarification format is provided directly in `templates/agent-contracts.md` and should be adapted to the target repository.
- If your target repository already has implementation-plan or clarification templates, adapt and reference those local equivalents.

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

### Gate 4: File-Plan Approval

Use `templates/bootstrap-file-plan.md`. Mark approval false by default. Do not write files until the user explicitly approves the plan.

### Gate 5: Generation

After approval, create the smallest coherent file batch. Prefer templates and short role contracts over broad narrative docs.

### Gate 6: Validation

Validate frontmatter, markdown diagnostics, and internal links where tooling is available. Report any validation that could not run.

## Generated System Requirements

The generated system must have these properties.

### Main Agents

Create persistent, user-invokable custom agents for role boundaries that change authority:

- Planner: clarifies requirements and produces approved artifacts.
- Implementor: modifies code only from an approved plan.
- Tester: creates or runs test strategy for approved work.
- Reviewer: reviews plan/spec conformance, durable standards, defects, regressions, and gaps.

Optional user-invokable agents are useful when the work can happen outside feature planning: Ask, Knowledge Builder, Issue Intake, Visual Intake.

### Gates Inside Main Agents

Main agents should include gates only where the repository's real workflow risk changes. Do not copy this gate list blindly. Evaluate each candidate, then remove, add, rename, or merge gates so the contract fits the target repo.

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

### Knowledge Loading

Generated planners must load knowledge deliberately:

1. read the knowledge index first when present
2. select files by trigger
3. extract a rule inventory
4. record selected knowledge in artifacts
5. cluster likely codebase surface before deep reading
6. use hidden context scouts for bounded evidence questions
7. align the plan against selected rules before approval

## Final Response Shape

Before writing files, end with the unapproved file plan and ask for explicit approval.

After writing files, report changed files, validations, and remaining risks.
