# Using the agentic system in Claude Code

Roles start as role skills you invoke by name. Each role is the main conversation of its own session; start a new conversation for each one.

## Start a role

| To | Do this |
| --- | --- |
| Run a workflow | invoke the `sd-orchestrator` skill in a new conversation, then name the workflow: `DESIGN`, `FAST_IMPLEMENTATION` or `DOCUMENTATION` |
| Plan from a work item | invoke `plan-bug-from-id` or `plan-user-story-from-id` in a new conversation; each loads the orchestrator itself |
| Ask about the project | invoke the `sd-ask` skill in a new conversation |
| Build or update project knowledge | invoke the `sd-knowledge-builder` skill in a new conversation |

The orchestrator always asks which workflow you want when you have not said it, and asks before it creates or resumes a session.

## While a workflow runs

- The orchestrator stops at every halt point and waits for you: an interview question, a decision, or the design review.
- In `DESIGN`, the review document is written into the session's design folder under `agentic-system-sessions/`. Open it in a browser, then approve or ask for changes in the chat.
- Delegates run as native subagents, each with its own context. You see their verdicts in the conversation.
- Runtime commands run as `node agentic-system/bin/agentic-system.mjs <command>`. Allow them when the client asks.

## Verification

What Bootstrap verified for this client:

- Workflow skills: `.claude/skills`, reached natively (the documented project folder; verified by name in headless claude -p (2026-10-31, kit 3.0.1)).
- static install and runtime (verify.mjs): verified-native (no drift, runtime serves the three workflows, sessions folder reachable (2026-10-31, kit 3.0.1))
- work item read (issue_read get/get_labels/get_comments): verified-fallback (exercised in the VS Code extension from the Bootstrap session on #6, not yet from inside sd-orchestrator)
- session created through the runtime from the role: unverified (needs a new session)
- delegate runs in its own context (sd-design-verifier): verified-native (headless claude -p returned DELEGATE-OK (2026-10-31, kit 4.0.0))
- role skill refuses inside a running role: unverified (needs a new session)
- visual evidence: unverified (needs a new session)
- terminal surface GitHub MCP: unverified (GITHUB_PAT not exported in the login shell; export it before launching claude in a terminal)
- review document (redesigned page): unverified (asset design-review.html updated to the 2.0.x design on 2026-10-28; the rendered page is checked in a DESIGN run)
- shared skill /plan-bug-from-id: verified-native (invoked by name in headless claude -p (2026-10-31, kit 3.0.1); hidden from the model by disable-model-invocation, as intended)
- orchestrator starts via /sd-orchestrator and asks for the workflow type: verified-native (headless claude -p (2026-10-31, kit 4.0.0); IDE surface not exercised)
- runtime-only delegate is refused outside its role: verified-fallback (the runtime refuses design-approve for design-verifier, and role-guard.mjs blocks it when run directly (2026-10-31, kit 4.0.0); the hook firing inside a live subagent was not exercised)
