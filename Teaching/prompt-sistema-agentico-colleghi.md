# Prompt for Bootstrapping an Agentic System

I want to design an agentic system for this repository.

Work as an agentic workflow architect. Do not modify application code. Analyze only the repository structure, existing documentation, development workflow, and operational risks.

Your job is to design a reusable agentic system that this team can install into this repository. The system should include persistent custom agents, reusable workflow skills or prompts, durable artifacts, gates, handoff formats, and a small knowledge map.

Important distinction:

- Bootstrap prompt behavior: what you, the current agent, do while analyzing this repository and proposing the system.
- Generated system behavior: what the agentic system you design will require from its future Planner, Implementor, Tester, Reviewer, and support agents.

Do not mix these two layers. When a rule belongs to the future custom system, describe it as a requirement for the generated system, not as a rule that governs this bootstrap prompt directly.

## Bootstrap Boundaries

- Do not create, modify, or move files until the team approves a concrete file-generation plan.
- If the team approves file creation, create only proposal, agent, skill, prompt, or documentation files under a dedicated agentic-system folder such as `docs/agents/`, `.agents/`, `.github/agents/`, `.claude/agents/`, or the equivalent folder for the chosen platform.
- Do not modify application source files, database schema, migrations, runtime configuration, or product tests.
- Do not present the system as perfect.
- Prefer rules that are small, verifiable, and easy to change.
- Do not add process unless it prevents a clear and likely failure.
- Always distinguish between a repository-specific recommendation and a transferable principle.

## Bootstrap Discovery

Before designing the system, infer the starting context from repository signals.

Look for:

- Agent platform signals: `.github/agents/`, `.claude/agents/`, custom agent docs, Claude Code workflow files, Copilot customizations, Cursor rules, Cline rules, MCP configuration, or equivalent platform-specific conventions.
- Session and issue signals: GitHub Issues, Jira, Linear, Azure DevOps, Notion, internal trackers, `sessions/` folders, local issue docs, workflow docs, or MCP references.
- Existing knowledge signals: `docs/`, architecture notes, domain notes, testing guides, contribution docs, workflow docs, or knowledge indexes.
- Development workflow signals: package scripts, test commands, lint commands, CI configuration, PR templates, review docs, or release docs.

Then ask clarification questions ordered by impact. Do not impose a numeric question cap. If specs are unclear, grill the team until blocking ambiguity is resolved or explicitly accepted as a risk.

The questions should cover only decisions that materially change the design, such as:

- agent platform
- output language
- session, issue, and decision-linkage system
- approval owner
- role boundaries
- mandatory artifacts
- acceptable gate cost

If repository signals are strong, propose the most coherent default and ask for confirmation. If signals are weak, do not invent a default; ask the team to choose. Offer bounded choices when useful, for example:

- Agent platform: `A` GitHub Copilot custom agents, `B` Claude Code agents, `C` Cursor rules/agents, `D` Cline, `E` other.
- Session system: `A` GitHub Issues with MCP, `B` Jira with MCP, `C` Linear with MCP, `D` Azure DevOps with MCP, `E` Notion with MCP, `F` internal tracker with MCP, `G` local Markdown artifacts.
- Output language: `A` English, `B` repository/team language, `C` bilingual.

Do not ask for approval while blocking clarification questions remain unanswered.

## Bootstrap Output Before Any Files

After discovery and clarification, produce a concise design proposal. This is the bootstrap proposal, not the future Planner implementation-plan template.

The proposal must include:

1. Failure modes the system is designed to prevent
2. Proposed instruction hierarchy
3. Recommended modes
4. Recommended persistent custom agents
5. Durable artifacts and gates
6. Decision-map and vertical-ticket strategy
7. Candidate reusable skills or prompts
8. Knowledge map
9. Handoff envelope
10. File-generation plan for installing the custom system
11. Three small experiments to validate the system in one week

The file-generation plan should be easy to review, but it does not need to use the future system's implementation-plan template. It should say what files would be created or modified, why each file exists, who uses it, and which failure mode it prevents.

Minimum file-generation plan structure:

```md
# Agentic System File Plan

## Approval Status
- Approved: false

## Proposed Platform
- Platform:
- Reason:

## Proposed Files

| Operation | Path | Purpose | User | Failure Mode Prevented |
| --- | --- | --- | --- | --- |
| NEW | `...` | ... | ... | ... |
| MODIFIED | `...` | ... | ... | ... |

## Operations

| Step | Action | Validation |
| --- | --- | --- |
| 1 | ... | ... |

## Validation
- `...`

## Rollback
- ...
```

Ask for explicit approval before writing files.

## Generated System Requirements

Design the future custom agentic system using the requirements below. These requirements belong to the generated system, not necessarily to the bootstrap prompt itself.

### 1. Failure Modes

Identify the 5 most likely errors when AI agents help this team.

Examples:

- ambiguous scope
- implementation without approval
- incorrect context loading
- skipped tests
- weak review
- conflicting instructions
- undocumented decisions
- raw screenshots or tracker records being treated as complete requirements

For each failure mode, define:

- why it is likely in this repository
- what damage it causes
- which agent, skill, artifact, or gate prevents it
- how the team can tell whether the prevention is working

### 2. Instruction Hierarchy

Propose where durable team rules, custom agent role rules, reusable skills, and ad hoc task prompts should live.

Required hierarchy:

1. Team policy: durable repo-wide rules and non-negotiable safety boundaries.
2. Custom agent: role authority, allowed actions, stop conditions, and handoff duties.
3. Workflow skill or reusable prompt: repeatable procedure for one workflow step.
4. Task prompt: one-off context and instructions for a specific request.

Explain which layer wins when two layers conflict.

### 3. Narrow Modes

Identify which workflows deserve a dedicated mode.

For each mode, write:

- when it activates
- what it may do
- what it may not do
- when it must stop
- which artifacts it may create or modify

Keep modes narrow. A mode should exist only when it protects an authority boundary, input type, or review responsibility.

### 4. Persistent Custom Agent Roles

Propose the minimum set of user-invokable persistent custom agents needed to reduce drift.

Start from these roles and adapt them to the repository and chosen platform:

- Planner: clarifies the requirement and produces artifacts.
- Implementor: modifies code only from an approved plan.
- Tester: creates and executes the test strategy.
- Reviewer: looks for bugs, regressions, risks, and gaps against the approved plan and durable standards.

These roles must be persistent custom agent definitions saved in the chosen platform's expected location, such as `.github/agents/`, `.claude/agents/`, or equivalent. They may call sub-agents or skills internally, but the role itself must be directly invokable by the user.

Evaluate whether the system also needs these specialized user-invokable agents:

- Ask agent: repository-grounded Q&A, explanation, and navigation without planning or code changes.
- Issue intake agent: normalizes GitHub, Jira, Linear, Azure DevOps, Notion, or internal-tracker records.
- Visual intake agent: converts screenshots, mockups, browser captures, dashboards, wireframes, or diagrams into stable planning artifacts.
- Knowledge-builder agent: creates and maintains durable domain, architecture, testing, or workflow knowledge.

Add specialized agents only when a distinct input type, authority boundary, or review responsibility would otherwise blur the core roles.

If raw evidence such as screenshots or tracker records can materially affect scope, UX, or acceptance criteria, require a dedicated intake step that converts that raw evidence into a stable planning artifact before the Planner uses it.

If repository Q&A or knowledge maintenance can happen outside feature planning, keep those agents separate from Planner so explanation work and knowledge-building work do not accidentally become implementation planning.

### 5. Planner Rules

The generated Planner agent must include clarification rules.

Planner clarification rules must cover:

- when a missing answer is blocking versus non-blocking
- how to ask concise, easy-to-answer clarification questions
- when bounded answer choices such as `A`, `B`, `C` should be used
- how to explain why the question matters and how the answer changes the plan
- that approval must never be requested while blocking clarification questions remain unanswered
- that assumptions do not close blocking questions unless the user explicitly resolves them

The generated Planner must also require bounded discovery before any implementation plan:

- select only relevant repository knowledge, using an index-first approach when the repo has a knowledge index
- extract a small rule inventory from selected knowledge and treat it as the planning constraint set
- group the likely implementation surface into a small number of codebase clusters before deep reading
- inspect only files that answer a concrete planning question
- include a final alignment review that maps selected rules to planned files, decisions, or blockers

### 6. Future Implementation-Plan Template

The generated system should include a structured implementation-plan template for future feature work. This template is for the custom system's Planner, not for this bootstrap prompt's own proposal.

The future implementation plan must be produced before implementation and must be approved before the Implementor changes application code.

The future implementation-plan artifact must use this minimum structure:

````text
# Implementation Plan

## Session ID
- Session:

## Approval Status
- Approved: false
- Approved By:
- Approval Date:

## 1. Design Overview
- Goal:
- Scope:
- Out of Scope:
- Key Decisions:

## 2. Selected Repository Knowledge
- Selected Knowledge Files:
- Rule Inventory:
- Alignment Notes:

## 3. Filesystem Tree

> Paths link to their File Details entry below for quick navigation.

| Operation | Path | Reason |
| --- | --- | --- |
| NEW | [`...`](#file-slug) | ... |
| MODIFIED | [`...`](#file-slug) | ... |
| UNMODIFIED | [`...`](#file-slug) | context or validation scope only |

Path slug rule: lowercase the path, replace every run of non-alphanumeric characters with `-`, then trim leading and trailing `-`.

## 4. File Details

<a id="file-slug"></a>

### `<path>`
Back to [Filesystem Tree](#3-filesystem-tree)

- Operation:
- Purpose:
- Planned Changes:
- Who Uses It:
- Failure Mode Prevented:
- Diff Required: true
- Diff Rationale:

For `MODIFIED` files:

**Proposed Diff:**

```diff
- removed line shown in red in markdown renderers that support diff highlighting
+ added line shown in green in markdown renderers that support diff highlighting
```

For `NEW` files:

**Proposed File:**

```md
# Example Title

Full or near-full expected contents go here.
```

Use `Proposed Diff: None` only when the file has no material content changes.

## 5. Operations and Timeline

| Step | Action | Validation |
| --- | --- | --- |
| 1 | ... | ... |

## 6. Validation Commands
- `...`

## 7. Risks and Rollback
- ...
````

Future implementation-plan rules:

- In `Approval Status`, mark the plan as not approved until the team explicitly confirms it.
- In `Selected Repository Knowledge`, list only files actually read or signals actually observed in the repository and explain why they were selected.
- In `Filesystem Tree`, show each proposed file as `NEW`, `MODIFIED`, or `UNMODIFIED` with a short reason.
- Render each path as a clickable link to its matching entry in `File Details` when the artifact format supports links.
- In `File Details`, create one entry for every file in the tree with operation, purpose, planned changes, user, and failure mode prevented.
- Each `File Details` entry must include a visible backlink to the `Filesystem Tree` section when links are supported.
- If the plan proposes modifying an existing file, include `Diff Required: true` and a concise `Proposed Diff` when the change is material.
- If the plan proposes a new file, include `Proposed File` with the full or near-full expected structure, not just a title.
- If a file is mentioned only for context or test scope, use `UNMODIFIED` and explain why it remains unchanged.
- In `Operations and Timeline`, order steps as the smallest sensible sequence of verifiable actions.
- In `Validation Commands`, include only realistic checks for the planned work.
- In `Risks and Rollback`, explain how to reverse or reduce the impact if the plan proves too heavy or wrong.

### 7. Durable Artifacts

Define files that let the team resume work without depending on chat memory.

Include at least:

- `session-brief.md`
- `requirements-analysis.md`
- `clarification-questions.md`
- `spec.md`
- `task-breakdown.md`
- `implementation-plan.md`
- `test-plan.md`
- `review-report.md`
- `changed-files.md`

If visual or external-tracker evidence influences the work, define a durable artifact that records normalized evidence and links it from planning artifacts.

For each artifact, define:

- owner agent
- when it is created
- when it may be updated
- required fields
- approval state, if any
- downstream agents that depend on it

### 8. Gates

Propose the minimum useful gates.

At least evaluate:

- human approval before implementation
- complete artifacts before handoff
- green affected tests before final review
- mandatory revisions for already approved artifacts
- knowledge alignment before requesting approval
- affected-test scope before implementation or test handoff
- enforcement only after the workflow rule has proven useful and the failure it prevents is expensive enough

For each gate, define:

- trigger
- pass condition
- fail condition
- who can approve or waive it
- artifact that records the decision
- rollback path if the gate proves too heavy

### 9. Decision Maps and Vertical Tickets

For work larger than one agent session, require a decision map before implementation tickets.

The decision map must include:

- destination of the work
- decisions already closed
- open decisions
- fog that is not yet specifiable
- next frontier
- demoable vertical tickets with blocking edges
- rule for wide refactors: use expand-contract instead of fake vertical slices

The system should distinguish:

- Transferable principle: vertical tickets should produce demoable behavior and reduce integration risk.
- Repository-specific example: choose vertical tickets that match this repository's routes, modules, services, data model, and test structure.

### 10. Reusable Skills or Prompts

Package repeatable work as skills or reusable prompts with a clear trigger, short procedure, and known output.

Candidate skills:

- requirements-analysis
- task-decomposition
- implementation-planning
- test-strategy
- review-checklist
- evidence-intake
- knowledge-indexing
- handoff-preparation

For each candidate, define:

- trigger
- inputs
- allowed actions
- output artifact
- stop condition
- agent roles that may invoke it

### 11. Knowledge Map

Propose a knowledge map that helps agents read only what they need. Do not load the whole repository by default.

Required output:

- knowledge document path
- reading trigger
- expected content
- owner
- update trigger

Also define how agents turn selected knowledge into planning constraints:

- read the index first when one exists
- select knowledge by trigger, not by bulk loading
- extract applicable rules into a small rule inventory
- record selected knowledge in artifacts
- prefer selected knowledge over similar-but-conflicting legacy code patterns
- verify plans against selected rules before approval

### 12. Handoff Envelope

Create a standard format for handoff between agents or phases.

It must include:

- session id
- from agent
- to agent
- current gate
- approval state
- required artifacts
- selected knowledge
- open questions
- blocking risks
- definition of done for the next agent

## Final Bootstrap Response Format

When you complete the bootstrap design, produce this final response:

1. Summary of failure modes
2. Proposed instruction hierarchy
3. Recommended modes
4. Recommended agent roles
5. Artifacts and gates
6. Strategy for decision maps and vertical tickets
7. Candidate skills
8. Knowledge map
9. Handoff envelope
10. File-generation plan
11. Three small experiments to validate the system in one week

End by asking for explicit approval before creating or modifying files.
