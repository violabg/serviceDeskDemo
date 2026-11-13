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

Two habits keep a run cheap, because everything loaded at the start is carried on every turn:

- Start the role or the planning skill directly. Do not ask the agent to load the repository's skills first: each skill loads its own role and nothing else is needed.
- Run the session without tool servers the roles do not use. Their tool definitions are sent on every turn whether or not a tool is called.

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
- static install and runtime (verify.mjs) after the 5.0.0 upgrade: verified-native (shared check: verify.mjs passes on all three checks and a repeated plan reports nothing to do; sd-ask.md lost the knowledge-create and knowledge-update arguments it may no longer run (2026-11-01, kit 5.0.0); not re-exercised in an opencode run)
- edit deny on knowledge/** in the five opencode agents: verified-fallback (rendered as edit: { '*': allow, 'knowledge/**': deny } and reported by the installer; configuration only, not exercised in an opencode run, where the runtime guard verified on the shared code is the layer that was checked (2026-11-01, kit 5.0.0))
- static install and runtime (verify.mjs) after the 5.1.0 upgrade: verified-native (shared check: verify.mjs passes on all three checks and a repeated plan reports nothing to do; sd-orchestrator.md gained the sentence that a delegate report comes back on its own, and plan-user-story-from-id / plan-bug-from-id keep the repository OpenCode routing line that reads the role contract instead of asking for the Tab selection (2026-11-01, kit 5.1.0); not re-exercised in an opencode run)
- static install and runtime (verify.mjs) after the 6.0.0 upgrade: verified-native (upgrade 5.1.0 -> 6.0.0: 38 updated, 10 created, 11 deleted, 46 unchanged, no merge or conflict; a repeated plan reports 94 unchanged. verify.mjs passes on all three checks. agentic-system.mjs --help lists design-contracts, design-file-system, design-operations and no longer design-submit, design-open-points, design-implementation-context or session-execution-report-read (shared check, 2026-11-09, kit 6.0.0); not re-exercised in a opencode run)
- static install and runtime (verify.mjs) after the 6.1.0 upgrade: verified-native (upgrade 6.0.0 -> 6.1.0: 32 updated, 2 created, 2 skills merged (the kit only dropped the alternative spellings from the session-artifact-write argument line; the repository kept its GitHub Copilot and OpenCode routing lines), 60 unchanged, no conflict; a repeated plan reports 96 unchanged. verify.mjs passes on all three checks. The edit, kept-request and snapshot-filter behaviours were exercised on the shared runtime from the shell (scratch session, deleted afterwards) (shared check, 2026-11-11, kit 6.1.0); not re-exercised in an opencode run)
- static install and runtime (verify.mjs) after the 6.2.0 upgrade: verified-native (upgrade 6.1.0 -> 6.2.0: 21 updated, 2 skills merged (the kit only added the allowed characters to the name of session-artifact-write; the repository kept its GitHub Copilot and OpenCode routing lines), 73 unchanged, no conflict; a repeated plan reports 96 unchanged. verify.mjs passes on all three checks. pnpm lint 0 errors (10 pre-existing warnings), typecheck clean, 327 tests passed. config.json records partLimits 24000 for claude-code and opencode. Scratch session scratchupgrade620 (deleted afterwards), DESIGN job run from the shell: workflow-step-pending without --client answered Instruction 1 in parts (6,346 bytes, then part 2), with --client claude-code it answered the whole instruction in one call (8,296 bytes), and an unknown client id fell back to the parts; --help shows the name characters of session-artifact-write and the id hint of edit. --client opencode itself was not run (shared check, 2026-11-11, kit 6.2.0); not re-exercised in an opencode run)
- static install and runtime (verify.mjs) after the 7.0.0 upgrade: verified-native (upgrade 6.2.1 -> 7.0.0: 22 updated, 24 created, 22 deleted, no merge or conflict; a repeated plan reports nothing to do. verify.mjs passes on all three checks. pnpm lint 0 errors (12 warnings), typecheck clean, 327 tests passed. Scratch session scratchupgrade700 (deleted afterwards), jobs run from the shell: DESIGN serves Instruction 1/10, FAST_IMPLEMENTATION 1/4, DOCUMENTATION 1/7; codebase-clusters --help names matches and design-operations --help names instructionsPatch; the matches ordering, an instructionsPatch write, the operation-without-obligations warning and the FAST_IMPLEMENTATION knowledge compliance gate were not exercised. (shared check, 2026-11-12, kit 7.0.0); not re-exercised in an opencode run)
- explorer delegate (new role in kit 7.0.0): unverified (.opencode/agents/sd-explorer.md is installed; starting explorers from sd-orchestrator was not run. The kit changelog says the orchestrator delegate list, which OpenCode enforces, leaves out documentation-reviewer, so the DOCUMENTATION review step cannot start it; not exercised (2026-11-12, kit 7.0.0))
- static install and runtime (verify.mjs) after the 7.0.1 upgrade: verified-native (upgrade 7.0.0 -> 7.0.1: 3 updated (config.json partLimit 7000 -> 18000, contracts/projections.md, workflows/design/08-design-review.md), 0 merged, 0 conflicts, answers unchanged; a repeated plan reports 98 unchanged and nothing to do. verify.mjs passes on all three checks; the runtime starts (--help) and config.json carries partLimit 18000. pnpm lint/typecheck/test not run: no product code and no tooling exclusion changed. opencode run --agent sd-orchestrator served the three workflow types and asked the first question (2026-11-13, kit 7.0.1); the DESIGN step 8 read before a correction was not exercised.)
