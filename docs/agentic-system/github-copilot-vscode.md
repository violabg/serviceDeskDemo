# Using the agentic system in GitHub Copilot in VS Code

Roles start as native agents (the client's agent picker). Each role is the main conversation of its own session; start a new conversation for each one.

## Start a role

| To | Do this |
| --- | --- |
| Run a workflow | select `sd-orchestrator` in the Chat view's agent picker, then name the workflow: `DESIGN`, `FAST_IMPLEMENTATION` or `DOCUMENTATION` |
| Plan from a work item | select `sd-orchestrator` first, then invoke `plan-bug-from-id` or `plan-user-story-from-id` |
| Ask about the project | select `sd-ask` in the Chat view's agent picker |
| Build or update project knowledge | select `sd-knowledge-builder` in the Chat view's agent picker |

The orchestrator always asks which workflow you want when you have not said it, and asks before it creates or resumes a session.

## While a workflow runs

- The orchestrator stops at every halt point and waits for you: an interview question, a decision, or the design review.
- In `DESIGN`, the review document is written into the session's design folder under `.agentic-system-sessions/`. Open it in a browser, then approve or ask for changes in the chat.
- Delegates run as native subagents, each with its own context. You see their verdicts in the conversation.
- Runtime commands run as `node .agentic-system/bin/agentic-system.mjs <command>`. Allow them when the client asks.

## Verification

What Bootstrap verified for this client:

- orchestrator starts from the agent picker and asks for the workflow type: unverified (needs a Copilot Chat session)
- session created through the runtime from the role: unverified (needs a Copilot Chat session)
- delegate runs in its own context and resolves to .github/agents (not .claude/agents duplicate): unverified (needs a Copilot Chat session)
- skills resolve to .github/skills copies: unverified (needs a Copilot Chat session)
- work item read (github/issue_read): unverified (Copilot GitHub sign-in not checked)
- visual evidence: unverified (needs a Copilot Chat session)
