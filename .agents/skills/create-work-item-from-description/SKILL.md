---
name: create-work-item-from-description
description: "Use when: the user explicitly invokes this workflow to clarify and create a bug or user story through an authorized issue-creation tool in the active client."
disable-model-invocation: true
---

# Create Work Item From Description

Produces one approved bug or user story in the selected issue system and returns its ID and source link.

Use this public skill only when the user explicitly invokes `create-work-item-from-description` by name. This is a standalone workflow: bypass the normal agentic role routing and Planner flow. Do not create or resume a Planning Session, invoke a Planner, or start implementation planning.

## Preconditions

- Run only in the default agent of the active client. Resolve `codex` or `copilot` from client/session identity through `docs/agents/integration-bindings.md`, then load only its selected binding and `docs/agents/github-issues-adapter.md`. Do not load a custom role contract for this standalone workflow.
- Use only the binding's separately approved issue-creation tool or native procedure. A listed tool or installed command is not proof of authentication or target-repository authorization. Missing identity, authentication, or authorization stops creation; report the exact prerequisite.

## Contract

Support two modes:

- `bug`
- `user-story`

Clarify the type, required fields, scope, acceptance criteria or reproduction details, and the target issue system before creation. Continue clarification until the proposed work item is specific enough to review. Then present the complete proposed type, title, description, acceptance criteria or reproduction details, and target issue system, and wait for the user's explicit approval before creating it. Approval of the workflow or earlier discussion is not approval of the final proposal.

## Persistence

1. Clarify the work item under the Contract above and confirm the exact target issue system and repository.
2. Inspect the selected binding's creation procedure and run its bounded read-only prerequisites before presenting the final proposal. Include the selected native procedure in the target issue system field. Do not treat repository access as proof that creation will succeed.
3. Present the complete proposal and wait for explicit approval. Approval persists for that exact proposal; changes to its title, body, target, or metadata require a revised proposal and approval.
4. After approval, create only through the issue-creation tool or native procedure separately authorized in the selected binding. Preserve the reviewed title, body, and supported metadata exactly. A native command is permitted only when that binding explicitly approves it for this skill; never invent a command or use another client's procedure. Do not substitute a local Markdown tracker, generic API call, or unapproved shell operation. A temporary body file is transport for the approved command, not a work-item record.
5. Report the returned ID and source link. If creation is rejected, report the exact error and required recovery. If the result is uncertain, or a command prints an issue URL despite a nonzero exit, stop automatic retries: use only the binding's exact-ID verification operation when a URL is known; otherwise ask the user to establish whether creation occurred. Never silently switch procedures or risk creating a duplicate.

If no suitable approved tool or native procedure is available, explain the blocker and ask the user to configure or select an available integration; do not create anything. If an attachment is required, use only a separately verified upload capability; ask before creating without it when upload is unavailable.

The explicit invocation is the authorization to run this workflow, but it does not authorize creation; the final proposal still requires explicit approval. This skill must never create or resume a Planner session folder. It returns the ID so the user can later invoke the appropriate Planner-owned skill.

## Handoff

Return exactly:

- Work-item type
- Work-item ID
- Adapter
- Source link or local Markdown path
- Any unresolved fields

Do not create an implementation plan.
