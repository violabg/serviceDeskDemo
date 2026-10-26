# Using the agentic system in Claude Code

Roles start as role skills you invoke by name. Each role is the main conversation of its own session; start a new conversation for each one.

## Start a role

| To | Do this |
| --- | --- |
| Run a workflow | invoke the `sd-orchestrator-claude` skill in a new conversation, then name the workflow: `DESIGN`, `FAST_IMPLEMENTATION` or `DOCUMENTATION` |
| Plan from a work item | invoke `plan-bug-from-id-claude` or `plan-user-story-from-id-claude` in a new conversation; each loads the orchestrator itself |
| Ask about the project | invoke the `sd-ask-claude` skill in a new conversation |
| Build or update project knowledge | invoke the `sd-knowledge-builder-claude` skill in a new conversation |

The orchestrator always asks which workflow you want when you have not said it, and asks before it creates or resumes a session.

## While a workflow runs

- The orchestrator stops at every halt point and waits for you: an interview question, a decision, or the design review.
- In `DESIGN`, the review document is written into the session's design folder under `.agentic-system-sessions/`. Open it in a browser, then approve or ask for changes in the chat.
- Delegates run as native subagents, each with its own context. You see their verdicts in the conversation.
- Runtime commands run as `node .agentic-system/bin/agentic-system.mjs <command>`. Allow them when the client asks.

## Verification

What Bootstrap verified for this client:

- static install and runtime (verify.mjs): verified-native (no drift, runtime serves DESIGN/FAST_IMPLEMENTATION/DOCUMENTATION, sessions folder reachable, <token> --help prints top-level arguments (2026-10-26, kit 1.2.1))
- work item read (issue_read get/get_labels/get_comments): verified-fallback (exercised in the VS Code extension from the Bootstrap session on #6, not yet from inside sd-orchestrator-claude)
- orchestrator starts via /sd-orchestrator-claude and asks for the workflow type: unverified (needs a new session (IDE and terminal))
- session created through the runtime from the role: unverified (needs a new session)
- delegate runs in its own context (sd-design-verifier): unverified (needs a new session)
- role skill refuses inside a running role: unverified (needs a new session)
- visual evidence: unverified (needs a new session)
- terminal surface GitHub MCP: unverified (GITHUB_TOKEN not exported in the login shell; export it before launching claude in a terminal)
