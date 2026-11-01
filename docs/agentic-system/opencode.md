# Using the agentic system in OpenCode

Roles start as native agents (the client's agent picker). Each role is the main conversation of its own session; start a new conversation for each one.

## Start a role

| To | Do this |
| --- | --- |
| Run a workflow | press Tab until `sd-orchestrator` is the active agent, then name the workflow: `DESIGN`, `FAST_IMPLEMENTATION` or `DOCUMENTATION` |
| Plan from a work item | select `sd-orchestrator` first, then invoke `plan-bug-from-id` or `plan-user-story-from-id` |
| Ask about the project | press Tab until `sd-ask` is the active agent |
| Build or update project knowledge | press Tab until `sd-knowledge-builder` is the active agent |

The orchestrator always asks which workflow you want when you have not said it, and asks before it creates or resumes a session.

## While a workflow runs

- The orchestrator stops at every halt point and waits for you: an interview question, a decision, or the design review.
- In `DESIGN`, the review document is written into the session's design folder under `agentic-system-sessions/`. Open it in a browser, then approve or ask for changes in the chat.
- Delegates run as native subagents, each with its own context. You see their verdicts in the conversation.
- Runtime commands run as `node agentic-system/bin/agentic-system.mjs <command>`. Allow them when the client asks.

## Verification

What Bootstrap verified for this client:

- Workflow skills: `.claude/skills`, reached natively (documented in the kit profile; .opencode/commands read the shared skill (2026-10-31, kit 3.0.1)).
- agents discovered, delegates hidden: verified-native (2026-10-31, kit 3.0.1)
- orchestrator starts with --agent sd-orchestrator and asks for the workflow type: verified-native (opencode run (2026-10-31, kit 3.0.1); TUI Tab selection not exercised)
- delegate runs in its own child session: verified-native (sd-design-verifier returned DELEGATE-OK (2026-10-31, kit 3.0.1))
- runtime command runs without an approval prompt: verified-native (2026-10-31, kit 3.0.1)
- commands read the shared skill; plan-* switch to sd-orchestrator: verified-fallback (through the session command API with a real read call (2026-10-31, kit 3.0.1); typing them in the TUI not exercised)
- skills hidden from the offered list: verified-native (absent from the list; the skill tool still loads one when asked by id, so automatic use is prevented but this is no security boundary (2026-10-31, kit 3.0.1))
- GitHub MCP: unverified (fails with HTTP 400 while GITHUB_PAT is unset; export it)
- Neon MCP and write denial: unverified (needs opencode mcp auth neon; deny rules confirmed as configuration only)
- roles and runtime on kit 4.0.0: unverified (the opencode run was declined on 2026-10-31; earlier results in this list are from kit 3.0.1)
- roles and runtime on kit 4.1.0: unverified (not run: re-verification was limited to Claude Code and Copilot CLI; the other OpenCode results are from older kits (2026-10-31, kit 4.1.0))
- plan-user-story-from-id loads the orchestrator from the default agent: verified-fallback (opencode run under the build agent with a prompt to read the skill: read .opencode/agents/sd-orchestrator.md and continued to the session question; no session created; the TUI and the plan-* commands not exercised (2026-11-01, kit 4.2.0))
- static install and runtime (verify.mjs) after the 4.2.2 upgrade: verified-native (shared check: verify.mjs passes on all three checks and agentic-system.mjs --help lists the commands; the opencode delegate binding now states the no-resume arm (2026-11-01, kit 4.2.2); not re-exercised in an opencode run)
