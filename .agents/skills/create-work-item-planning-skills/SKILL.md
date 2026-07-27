---
name: create-work-item-planning-skills
description: "Use when: adding Planner-only ID-based bug and user-story planning skills that create or resume isolated session artifacts."
disable-model-invocation: true
---

# Create Work-Item Planning Skills

Use this public skill after bootstrap when a repository needs repeatable planning intake from existing bug or user-story IDs.

The generated skills are Planner-only procedures. They must not be invoked by other agents or direct general-purpose workflows.

## Contract

Create both repository-local skills:

- `plan-bug-from-id`
- `plan-user-story-from-id`

Do not create only one. They share the session interface and differ in evidence, analysis, and plan-readiness gates.

## Required Retrieval Handoff

Generated skills must not declare skill-level `tools:` frontmatter. Tool frontmatter belongs on generated agents, not these Planner-only skills. Do not add Planner baseline tools, tracker MCP tools, documentation MCP tools, framework MCP tools, or broad integration tool lists to either generated skill's frontmatter.

Each generated skill must delegate work-item evidence gathering with an inline `#tool:agent/runSubagent` instruction in the skill body.

`plan-bug-from-id` must include this section before the prompt template:

```markdown
# Bug Information Gathering

use #tool:agent/runSubagent to delegate work item gathering to a built-in agent subagent.
Use the following prompt template for the subagent:
```

`plan-user-story-from-id` must include this section before the prompt template:

```markdown
use #tool:agent/runSubagent to delegate work item gathering to a default subagent (leave argument args.agentName empty).
Use the following prompt template for the subagent:
```

Adapter requirements:

- Name the selected GitHub, Jira, Linear, Azure DevOps, Notion, other tracker adapter, or local Markdown adapter in the generated skill body.
- Use a repository-local Markdown adapter when no external tracker integration is configured; do not invent tracker MCP names.
- Put retrieval-tool details in the subagent prompt or adapter contract, not in skill frontmatter.
- Record any useful but unavailable tracker MCP as a recommendation, not as a required tool.
- Keep the retrieval handoff and adapter contract identical between `plan-bug-from-id` and `plan-user-story-from-id` unless one skill has a documented adapter-specific need.

## Issue Tracker Contract

The generated skills require an issue tracker contract. Do not create ID-based planning skills until the repository has one of these adapters:

- External tracker adapter: GitHub, Jira, Linear, Azure DevOps, Notion, or another configured system with approved retrieval tools.
- Local Markdown adapter: repository-local Markdown files with stable IDs and a documented lookup rule.

External tracker adapters must define:

- tracker name,
- approved retrieval MCP or platform tools,
- supported work item types,
- ID format,
- fields to retrieve,
- missing-ID behavior,
- evidence-to-session Markdown conversion rules.

Local Markdown adapters must define:

- issue root folder,
- accepted ID pattern,
- whether lookup is direct path-based or index-based,
- index file path when index-based lookup is used,
- required frontmatter or heading fields for bug and user-story records,
- image or attachment reference handling,
- missing-ID behavior,
- duplicate-ID behavior,
- evidence-to-session copy rules.

## Session Interface

Before retrieving or analyzing work-item evidence, each generated skill must:

1. Require the source ID.
2. Normalize it into a stable filesystem-safe session ID containing only letters, numbers, `_`, and `-`.
3. Resolve the source ID through the configured external tracker adapter or local Markdown adapter.
4. Fail closed when the ID is missing, duplicated, unreadable, or does not match the configured ID pattern.
5. Ask during bootstrap where the session root should be stored; it may be external to the repository or an internal path that agents are explicitly forbidden to scan.
6. Create or resume exactly one session folder under that configured root.
7. Read and write only the current session folder. Never enumerate or read other session folders.
8. Record the source type, source ID, adapter, retrieval timestamp, evidence, decisions, and final implementation plan in that folder.
9. Include the session folder path and adapter in the final handoff.

The session folder is the durable seam between issue systems and planning. An external tracker adapter may read GitHub, Jira, or another configured system. If no external tracker is configured, use a local Markdown adapter. Work-item creation is a separate skill and never creates a planning session. Do not require a particular vendor, but do require one issue tracker contract.

## Generated Skill Requirements

`plan-bug-from-id` must require a bug work-item ID, gather title, description, comments, acceptance criteria, image references, and relevant discussion evidence through the configured adapter or an optional subagent handoff, then analyze probable causes before planning.

Bug planning must use a narrow-to-wide cause gate: identify the most likely root cause first, expand to plausible contributing factors such as code, configuration, data, and external dependencies, present the top two or three causes with evidence, wait for the user to select the cause to plan for, and save that selected cause analysis in the session before producing the plan. The resulting implementation plan must stay focused on the selected root cause and avoid symptom-only or unrelated fixes.

`plan-user-story-from-id` must require a user-story work-item ID, gather title, description, comments, acceptance criteria, epics, features, related work items, image references, and relevant discussion evidence through the configured adapter or an optional subagent handoff, then save the evidence in the session before producing a plan.

User-story planning must treat acceptance criteria and related work items as plan-critical evidence. It must preserve ambiguities, missing requirements, dependencies, and open questions in the session artifact so the Planner can either ask blocking clarifications or explicitly justify proceeding.

Both skills must:

- preserve source metadata without copying secrets,
- state the selected external tracker adapter or local Markdown adapter and ID retrieval contract,
- omit `tools:` frontmatter and use the required `#tool:agent/runSubagent` handoff instead,
- never overwrite a different session,
- be invokable only by the Planner agent,
- surface adapter or retrieval failures,
- keep unrelated implementation work out of the plan,
- preserve code blocks and convert rich tracker content to Markdown when possible,
- begin the repository's normal planning workflow at its first planning gate after evidence is saved,
- skip only those interviews or clarification steps that the saved evidence fully satisfies,
- use the repository's existing context glossary and plan schema when present.

## Approval and Validation

Inspect existing agent, skill, artifact, session, glossary, and plan-schema conventions before writing files. Propose the file batch and wait for explicit approval unless the caller has already supplied approval.

After approval, create or update both skills and any shared session template or adapter contract. Validate frontmatter, absence of skill-level `tools:` frontmatter, required `#tool:agent/runSubagent` handoff, links, safe session-ID rules, selected adapter, issue ID retrieval, local Markdown lookup when used, and that both skills reference the same session interface.
