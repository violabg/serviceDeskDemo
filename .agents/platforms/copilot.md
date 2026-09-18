# GitHub Copilot bindings

Read `.agents/platforms/capabilities.md`. The `.github/agents/*.agent.md` frontmatter remains the authority for each Copilot role's tools, delegation restrictions, and model. These adapters do not add grants.

- Repository search: use the role's declared `search/fileSearch`, `search/textSearch`, `search/listDirectory`, and `search/usages`; use declared bounded directory/symbol lookup plus `read/readFile` when full text search is absent.
- File operations: `read/readFile`, `edit/createDirectory`, `edit/createFile`, `edit/editFiles`, and `edit/rename`, only when declared and available.
- Diagnostics: `read/problems`; terminal commands use `execute/runInTerminal` and `execute/getTerminalOutput` where declared.
- Ask-user: `#tool:vscode/askQuestions` when available; otherwise ask directly and wait for required answers.
- Delegation: `#tool:agent/runSubagent` under the declared `agent` capability and allowed agent list. Use `agentName="demo-vision"` for visual extraction. Before invoking Vision, read `.agents/roles/demo-vision.md`, this file, and `.agents/platforms/capabilities.md` and pass their complete text with the source image and active session ID. Vision's preserved edit-only tool list cannot fetch these contracts itself. Direct Vision invocation requires the same supplied context.
- GitHub: use the actual issue/details/comments tool exposed by the configured `github/*` MCP namespace, under the shared read contract. Do not require a historical host-specific spelling.
- Visual intake: pass actual image attachments; use available declared visual tools only. Missing visual intake remains a blocker.

MCP connections remain configured in `.vscode/mcp.json`. Existing Context7 entries in protected role tool lists are not proof that a Context7 server is installed. Shared skills are discovered under `.agents/skills`; reload skills or restart the host if necessary.
