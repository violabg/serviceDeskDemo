# Claude Code Agent Bindings

Owner: claude-code (Claude Code 2.1.296 at installation). Load this file only in that environment, then load docs/agents/integration-policy.md for authority and evidence rules. These are configured assignments; generated-role execution remains unverified.

## Registration and invocation

- Each role is registered in `.claude/agents/demo-<role>-claude.md` with an enforced `tools` list and the complete role contract as its body. Run a role as the main session agent: `claude --agent demo-<role>-claude`. Automatic delegation to these roles is denied in `.claude/settings.json` (`Agent(demo-<role>-claude)`); the roles are user-invoked.
- Claude Code reads the root `AGENTS.md` natively when no `CLAUDE.md` exists; do not add a `CLAUDE.md`. Path-scoped rules load from `.claude/rules/`.
- Skills are discovered through `.claude/skills/<name>` links to the single `.agents/skills/<name>` source. The Bootstrap and Maintainer skills are `user-invocable-only` in `.claude/settings.json`: run them only through explicit `/bootstrap-agentic-system` or `/maintain-agentic-system`.

## Exact role tools

| Role | Tools |
| --- | --- |
| demo-planner-claude | `AskUserQuestion`, `Read`, `Grep`, `Glob`, `Edit`, `Write`, `Agent`, `WebFetch`, `mcp__github__issue_read`, `mcp__neon__list_docs_resources`, `mcp__neon__get_doc_resource`, `mcp__neon__get_database_tables`, `mcp__neon__describe_table_schema`, `mcp__neon__list_branches`, `mcp__neon__compare_database_schema`, `mcp__next-devtools__init`, `mcp__next-devtools__nextjs_docs`, `mcp__next-devtools__nextjs_index`, `mcp__next-devtools__nextjs_call` |
| demo-implementor-claude | `AskUserQuestion`, `Read`, `Grep`, `Glob`, `Edit`, `Write`, `Bash`, `mcp__github__issue_read`, `mcp__neon__list_docs_resources`, `mcp__neon__get_doc_resource`, `mcp__neon__get_database_tables`, `mcp__neon__describe_table_schema`, `mcp__neon__list_branches`, `mcp__neon__compare_database_schema`, `mcp__neon__prepare_database_migration`, `mcp__neon__run_sql`, `mcp__neon__complete_database_migration`, `mcp__next-devtools__init`, `mcp__next-devtools__nextjs_docs`, `mcp__next-devtools__nextjs_index`, `mcp__next-devtools__nextjs_call`, `mcp__next-devtools__browser_eval` |
| demo-direct-implementor-claude | `AskUserQuestion`, `Read`, `Grep`, `Glob`, `Edit`, `Write`, `Bash`, `Agent`, `mcp__github__issue_read`, `mcp__neon__list_docs_resources`, `mcp__neon__get_doc_resource`, `mcp__neon__get_database_tables`, `mcp__neon__describe_table_schema`, `mcp__neon__list_branches`, `mcp__neon__compare_database_schema`, `mcp__neon__prepare_database_migration`, `mcp__neon__run_sql`, `mcp__neon__complete_database_migration`, `mcp__next-devtools__init`, `mcp__next-devtools__nextjs_docs`, `mcp__next-devtools__nextjs_index`, `mcp__next-devtools__nextjs_call`, `mcp__next-devtools__browser_eval` |
| demo-integration-tester-claude | `AskUserQuestion`, `Read`, `Grep`, `Glob`, `Edit`, `Write`, `Bash`, `Agent` |
| demo-knowledge-builder-claude | `AskUserQuestion`, `Read`, `Grep`, `Glob`, `Edit`, `Write`, `Agent`, `WebFetch`, `mcp__neon__list_docs_resources`, `mcp__neon__get_doc_resource`, `mcp__neon__get_database_tables`, `mcp__neon__describe_table_schema`, `mcp__neon__list_branches`, `mcp__neon__compare_database_schema`, `mcp__next-devtools__init`, `mcp__next-devtools__nextjs_docs`, `mcp__next-devtools__nextjs_index`, `mcp__next-devtools__nextjs_call` |
| demo-ask-claude | `AskUserQuestion`, `Read`, `Grep`, `Glob`, `WebFetch`, `mcp__neon__list_docs_resources`, `mcp__neon__get_doc_resource`, `mcp__neon__get_database_tables`, `mcp__neon__describe_table_schema`, `mcp__neon__list_branches`, `mcp__neon__compare_database_schema`, `mcp__next-devtools__init`, `mcp__next-devtools__nextjs_docs`, `mcp__next-devtools__nextjs_index`, `mcp__next-devtools__nextjs_call` |

The `tools` list is enforced by Claude Code: Ask has no edit or shell tools, and Planner and Knowledge Builder have no shell. Path limits inside the granted edit tools (for example Planner writing only session artifacts) remain instruction boundaries.

## Operations named by shared contracts

| Operation | Claude Code binding |
| --- | --- |
| file-read | `Read` |
| file-search, file/path and text search, bounded native repository search | `Glob` for paths, `Grep` for text, scoped and excluding maintenance roots and session contents |
| file-edit | `Edit`, `Write`, within the role's authorized scope |
| terminal | `Bash` (Implementor, Direct Implementor, Integration Tester only) |
| image-read | `Read` on a local image path |
| web-fetch | `WebFetch` (Ask, Planner, Knowledge Builder). It returns page text, not image input: for a remote image, ask the user to save it locally |
| foreground question route | `AskUserQuestion` when the role runs as the main session agent; delegates cannot use it |
| default evidence delegation procedure | see Native operations below |
| GitHub `issue_read` | `mcp__github__issue_read` |
| GitHub `issue_write` | `mcp__github__issue_write` (main session, `manage-work-item` only) |

## Native operations

- Default evidence delegation uses `Agent` with `subagent_type: "general-purpose"` and a bounded prompt carrying the exact owning session ID, evidence scope, approved tools, exclusions and artifact output. Subagents cannot ask the user (`AskUserQuestion` is unavailable to them); they return questions to the parent, which asks and re-delegates with the answers. If `general-purpose` is not listed as callable, gather the same evidence inline under the approved 2026-10-08 fallback.
- MCP servers come from the project `.mcp.json` (`github`, `neon`, `context7`, `next-devtools`). The GitHub server authenticates with `Authorization: Bearer ${GITHUB_TOKEN}` from the Claude Code process environment; no credential is stored in the repository. Neon uses its OAuth login. Approve the project servers when Claude Code asks; tool presence alone is not proof of authentication.

## Tracker and bounded gathering

- GitHub read binding for role workflows: `mcp__github__issue_read` with methods `get`, `get_comments` and `get_labels`. Supply owner `violabg`, repo `serviceDeskDemo`, the exact numeric issue number and explicit pagination for all comments. Follow docs/agents/github-issues-adapter.md. These roles do not authorize search, listing or tracker writes.
- Use verified default evidence delegation where available. When delegation is unavailable or unverified, the user-approved 2026-10-08 fallback performs the exact same bounded planning evidence task inline, including current-session artifact persistence and directly linked dependency reads. Missing approved tracker access still stops retrieval. This does not authorize full-role delegation or extra issue access.
- Knowledge Builder discovery may use up to ten bounded evidence tasks within runtime concurrency limits under the procedure above; otherwise gather the same evidence inline. Preserve knowledge/index-only editing and owning-session boundaries.

## manage-work-item

Only when the user explicitly invokes `/manage-work-item` in the main Claude Code session: read with `mcp__github__issue_read` (`get`, `get_comments`) and write with `mcp__github__issue_write` (`method: create` for an approved new item; `method: update` for the approved per-field change after the re-read). The skill has `disable-model-invocation: true`, so Claude never starts it on its own. The main session can see `issue_write` outside this skill; using it anywhere else is prohibited by policy, not by configuration. Never retry a write automatically or switch to `gh` or another credential. `issue_write` accepts no image bytes; if the user requires an attachment, ask whether to proceed without it.

## Blocked source diagnostic operation

Diagnostics in demo-implementor and demo-integration-tester remain blocked by an inherited Copilot-only diagnostics call outside the source template's tooling slots. Do not invoke it or substitute an IDE-specific diagnostics tool. Use the validation commands with `Bash` for typecheck and lint evidence; the diagnostics gate itself stays blocked until the source contract gains an approved diagnostic binding.
