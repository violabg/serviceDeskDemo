---
name: demo-knowledge-builder-fallback
description: "Start the demo-knowledge-builder role in this conversation when `claude --agent demo-knowledge-builder-claude` cannot be used, for example in the VS Code extension chat."
disable-model-invocation: true
argument-hint: "[knowledge topic]"
---

# Knowledge Builder Role Fallback

This skill only starts the role. The role itself lives in its contract; do not work from this file alone.

## Activation guard
- Claude Code only. In any other client, stop: that client's binding names its own start step.
- Use a new conversation. If this conversation already runs another demo role, stop and tell the user to open a new conversation for `/demo-knowledge-builder-fallback`.
- If this conversation already runs under the `demo-knowledge-builder-claude` registration (started with `claude --agent demo-knowledge-builder-claude`), the role is active: skip loading and handle the request.

## Load the role
Read these files completely, in this order, then follow them as this conversation's role for the rest of the conversation:
1. `docs/agents/bindings/claude-code.md`
2. `docs/agents/canonical/claude-code/agents/demo-knowledge-builder.agent.md`

If either file cannot be read completely, stop and report it; never act on a partial contract.

## Restrictions in this route
Tool limits are not runtime-enforced here; they bind you as instructions for the whole conversation.
- Use only the tools in the `demo-knowledge-builder-claude` row of the binding's Exact role tools table. The table wins if it differs from this list.
- Never use `Bash`, any GitHub tool, `mcp__next-devtools__browser_eval`, or the Neon `prepare_database_migration`, `run_sql` and `complete_database_migration` tools.
- Use `Edit` and `Write` only under `knowledge/`, its index `knowledge/knowledge-index.md`, and the owning session's artifacts.
- Never use `mcp__github__issue_write`; it belongs only to an explicit `/manage-work-item` run.
- For runtime-enforced limits, the user can run `claude --agent demo-knowledge-builder-claude` in a terminal instead.

## First request
Handle $ARGUMENTS under the loaded role. If it is empty, wait for the user's request.
