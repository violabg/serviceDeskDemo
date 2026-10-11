# Codex Agent Bindings

Owner: codex. Load this file only in that environment, then load docs/agents/integration-policy.md for authority and evidence rules. These are configured assignments; generated-role execution remains unverified.

## Exact role tools

| Role | Tools |
| --- | --- |
| demo-planner | `functions.exec`, `collaboration.spawn_agent`, `collaboration.send_message`, `collaboration.wait_agent`, `mcp__github__issue_read`, `mcp__neon__list_docs_resources`, `mcp__neon__get_doc_resource`, `mcp__neon__get_database_tables`, `mcp__neon__describe_table_schema`, `mcp__neon__list_branches`, `mcp__neon__compare_database_schema`, `mcp__next_devtools__init`, `mcp__next_devtools__nextjs_docs`, `mcp__next_devtools__nextjs_index`, `mcp__next_devtools__nextjs_call` |
| demo-implementor | `functions.exec`, `mcp__github__issue_read`, `mcp__neon__list_docs_resources`, `mcp__neon__get_doc_resource`, `mcp__neon__get_database_tables`, `mcp__neon__describe_table_schema`, `mcp__neon__list_branches`, `mcp__neon__compare_database_schema`, `mcp__neon__prepare_database_migration`, `mcp__neon__run_sql`, `mcp__neon__complete_database_migration`, `mcp__next_devtools__init`, `mcp__next_devtools__nextjs_docs`, `mcp__next_devtools__nextjs_index`, `mcp__next_devtools__nextjs_call`, `mcp__next_devtools__browser_eval` |
| demo-direct-implementor | `functions.exec`, `collaboration.spawn_agent`, `collaboration.send_message`, `collaboration.wait_agent`, `mcp__github__issue_read`, `mcp__neon__list_docs_resources`, `mcp__neon__get_doc_resource`, `mcp__neon__get_database_tables`, `mcp__neon__describe_table_schema`, `mcp__neon__list_branches`, `mcp__neon__compare_database_schema`, `mcp__neon__prepare_database_migration`, `mcp__neon__run_sql`, `mcp__neon__complete_database_migration`, `mcp__next_devtools__init`, `mcp__next_devtools__nextjs_docs`, `mcp__next_devtools__nextjs_index`, `mcp__next_devtools__nextjs_call`, `mcp__next_devtools__browser_eval` |
| demo-integration-tester | `functions.exec`, `collaboration.spawn_agent`, `collaboration.send_message`, `collaboration.wait_agent` |
| demo-knowledge-builder | `functions.exec`, `collaboration.spawn_agent`, `collaboration.send_message`, `collaboration.wait_agent`, `mcp__neon__list_docs_resources`, `mcp__neon__get_doc_resource`, `mcp__neon__get_database_tables`, `mcp__neon__describe_table_schema`, `mcp__neon__list_branches`, `mcp__neon__compare_database_schema`, `mcp__next_devtools__init`, `mcp__next_devtools__nextjs_docs`, `mcp__next_devtools__nextjs_index`, `mcp__next_devtools__nextjs_call` |
| demo-ask | `functions.exec`, `mcp__neon__list_docs_resources`, `mcp__neon__get_doc_resource`, `mcp__neon__get_database_tables`, `mcp__neon__describe_table_schema`, `mcp__neon__list_branches`, `mcp__neon__compare_database_schema`, `mcp__next_devtools__init`, `mcp__next_devtools__nextjs_docs`, `mcp__next_devtools__nextjs_index`, `mcp__next_devtools__nextjs_call` |

## Operations named by shared contracts

| Operation | Codex binding |
| --- | --- |
| file-read | `functions.exec` with `tools.exec_command` for bounded targeted reads |
| file-search, file/path and text search, bounded native repository search | `functions.exec` with `tools.exec_command`: `rg --files` and `rg`, scoped and excluding maintenance roots and session contents |
| file-edit | `functions.exec` with `tools.apply_patch`, within the role's authorized scope |
| terminal | `functions.exec` with `tools.exec_command` (Implementor, Direct Implementor, Integration Tester only) |
| image-read | `tools.view_image` on a local image path |
| web-fetch | `tools.web__run` for documentation and publicly readable URLs |
| foreground question route | the user-facing chat channel |
| default evidence delegation procedure | see Delegation below |
| GitHub `issue_read` | `mcp__github__issue_read` |
| GitHub `issue_write` | `mcp__github__issue_write` (default agent, `manage-work-item` only) |

Inspect the active native wrappers before use; CLI and other Codex clients may differ. Do not invent identifiers.

## Native operations

- Foreground questions use the user-facing chat channel. Delegates return questions to the parent. Source editor capabilities never authorize global settings, extensions or work outside the approved role.
- The inspected host's default delegation call is `collaboration.spawn_agent` with task_name and message, with optional fork_turns. Receive results through `collaboration.wait_agent` or messages; send bounded follow-ups through `collaboration.send_message`. Pass the exact owning session ID, evidence scope, approved tools and artifact output. Do not invent selector arguments; custom roles are callable only after client discovery lists them.
- GitHub uses the GitHub MCP server at `https://api.githubcopilot.com/mcp/`. Its bearer token comes from the `GITHUB_TOKEN` environment variable of the Codex process (`bearer_token_env_var`); no credential is stored in the repository. Each role layer in `.codex/agents/` repeats the endpoint and applies its own `enabled_tools`; only Planner, Implementor and Direct Implementor enable `issue_read`. The `github` Codex App connector is disabled in every role (`default_tools_enabled = false`). The project `.codex/config.toml` (trusted projects only) enables `issue_read` and `issue_write` for the default agent.
- Neon is configured in the Codex user config at `https://mcp.neon.tech/mcp` with OAuth and a nine-tool allowlist matching the workflow operations in the policy. Each role layer repeats the endpoint and applies its own narrower `enabled_tools`. A fresh Codex CLI process called `neon.list_branches` for the linked project on 2026-10-08. Allow time for MCP startup before treating an initially missing tool as unavailable.

## Tracker and bounded gathering

- GitHub read binding for role workflows: `mcp__github__issue_read` with methods `get`, `get_comments` and `get_labels`. Supply owner `violabg`, repo `serviceDeskDemo`, the exact numeric issue number and explicit pagination for all comments. Follow docs/agents/github-issues-adapter.md. These roles do not authorize search, listing or tracker writes.
- Use verified default evidence delegation where available. When delegation is unavailable or unverified, the user-approved 2026-10-08 fallback performs the exact same bounded planning evidence task inline, including current-session artifact persistence and directly linked dependency reads. Missing approved tracker access still stops retrieval. This does not authorize full-role delegation or extra issue access.
- Knowledge Builder discovery may use up to ten bounded evidence tasks within runtime concurrency limits under the inspected default procedure; otherwise gather the same evidence inline. Preserve knowledge/index-only editing and owning-session boundaries.

## manage-work-item

Only when the user explicitly invokes `manage-work-item` in the default Codex agent: read with `mcp__github__issue_read` (`get`, `get_comments`) and write with `mcp__github__issue_write` (`method: create` for an approved new item; `method: update` for the approved per-field change after the re-read). Check that the tool is listed and authenticated before proposing; if it is missing or returns an authorization error, stop and report the setup step (`GITHUB_TOKEN` available to Codex, MCP reload). Never retry a write automatically, switch to the Codex App connector or the `gh` CLI, or broaden credentials. Attachments are not supported by `issue_write`; if the user requires one, ask whether to proceed without it.

## Blocked source diagnostic operation

Diagnostics in demo-implementor and demo-integration-tester remain blocked by an inherited Copilot-only diagnostics call outside the source template's tooling slots. Do not invoke that unavailable operation or invent a substitute. The affected source contract must gain an approved diagnostic binding before those workflow gates can pass. Planning gathering and the approved inline fallback are unaffected.
