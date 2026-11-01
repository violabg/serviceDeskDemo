# Using the agentic system in GitHub Copilot (VS Code and CLI)

Roles start as native agents (the client's agent picker). Each role is the main conversation of its own session; start a new conversation for each one.

## Start a role

| To | Do this |
| --- | --- |
| Run a workflow | select `sd-orchestrator` in the Chat view's agent picker (VS Code), or run `copilot --agent sd-orchestrator` (CLI), then name the workflow: `DESIGN`, `FAST_IMPLEMENTATION` or `DOCUMENTATION` |
| Plan from a work item | select `sd-orchestrator` first, then invoke `plan-bug-from-id` or `plan-user-story-from-id` |
| Ask about the project | select `sd-ask` in the Chat view's agent picker (VS Code), or run `copilot --agent sd-ask` (CLI) |
| Build or update project knowledge | select `sd-knowledge-builder` in the Chat view's agent picker (VS Code), or run `copilot --agent sd-knowledge-builder` (CLI) |

The orchestrator always asks which workflow you want when you have not said it, and asks before it creates or resumes a session.

## While a workflow runs

- The orchestrator stops at every halt point and waits for you: an interview question, a decision, or the design review.
- In `DESIGN`, the review document is written into the session's design folder under `agentic-system-sessions/`. Open it in a browser, then approve or ask for changes in the chat.
- Delegates run as native subagents, each with its own context. You see their verdicts in the conversation.
- Runtime commands run as `node agentic-system/bin/agentic-system.mjs <command>`. Allow them when the client asks.

## Verification

What Bootstrap verified for this client:

- Workflow skills: `.claude/skills`, reached natively (CLI: copilot skill list shows each skill once (2026-10-31, kit 3.0.1). VS Code: documented for Local sessions; the Copilot harness lists only .github/skills and is unverified).
- orchestrator starts from the agent picker and asks for the workflow type: unverified (needs a Copilot Chat session)
- session created through the runtime from the role: unverified (needs a Copilot Chat session)
- delegate runs in its own context and resolves to .github/agents (not .claude/agents duplicate): unverified (needs a Copilot Chat session)
- work item read (github/issue_read): unverified (Copilot GitHub sign-in not checked)
- visual evidence: unverified (needs a Copilot Chat session)
- CLI: orchestrator starts with copilot --agent and asks for the workflow type: verified-native (copilot -p --agent sd-orchestrator (2026-10-31, kit 4.1.0))
- CLI: delegate runs in its own context: verified-native (sd-design-verifier returned DELEGATE-OK (2026-10-31, kit 4.1.0))
- CLI: tool list enforcement (docs describe strict-tools-list; the installer does not set it): verified-native (sd-ask had no create or edit tool; no file written (2026-10-31, kit 3.0.1))
- CLI: runtime command approval: verified-fallback (workflow-types-list ran under copilot -p with --allow-tool shell(node:*), which is a wider grant than the runtime alone; interactive approval not exercised (2026-10-31, kit 4.1.0))
- VS Code reads the shared .claude/skills in its Copilot harness: unverified (docs name only .github/skills for that harness; if it fails, add .github/skills symlinks)
- CLI: skills resolve to the one .claude/skills copy: verified-native (copilot skill list shows each workflow and role skill once (2026-10-31, kit 4.1.0))
- CLI: plan-bug-from-id loads the orchestrator with no agent selected: verified-fallback (copilot -p with no --agent and a work item id: read .github/agents/sd-orchestrator.agent.md and continued to the session question; no session created. In a run without an id, the model found the slash name by file search, so native skill resolution under -p is not proven, and it stopped on the missing id before loading the contract; interactive CLI and VS Code not exercised (2026-11-01, kit 4.2.0))
- static install and runtime (verify.mjs) after the 5.0.0 upgrade: verified-native (shared check: verify.mjs passes on all three checks and a repeated plan reports nothing to do; sd-ask.agent.md lost the knowledge-create and knowledge-update arguments it may no longer run (2026-11-01, kit 5.0.0); no Copilot session re-exercised)
- knowledge path deny on kit 5.0.0: verified-fallback (the installer renders no path deny for this client and warns about it; the guard it relies on (workflow-step-next refusing a knowledge change) was verified on the shared runtime from the Claude Code environment (2026-11-01, kit 5.0.0))
- static install and runtime (verify.mjs) after the 5.1.0 upgrade: verified-native (shared check: verify.mjs passes on all three checks and a repeated plan reports nothing to do; sd-orchestrator.agent.md gained the sentence that a delegate report comes back on its own, and plan-user-story-from-id / plan-bug-from-id keep the repository routing line that reads the role contract instead of asking for the agent picker (2026-11-01, kit 5.1.0); no Copilot session re-exercised)
