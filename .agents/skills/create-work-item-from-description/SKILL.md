---
name: create-work-item-from-description
description: "Use when: creating a bug or user story from a clarified description through a configured tracker or local Markdown record."
disable-model-invocation: true
---

# Create Work Item From Description

Use this public skill when a user wants to create a bug or user story that will later be planned by `plan-bug-from-id` or `plan-user-story-from-id`.

## Contract

Support two modes:

- `bug`
- `user-story`

Clarify the type, required fields, scope, acceptance criteria or reproduction details, and target adapter before creation. Ask for explicit approval before creating or saving the work item.

## Persistence

When a tracker adapter or MCP integration is configured, create the work item in the selected issue-tracking system and record the returned ID, type, adapter, and source link in the creation result.

When no tracker is configured, save a local Markdown work-item record using the configured local-tracker path and assign a stable ID. The record must contain the type, ID, title, description, acceptance criteria or reproduction details, created timestamp, and status.

This skill must never create or resume a Planner session folder. It returns the ID so the user can later invoke the appropriate Planner-owned skill.

## Handoff

Return exactly:

- Work-item type
- Work-item ID
- Adapter
- Source link or local Markdown path
- Any unresolved fields

Do not create an implementation plan.
