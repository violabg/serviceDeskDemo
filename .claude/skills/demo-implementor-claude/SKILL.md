---
name: demo-implementor-claude
description: "Start the demo-implementor role in a new Claude Code conversation. User-invoked only."
disable-model-invocation: true
argument-hint: "[Resume implementation for Planning Session <planning-session-id>]"
---

# Implementor Role Skill

This skill only starts the role. The role itself lives in its contract; do not work from this file alone.

## Activation guard
- Claude Code only. In any other client, stop: that client's binding names its own start step.
- Start only in a new conversation. If this conversation already runs any demo role, including this one, whether started with a `/demo-<role>-claude` skill or a planning skill, load nothing and stop. Tell the user that a role is already running here: to keep working with it, send the request again without the command; to start a fresh role, open a new conversation and run `/demo-implementor-claude` there.

## Load the role
Read these files completely, in this order, then follow them as this conversation's role for the rest of the conversation:
1. `docs/agents/bindings/claude-code.md`
2. `docs/agents/canonical/claude-code/agents/demo-implementor.agent.md`

If either file cannot be read completely, stop and report it; never act on a partial contract.

## Tool limits
Tool limits are instruction-only in Claude Code: no runtime registration enforces them. The `demo-implementor` row of the binding's Exact role tools table, with the binding's environment-level substitutions, and the loaded contract bind this conversation.

## First request
Handle $ARGUMENTS under the loaded role. If it is empty, wait for the user's request.
