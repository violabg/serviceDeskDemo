---
name: demo-direct-implementor-fallback
description: "Start the demo-direct-implementor role in this conversation when `claude --agent demo-direct-implementor-claude` cannot be used, for example in the VS Code extension chat."
disable-model-invocation: true
argument-hint: "[change request]"
---

# Direct Implementor Role Fallback

This skill only starts the role. The role itself lives in its contract; do not work from this file alone.

## Activation guard
- Claude Code only. In any other client, stop: that client's binding names its own start step.
- Use a new conversation. If this conversation already runs another demo role, stop and tell the user to open a new conversation for `/demo-direct-implementor-fallback`.
- If this conversation already runs under the `demo-direct-implementor-claude` registration (started with `claude --agent demo-direct-implementor-claude`), the role is active: skip loading and handle the request.

## Load the role
Read these files completely, in this order, then follow them as this conversation's role for the rest of the conversation:
1. `docs/agents/bindings/claude-code.md`
2. `docs/agents/canonical/claude-code/agents/demo-direct-implementor.agent.md`

If either file cannot be read completely, stop and report it; never act on a partial contract.

## Restrictions in this route
Tool limits are not runtime-enforced here; they bind you as instructions for the whole conversation.
- Use only the tools in the `demo-direct-implementor-claude` row of the binding's Exact role tools table. The table wins if it differs from this list.
- Never use `WebFetch`.
- GitHub is read-only: only `mcp__github__issue_read`, as the binding's tracker section describes.
- Never create or add tests.
- Never use `mcp__github__issue_write`; it belongs only to an explicit `/manage-work-item` run.
- For runtime-enforced limits, the user can run `claude --agent demo-direct-implementor-claude` in a terminal instead.

## First request
Handle $ARGUMENTS under the loaded role. If it is empty, wait for the user's request.
