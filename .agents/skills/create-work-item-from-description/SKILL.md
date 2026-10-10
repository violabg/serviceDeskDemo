---
name: create-work-item-from-description
description: "Use when: the user explicitly invokes this workflow to clarify and create a bug or user story through an authorized issue-creation tool in the active client."
disable-model-invocation: true
---

# Create Work Item From Description

Use this public skill only when the user explicitly invokes `create-work-item-from-description` by name. This is a standalone workflow: bypass the normal agentic role routing and Planner flow. Do not create or resume a Planning Session, invoke a Planner, or start implementation planning.

## Contract

Support two modes:

- `bug`
- `user-story`

Clarify the type, required fields, scope, acceptance criteria or reproduction details, and the target issue system before creation. Continue clarification until the proposed work item is specific enough to review. Then present the complete proposed type, title, description, acceptance criteria or reproduction details, and target issue system, and wait for the user's explicit approval before creating it. Approval of the workflow or earlier discussion is not approval of the final proposal.

## Persistence

After approval, create the work item only by using an issue-creation tool that is authorized and available in the active client for the selected issue system. Use the tool's supported fields and report its result. Never substitute a local Markdown record, shell command, API call, guessed tool, or another client's tool. If no suitable authorized tool is available, explain the blocker and ask the user to configure or select an available integration; do not create anything.

The explicit invocation is the authorization to run this workflow, but it does not authorize creation; the final proposal still requires explicit approval. This skill must never create or resume a Planner session folder. It returns the ID so the user can later invoke the appropriate Planner-owned skill.

## Handoff

Return exactly:

- Work-item type
- Work-item ID
- Adapter
- Source link or local Markdown path
- Any unresolved fields

Do not create an implementation plan.
