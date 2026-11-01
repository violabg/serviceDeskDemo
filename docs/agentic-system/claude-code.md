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
- static install and runtime (verify.mjs): verified-native (no drift, runtime serves the three workflows, sessions folder reachable; upgrade 4.2.1 -> 4.2.2 kept 89 files unchanged, updated 6, then pnpm lint (0 errors, 12 pre-existing warnings), typecheck and 251 tests passed (2026-11-01, kit 4.2.2))
- work item read (issue_read get/get_labels/get_comments): verified-fallback (exercised in the VS Code extension from the Bootstrap session on #6, not yet from inside sd-orchestrator)
- session created through the runtime from the role: verified-native (headless claude -p: /sd-orchestrator created a disposable session, removed afterwards; IDE surface not exercised (2026-10-31, kit 4.1.0))
- delegate runs in its own context (sd-design-verifier): verified-native (headless claude -p: the delegate ran and returned its own report (2026-10-31, kit 4.1.0))
- role skill refuses inside a running role: verified-native (headless: /sd-ask refused in a resumed /sd-orchestrator conversation (2026-10-31, kit 4.1.0))
- visual evidence: unverified (needs a new session)
- terminal surface GitHub MCP: unverified (GITHUB_PAT not exported in the login shell; export it before launching claude in a terminal)
- review document (redesigned page): unverified (asset design-review.html updated to the 2.0.x design on 2026-10-28; the rendered page is checked in a DESIGN run)
- shared skill /plan-bug-from-id: verified-native (invoked by name in headless claude -p (2026-10-31, kit 3.0.1); hidden from the model by disable-model-invocation, as intended)
- orchestrator starts via /sd-orchestrator and asks for the workflow type: verified-native (headless claude -p; IDE surface not exercised (2026-10-31, kit 4.1.0))
- runtime-only delegate is refused outside its role: verified-fallback (in claude -p the delegate declined design-approve by its instructions, so the hook did not fire; role-guard.mjs run directly blocks another role command, chaining, pipes and a command after a heredoc, and allows its own command and a heredoc. A 6-part knowledge-read reached the shell part by part, run directly rather than through a delegate (2026-10-31, kit 4.1.0))
- plan-bug-from-id loads the orchestrator with no role selected: verified-native (headless claude -p with a work item id: read .claude/skills/sd-orchestrator/SKILL.md, then listed sessions and workflows and asked for a session; no session created; IDE surface not exercised (2026-11-01, kit 4.2.0))
- knowledge guard and single writer (kit 5.0.0): verified-native (scratch session scratchupgrade500, DOCUMENTATION job, deleted afterwards: the job recorded knowledgeBaseline for 13 files; a test file added under knowledge/ made workflow-step-next refuse without advancing and name it; deleting the file let it advance to 2/8; knowledge-create --role ask is refused. pnpm lint (0 errors, 12 pre-existing warnings), typecheck and 256 tests passed; the three previously kept knowledge-guard files were taken from the kit, so no kept customization remains there except the two plan-* skills (2026-11-01, kit 5.0.0))
- Claude Code project path deny Edit(/knowledge/**): verified-fallback (rendered in .claude/settings.json and reported by the installer; configuration only, not exercised in a Claude Code session, where the runtime guard above is the layer that was verified (2026-11-01, kit 5.0.0))
