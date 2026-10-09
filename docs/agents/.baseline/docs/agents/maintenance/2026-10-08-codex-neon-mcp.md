# Codex Neon MCP Repair

Date: 2026-10-08. Scope: Codex only. User approved repository maintenance and the OAuth consent grant. Copilot and product/database data were not changed.

## Root cause and repair

- Codex's user-level Neon MCP config used `https://mcp.neon.tech/sse`, the legacy SSE endpoint. Codex expects the Streamable HTTP endpoint `https://mcp.neon.tech/mcp`.
- The endpoint was corrected, OAuth was completed, and the global Codex config now restricts exposed Neon operations to the nine operations already assigned by repository role bindings. The grant is project-scoped to `wild-salad-95156534`; consent included Docs, Schema, Branches and Querying categories.
- Each generated Codex role TOML now contains complete Neon endpoint and next-devtools command/argument transport settings, with its existing exact `enabled_tools` filter. The generator emits the same settings. This also resolves Codex's prior `invalid transport` warnings for those role definitions.

## Verification

- `codex mcp get neon`: enabled, `streamable_http`, URL `https://mcp.neon.tech/mcp`, OAuth, and the expected nine-tool global allowlist.
- A trace-enabled `codex exec --ephemeral --sandbox read-only` successfully called `neon.list_branches` with project ID `wild-salad-95156534`, returning one branch: `main` (`br-sweet-dream-af0d75vt`, archived). A current session call through `mcp__neon__list_branches` independently succeeded for the same project. No database mutation was requested or performed.
- The separate `mcp__codex_apps__neon` connector returned `USER_NOT_LOGGED_IN` in this session. That app connector has separate connection state and is not the local Codex MCP server configured here.
- One initial immediate execution concluded the tool was missing while optional MCP startup was still pending; a subsequent trace showed the MCP call succeeded. Allow startup time before treating a missing tool as final.
- All seven `.codex/agents/*.toml` parse and contain the complete MCP transport entries and role allowlists. This validates CLI MCP connectivity and static agent configuration; it does not establish custom-role invocation/inheritance.

## Files

Repository changes update the Codex binding, integration bindings, compatibility evidence, generator, all seven Codex agent TOMLs, answers and manifest. User-level OAuth and tool-filter settings live outside the repository in `~/.codex/config.toml`; no credentials were copied into project files. A new Codex process/client reloads this connection configuration.
