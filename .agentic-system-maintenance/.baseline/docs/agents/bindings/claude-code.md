# Claude Code Agent Bindings

Owner: claude-code (Claude Code 2.1.296 at installation). Load this file only in that environment, then load docs/agents/integration-policy.md for authority and evidence rules. These are configured assignments; generated-role execution remains unverified.

## Registration and invocation

- Claude Code uses the skill route: there are no Claude Code agents for the roles. Planner starts only through the planning skills `plan-bug-from-id` and `plan-user-story-from-id`, which load this binding and the complete Planner contract first. Every other role starts through its role skill, `.claude/skills/demo-<role>-claude/SKILL.md` (`demo-implementor-claude`, `demo-direct-implementor-claude`, `demo-integration-tester-claude`, `demo-knowledge-builder-claude`, `demo-ask-claude`). Each role skill sets `disable-model-invocation: true`, starts only in a new conversation, refuses when the conversation already runs a role, and loads this binding and the complete canonical role contract without copying or restating it. Role skills are Claude Code entrypoints, not configured shared skills.
- Copilot also discovers `.claude/skills/`, so it lists the `demo-<role>-claude` role skills; their guard stops them in any client other than Claude Code. The `-claude` suffix keeps them distinct from Copilot's `demo-<role>` agents.
- Claude Code reads the root `AGENTS.md` natively when no `CLAUDE.md` exists; do not add a `CLAUDE.md`. Path-scoped rules load from `.claude/rules/`.
- Skills are discovered through `.claude/skills/<name>` links to the single `.agents/skills/<name>` source. The Bootstrap and Maintainer skills are `user-invocable-only` in `.claude/settings.json`: run them only through explicit `/bootstrap-agentic-system` or `/maintain-agentic-system`.

## Role entrypoints and handoff

Every role runs as the main conversation of its own session; never start a role as a delegated subagent. Sources: https://code.claude.com/docs/en/skills and /sub-agents (retrieved 2026-10-13 and 2026-10-14). Status: on 2026-10-16 an interactive plain session in the VS Code extension (Claude Code 2.1.300), the session every role skill starts in, exposed `Read`, `Edit`, `Write`, `Bash`, `Agent`, `AskUserQuestion`, `Skill` and `ToolSearch`, with `WebFetch` and the project MCP tools loadable through `ToolSearch`, and no `Glob` or `Grep`. A plain interactive CLI session is not yet observed. Full role runs are not exercised.

- Start a role in a new conversation, in the CLI (`claude`, then the skill) or in the VS Code extension chat. The skill route works the same on both surfaces. Tool limits are instructions only on every surface; path limits inside granted tools are instructions too.
- One role per conversation. There is no documented in-session role switch: start a new conversation to change role. Do not set `agent` in `.claude/settings.json`, which would put every session under one role.
- Planner start step: in a new conversation, `/plan-user-story-from-id <issue-id>` or `/plan-bug-from-id <issue-id>`. The planning skill refuses inside a conversation that already runs a role; otherwise it loads this binding and the complete Planner contract, then plans. Planning without a work-item ID is not offered in Claude Code.
- Other roles: in a new conversation, `/demo-<role>-claude`, optionally followed by the first request.
- Implementor handoff step, after plan approval: start Implementor with fresh context in a new conversation with `/demo-implementor-claude Resume implementation for Planning Session <planning-session-id>`, with the approved Planning Session ID filled in. Never continue implementation in the planning conversation.

## Exact role tools

| Role | Tools |
| --- | --- |
| demo-planner | `AskUserQuestion`, `Read`, `Grep`, `Glob`, `Edit`, `Write`, `Agent`, `WebFetch`, `mcp__github__issue_read`, `mcp__neon__list_docs_resources`, `mcp__neon__get_doc_resource`, `mcp__neon__get_database_tables`, `mcp__neon__describe_table_schema`, `mcp__neon__list_branches`, `mcp__neon__compare_database_schema`, `mcp__next-devtools__init`, `mcp__next-devtools__nextjs_docs`, `mcp__next-devtools__nextjs_index`, `mcp__next-devtools__nextjs_call` |
| demo-implementor | `AskUserQuestion`, `Read`, `Grep`, `Glob`, `Edit`, `Write`, `Bash`, `mcp__github__issue_read`, `mcp__neon__list_docs_resources`, `mcp__neon__get_doc_resource`, `mcp__neon__get_database_tables`, `mcp__neon__describe_table_schema`, `mcp__neon__list_branches`, `mcp__neon__compare_database_schema`, `mcp__neon__prepare_database_migration`, `mcp__neon__run_sql`, `mcp__neon__complete_database_migration`, `mcp__next-devtools__init`, `mcp__next-devtools__nextjs_docs`, `mcp__next-devtools__nextjs_index`, `mcp__next-devtools__nextjs_call`, `mcp__next-devtools__browser_eval` |
| demo-direct-implementor | `AskUserQuestion`, `Read`, `Grep`, `Glob`, `Edit`, `Write`, `Bash`, `Agent`, `mcp__github__issue_read`, `mcp__neon__list_docs_resources`, `mcp__neon__get_doc_resource`, `mcp__neon__get_database_tables`, `mcp__neon__describe_table_schema`, `mcp__neon__list_branches`, `mcp__neon__compare_database_schema`, `mcp__neon__prepare_database_migration`, `mcp__neon__run_sql`, `mcp__neon__complete_database_migration`, `mcp__next-devtools__init`, `mcp__next-devtools__nextjs_docs`, `mcp__next-devtools__nextjs_index`, `mcp__next-devtools__nextjs_call`, `mcp__next-devtools__browser_eval` |
| demo-integration-tester | `AskUserQuestion`, `Read`, `Grep`, `Glob`, `Edit`, `Write`, `Bash`, `Agent` |
| demo-knowledge-builder | `AskUserQuestion`, `Read`, `Grep`, `Glob`, `Edit`, `Write`, `Agent`, `WebFetch`, `mcp__neon__list_docs_resources`, `mcp__neon__get_doc_resource`, `mcp__neon__get_database_tables`, `mcp__neon__describe_table_schema`, `mcp__neon__list_branches`, `mcp__neon__compare_database_schema`, `mcp__next-devtools__init`, `mcp__next-devtools__nextjs_docs`, `mcp__next-devtools__nextjs_index`, `mcp__next-devtools__nextjs_call` |
| demo-ask | `AskUserQuestion`, `Read`, `Grep`, `Glob`, `WebFetch`, `mcp__neon__list_docs_resources`, `mcp__neon__get_doc_resource`, `mcp__neon__get_database_tables`, `mcp__neon__describe_table_schema`, `mcp__neon__list_branches`, `mcp__neon__compare_database_schema`, `mcp__next-devtools__init`, `mcp__next-devtools__nextjs_docs`, `mcp__next-devtools__nextjs_index`, `mcp__next-devtools__nextjs_call` |

Each row is that role's own tool limit, kept by instruction: Claude Code does not enforce it on the skill route. Ask has no edit or shell use, and Planner and Knowledge Builder have no shell use, except as follows. Environment-level binding (user-approved 2026-10-16): every role runs in a plain session, which has no `Glob` or `Grep`, so the rows' `Glob` and `Grep` are replaced by the read-only `Bash` search in the operations table below. For Planner, Knowledge Builder and Ask, that search is their only allowed `Bash` use. Tools the plain session exposes outside a role's row, such as other MCP tools, do not widen that role's authority. Path limits inside the granted edit tools (for example Planner writing only session artifacts) remain instruction boundaries.

## Operations named by shared contracts

| Operation | Claude Code binding |
| --- | --- |
| file-read | `Read` |
| file-search, file/path and text search, bounded native repository search | The plain session has no `Glob` or `Grep`, so use `Bash` only for read-only search: paths with `find <dirs> \( -name .git -o -name node_modules -o -name .next -o -name sessions -o -name .agentic-system-maintenance -o -name bootstrap-agentic-system -o -name maintain-agentic-system \) -prune -o -type f -name '<glob>' -print`, text with `grep -rnI --exclude-dir={.git,node_modules,.next,sessions,.agentic-system-maintenance,bootstrap-agentic-system,maintain-agentic-system} -e '<pattern>' <dirs>`. To list the current Planning Session, start at `sessions/<planning-session-id>/` directly. Searches stay scoped and exclude maintenance roots and other sessions' contents |
| file-edit | `Edit`, `Write`, within the role's authorized scope |
| session memory and event log | `Edit` or `Write` appending to `sessions/<planning-session-id>/session-memory.md` (`#capability:session-memory-append`) and `session-log.md` (`#capability:session-event-log`). These are what role contracts mean by "agent memory", "update memory" and "log". Claude Code's own memory directory (`~/.claude/projects/<project>/memory/`, `MEMORY.md`) is never a role's agent memory |
| terminal | `Bash` (Implementor, Direct Implementor, Integration Tester only). Any role may also use `Bash` for the read-only search above, and nothing else |
| deferred tools | `WebFetch` and the project MCP tools may be listed only by name in a plain session. Load each with `ToolSearch` (`select:<tool-name>`) before its first call; loading a tool does not widen the role's row |
| image-read | `Read` on a local image path |
| image-inspection procedure | Planner and Direct Implementor: approved haiku delegate, see Native operations below. Roles without `Agent`: inline `Read` |
| web-fetch | `WebFetch` (Ask, Planner, Knowledge Builder). It returns page text, not image input: for a remote image, ask the user to save it locally |
| foreground question route | `AskUserQuestion` in the role's main conversation (present in the interactive VS Code extension session, 2026-10-16); delegates cannot use it. One call takes at most 4 questions, each with 2–4 options plus an automatic free-text Other. For a larger batch, keep the full batch in one chat message and collect answers in consecutive calls of up to 4, in batch order. If the tool is absent in the session, ask the batch in chat only |
| default evidence delegation procedure | see Native operations below |
| GitHub `issue_read` | `mcp__github__issue_read` |
| GitHub `issue_write` | `mcp__github__issue_write` (main session, `manage-work-item` only) |

## Native operations

- Default evidence delegation uses `Agent` with `subagent_type: "general-purpose"` and a bounded prompt carrying the exact owning session ID, evidence scope, approved tools, exclusions and artifact output. Subagents cannot ask the user (`AskUserQuestion` is unavailable to them); they return questions to the parent, which asks and re-delegates with the answers. If `general-purpose` is not listed as callable, gather the same evidence inline under the approved 2026-10-08 fallback. Check this before running any evidence task inline: "unavailable or unverified" in the planning skills means only that this check failed. Record in `session-log.md` whether the task ran delegated or inline, and why.
- MCP servers come from the project `.mcp.json` (`github`, `neon`, `context7`, `next-devtools`). The GitHub server authenticates with `Authorization: Bearer ${GITHUB_TOKEN}` from the Claude Code process environment; no credential is stored in the repository. Neon uses its OAuth login. Approve the project servers when Claude Code asks; tool presence alone is not proof of authentication.
- Image inspection (user-approved 2026-10-13): Planner and Direct Implementor hand each image to `Agent` with `subagent_type: "general-purpose"` and `model: "haiku"`. The prompt carries the owning Planning Session ID, the local image path, the request context and the visual-evidence sections from docs/agents/integration-policy.md. The delegate reads the image with `Read`, writes no files and returns the artifact text. The calling role checks it, writes the Markdown artifact itself and records `Inspected by: general-purpose subagent, model haiku`. If `Agent` or `general-purpose` is unavailable, or the model cannot be passed (for example when `CLAUDE_CODE_SUBAGENT_MODEL_FORCE` is set), inspect inline with `Read` and record the role as inspector. `WebFetch` returns page text, not image input: for a remote image, ask the user to save it locally.

## Tracker and bounded gathering

- GitHub read binding for role workflows: `mcp__github__issue_read` with methods `get`, `get_comments` and `get_labels`. Supply owner `violabg`, repo `serviceDeskDemo`, the exact numeric issue number and explicit pagination for all comments. Follow docs/agents/github-issues-adapter.md. These roles do not authorize search, listing or tracker writes.
- Use verified default evidence delegation where available. When delegation is unavailable or unverified, the user-approved 2026-10-08 fallback performs the exact same bounded planning evidence task inline, including current-session artifact persistence and directly linked dependency reads. Missing approved tracker access still stops retrieval. This does not authorize full-role delegation or extra issue access.
- Knowledge Builder discovery may use up to ten bounded evidence tasks within runtime concurrency limits under the procedure above; otherwise gather the same evidence inline. Preserve knowledge/index-only editing and owning-session boundaries.

## manage-work-item

Only when the user explicitly invokes `/manage-work-item` in the main Claude Code session: read with `mcp__github__issue_read` (`get`, `get_comments`) and write with `mcp__github__issue_write` (`method: create` for an approved new item; `method: update` for the approved per-field change after the re-read). The skill has `disable-model-invocation: true`, so Claude never starts it on its own. The main session can see `issue_write` outside this skill; using it anywhere else is prohibited by policy, not by configuration. Never retry a write automatically or switch to `gh` or another credential. `issue_write` accepts no image bytes; if the user requires an attachment, ask whether to proceed without it.

## Blocked source diagnostic operation

Diagnostics in demo-implementor and demo-integration-tester remain blocked by an inherited Copilot-only diagnostics call outside the source template's tooling slots. Do not invoke it or substitute an IDE-specific diagnostics tool. Use the validation commands with `Bash` for typecheck and lint evidence; the diagnostics gate itself stays blocked until the source contract gains an approved diagnostic binding.
