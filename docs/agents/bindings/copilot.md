# Copilot Agent Bindings

Owner: copilot. Load this file only in that environment, then load docs/agents/integration-policy.md for authority and evidence rules. These are configured assignments; generated-role execution remains unverified.

## Role entrypoints and handoff

Every role runs as the main conversation of its own chat; never start a role as a delegated subagent. Source: https://code.visualstudio.com/docs/copilot/customization/custom-agents (retrieved 2026-10-13). Status: documented, not exercised in this repository.

- Start a role: open the Chat view, choose `demo-<role>` in the **Agent** dropdown, then send the request. Never invoke a `demo-*-claude` skill. The `tools` frontmatter limits the role's tool picker; path limits inside granted tools remain instructions. Whether a selected agent stays active for a whole chat, and how a chat switches role, are not documented: start a new chat to change role.
- Planner start step: open a new chat and choose `demo-planner` in the Agent dropdown. Role-bound skills: in that chat, run `/plan-user-story-from-id <issue-id>` or `/plan-bug-from-id <issue-id>`; in any other chat, stop and give this start step.
- Implementor handoff step, after plan approval: open a new chat (**New Chat**), choose `demo-implementor` in the Agent dropdown, and send `Resume implementation for Planning Session <planning-session-id>` with the approved Planning Session ID filled in. No documented way starts a chat with an agent and a prompt together. Do not use agent `handoffs` buttons: they switch agents with the planning conversation's context, which breaks the fresh-context rule.

## Exact role tools

| Role | Tools |
| --- | --- |
| demo-planner | `vscode/askQuestions`, `read/readFile`, `search/fileSearch`, `search/listDirectory`, `search/textSearch`, `search/usages`, `edit/createDirectory`, `edit/createFile`, `edit/editFiles`, `edit/rename`, `agent`, `web/fetch`, `github/issue_read`, `neondatabase/mcp-server-neon/list_docs_resources`, `neondatabase/mcp-server-neon/get_doc_resource`, `neondatabase/mcp-server-neon/get_database_tables`, `neondatabase/mcp-server-neon/describe_table_schema`, `neondatabase/mcp-server-neon/list_branches`, `neondatabase/mcp-server-neon/compare_database_schema`, `io.github.vercel/next-devtools-mcp/init`, `io.github.vercel/next-devtools-mcp/nextjs_docs`, `io.github.vercel/next-devtools-mcp/nextjs_index`, `io.github.vercel/next-devtools-mcp/nextjs_call` |
| demo-implementor | `vscode/askQuestions`, `read/readFile`, `search/fileSearch`, `search/listDirectory`, `search/textSearch`, `search/usages`, `edit/createDirectory`, `edit/createFile`, `edit/editFiles`, `edit/rename`, `execute/runInTerminal`, `execute/getTerminalOutput`, `read/problems`, `vscode/installExtension`, `vscode/newWorkspace`, `vscode/runCommand`, `read/terminalSelection`, `read/terminalLastCommand`, `agent`, `github/issue_read`, `neondatabase/mcp-server-neon/list_docs_resources`, `neondatabase/mcp-server-neon/get_doc_resource`, `neondatabase/mcp-server-neon/get_database_tables`, `neondatabase/mcp-server-neon/describe_table_schema`, `neondatabase/mcp-server-neon/list_branches`, `neondatabase/mcp-server-neon/compare_database_schema`, `neondatabase/mcp-server-neon/prepare_database_migration`, `neondatabase/mcp-server-neon/run_sql`, `neondatabase/mcp-server-neon/complete_database_migration`, `io.github.vercel/next-devtools-mcp/init`, `io.github.vercel/next-devtools-mcp/nextjs_docs`, `io.github.vercel/next-devtools-mcp/nextjs_index`, `io.github.vercel/next-devtools-mcp/nextjs_call`, `io.github.vercel/next-devtools-mcp/browser_eval` |
| demo-direct-implementor | `vscode/askQuestions`, `read/readFile`, `search/fileSearch`, `search/listDirectory`, `search/textSearch`, `search/usages`, `edit/createDirectory`, `edit/createFile`, `edit/editFiles`, `edit/rename`, `execute/runInTerminal`, `execute/getTerminalOutput`, `read/problems`, `vscode/installExtension`, `vscode/newWorkspace`, `vscode/runCommand`, `read/terminalSelection`, `read/terminalLastCommand`, `agent`, `github/issue_read`, `neondatabase/mcp-server-neon/list_docs_resources`, `neondatabase/mcp-server-neon/get_doc_resource`, `neondatabase/mcp-server-neon/get_database_tables`, `neondatabase/mcp-server-neon/describe_table_schema`, `neondatabase/mcp-server-neon/list_branches`, `neondatabase/mcp-server-neon/compare_database_schema`, `neondatabase/mcp-server-neon/prepare_database_migration`, `neondatabase/mcp-server-neon/run_sql`, `neondatabase/mcp-server-neon/complete_database_migration`, `io.github.vercel/next-devtools-mcp/init`, `io.github.vercel/next-devtools-mcp/nextjs_docs`, `io.github.vercel/next-devtools-mcp/nextjs_index`, `io.github.vercel/next-devtools-mcp/nextjs_call`, `io.github.vercel/next-devtools-mcp/browser_eval` |
| demo-integration-tester | `vscode/askQuestions`, `read/readFile`, `search/fileSearch`, `search/listDirectory`, `search/textSearch`, `search/usages`, `edit/createDirectory`, `edit/createFile`, `edit/editFiles`, `edit/rename`, `execute/runInTerminal`, `execute/getTerminalOutput`, `read/problems`, `agent` |
| demo-knowledge-builder | `vscode/askQuestions`, `read/readFile`, `search/fileSearch`, `search/listDirectory`, `search/textSearch`, `search/usages`, `edit/createDirectory`, `edit/createFile`, `edit/editFiles`, `edit/rename`, `agent`, `web/fetch`, `neondatabase/mcp-server-neon/list_docs_resources`, `neondatabase/mcp-server-neon/get_doc_resource`, `neondatabase/mcp-server-neon/get_database_tables`, `neondatabase/mcp-server-neon/describe_table_schema`, `neondatabase/mcp-server-neon/list_branches`, `neondatabase/mcp-server-neon/compare_database_schema`, `io.github.vercel/next-devtools-mcp/init`, `io.github.vercel/next-devtools-mcp/nextjs_docs`, `io.github.vercel/next-devtools-mcp/nextjs_index`, `io.github.vercel/next-devtools-mcp/nextjs_call` |
| demo-ask | `vscode/askQuestions`, `read/readFile`, `search/fileSearch`, `search/listDirectory`, `search/textSearch`, `search/usages`, `web/fetch`, `neondatabase/mcp-server-neon/list_docs_resources`, `neondatabase/mcp-server-neon/get_doc_resource`, `neondatabase/mcp-server-neon/get_database_tables`, `neondatabase/mcp-server-neon/describe_table_schema`, `neondatabase/mcp-server-neon/list_branches`, `neondatabase/mcp-server-neon/compare_database_schema`, `io.github.vercel/next-devtools-mcp/init`, `io.github.vercel/next-devtools-mcp/nextjs_docs`, `io.github.vercel/next-devtools-mcp/nextjs_index`, `io.github.vercel/next-devtools-mcp/nextjs_call` |

## Operations named by shared contracts

| Operation | Copilot binding |
| --- | --- |
| file-read | `read/readFile` |
| file-search, file/path and text search, bounded native repository search | `search/fileSearch`, `search/listDirectory`, `search/textSearch`, `search/usages` |
| file-edit | `edit/createDirectory`, `edit/createFile`, `edit/editFiles`, `edit/rename`, within the role's authorized scope |
| terminal | `execute/runInTerminal`, `execute/getTerminalOutput` (Implementor, Direct Implementor, Integration Tester only) |
| image-read | `read/readFile` on a local image path, with an image-capable model; unverified |
| image-inspection procedure | Inline: the role reads the local image with `read/readFile` using its own image-capable chat model and writes the Markdown artifact itself. No delegate model is approved for Copilot; unverified |
| web-fetch | `web/fetch` (Ask, Planner, Knowledge Builder) |
| foreground question route | `vscode/askQuestions`; its per-call question and option limits are unverified. If the tool is absent, ask the batch in chat only |
| default evidence delegation procedure | see Native operations below |
| GitHub `issue_read` | `github/issue_read` |
| GitHub `issue_write` | `github/issue_write` (default agent, `manage-work-item` only) |

## Native operations

- Foreground questions use `vscode/askQuestions`. Delegates return questions to the coordinator, which asks and reinvokes with answers. Do not assume nested delegation is enabled.
- Default delegation uses `agent/runSubagent` only after inspecting the intended client's schema. Use a selector-free call only if that schema supports it; otherwise use only a target actually listed as callable. Generic role descriptions are not registered target names. No named default has been verified. Until the schema is verified, use the approved bounded inline gathering procedure below.
- VS Code also discovers skills in `.claude/skills/`. Most entries there are links to the same `.agents/skills/` sources. The `demo-<role>-claude` entries are Claude Code role skills: never invoke them in Copilot (they stop outside Claude Code); start roles from the Agent dropdown.
- MCP transport/authentication comes from existing client configuration (`.vscode/mcp.json`). Qualified configured prefixes are `github/`, `neondatabase/mcp-server-neon/` and `io.github.vercel/next-devtools-mcp/`. Check the role's actual tool picker before executing them.
- Instruction loading uses native applyTo globs in `.github/instructions`. Native adapters embed the full neutral instruction bodies; exact calls must never be placed in neutral bodies.

## Tracker and bounded gathering

- GitHub read binding for role workflows: `github/issue_read`; allowed methods `get`, `get_comments` and `get_labels`. Supply owner `violabg`, repo `serviceDeskDemo`, the exact numeric issue_number and explicit pagination for all comments. Follow docs/agents/github-issues-adapter.md. These roles do not authorize search, listing or tracker writes.
- Use verified default evidence delegation where available. When delegation is unavailable or unverified, the user-approved 2026-10-08 fallback performs the exact same bounded planning evidence task inline, including current-session artifact persistence and directly linked dependency reads. Missing approved tracker access still stops retrieval. This does not authorize full-role delegation or extra issue access.
- Knowledge Builder discovery may use up to ten bounded evidence tasks within runtime concurrency limits under the inspected default procedure; otherwise gather the same evidence inline. Preserve knowledge/index-only editing and owning-session boundaries.

## manage-work-item

Only when the user explicitly invokes `manage-work-item` in the default Copilot agent: read with `github/issue_read` (`get`, `get_comments`) and write with `github/issue_write` (`method: create` for an approved new item; `method: update` for the approved per-field change after the re-read). Check the active tool catalog and repository authorization at runtime; do not infer availability from this document. `issue_write` accepts issue text and metadata, not image bytes; if the user requires an attachment, ask whether to proceed without it.
