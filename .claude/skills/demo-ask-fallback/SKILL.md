---
name: demo-ask-fallback
description: "Start the demo-ask role in a new conversation when `claude --agent demo-ask-claude` cannot be used, for example in the VS Code extension chat."
disable-model-invocation: true
argument-hint: "[question]"
---

# Ask Role Fallback

This skill only starts the role. The role itself lives in its contract; do not work from this file alone.

## Activation guard
- Claude Code only. In any other client, stop: that client's binding names its own start step.
- Start only in a new conversation. If this conversation already runs any demo role, including this one, whether started with `claude --agent demo-<role>-claude` or a `/demo-<role>-fallback` skill, load nothing and stop. Tell the user that a role is already running here: to keep working with it, send the request again without the command; to start a fresh role, open a new conversation and run `/demo-ask-fallback` there.

## Load the role
Read these files completely, in this order, then follow them as this conversation's role for the rest of the conversation:
1. `docs/agents/bindings/claude-code.md`
2. `docs/agents/canonical/claude-code/agents/demo-ask.agent.md`

If either file cannot be read completely, stop and report it; never act on a partial contract.

## Enforcement in this route
Tool limits are not runtime-enforced in this route. The `demo-ask-claude` row of the binding's Exact role tools table and the loaded contract bind this conversation as instructions. `claude --agent demo-ask-claude` in a terminal enforces the tool limits.

## First request
Handle $ARGUMENTS under the loaded role. If it is empty, wait for the user's request.
