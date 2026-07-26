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

## Session Interface

Before retrieving or analyzing work-item evidence, each generated skill must:

1. Require the source ID.
2. Normalize it into a stable filesystem-safe session ID containing only letters, numbers, `_`, and `-`.
3. Ask during bootstrap where the session root should be stored; it may be external to the repository or an internal path that agents are explicitly forbidden to scan.
4. Create or resume exactly one session folder under that configured root.
5. Read and write only the current session folder. Never enumerate or read other session folders.
6. Record the source type, source ID, adapter, retrieval timestamp, evidence, decisions, and final implementation plan in that folder.
7. Include the session folder path and adapter in the final handoff.

The session folder is the durable seam between external work-item systems and planning. A tracker adapter may read GitHub, Jira, or another configured system. If no tracker is configured, use a local Markdown adapter. Work-item creation is a separate skill and never creates a planning session. Do not require a particular vendor.

## Generated Skill Requirements

`plan-bug-from-id` must require a bug work-item ID, gather title, description, comments, acceptance criteria, image references, and relevant discussion evidence through the configured adapter or an optional subagent handoff, then analyze probable causes before planning.

Bug planning must use a narrow-to-wide cause gate: identify the most likely root cause first, expand to plausible contributing factors such as code, configuration, data, and external dependencies, present the top two or three causes with evidence, wait for the user to select the cause to plan for, and save that selected cause analysis in the session before producing the plan. The resulting implementation plan must stay focused on the selected root cause and avoid symptom-only or unrelated fixes.

`plan-user-story-from-id` must require a user-story work-item ID, gather title, description, comments, acceptance criteria, epics, features, related work items, image references, and relevant discussion evidence through the configured adapter or an optional subagent handoff, then save the evidence in the session before producing a plan.

User-story planning must treat acceptance criteria and related work items as plan-critical evidence. It must preserve ambiguities, missing requirements, dependencies, and open questions in the session artifact so the Planner can either ask blocking clarifications or explicitly justify proceeding.

Both skills must:

- preserve source metadata without copying secrets,
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

After approval, create or update both skills and any shared session template or adapter contract. Validate frontmatter, links, safe session-ID rules, and that both skills reference the same session interface.
