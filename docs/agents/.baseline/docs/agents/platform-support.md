# Copilot and Codex support

The six role workflows have one source in `.agents/roles`. Copilot discovers `.github/agents/*.agent.md`; Codex discovers `.codex/agents/*.toml`. Each adapter loads its shared role and host bindings in `.agents/platforms`. Shared project skills live only in `.agents/skills`; upstream Bootstrap skill templates are maintenance inputs, not alternate generated runtime copies.

Copilot tool lists, delegation settings, explicit invocation behavior, and the Vision model remain unchanged. Vision's caller must preload the shared role, Copilot bindings, shared capability contract, and actual image because its existing tool list permits edits but no reads. Codex agents inherit parent model, permissions, and all enabled MCP servers; the Copilot model identifier is not translated. Missing native custom-role selection can use a bounded child task explicitly instructed with the same shared role.

## MCP setup and verification

`.vscode/mcp.json` is the source of repository server endpoints and commands. Approved aliases and Codex-specific authentication environment names live in `agentic-system.answers.yaml`. `.codex/config.toml` is its deterministic projection; duplicate transport syntax is necessary because the hosts use different formats. Do not hand-maintain two independent server inventories.

```sh
uv run .agents/scripts/check-agent-system.py --sync-mcp
uv run .agents/scripts/check-agent-system.py
codex mcp list
```

The script uses Python 3.11+ and pinned PyYAML in an isolated `uv` environment; it does not add application dependencies or inspect sessions. Projection refuses unmapped VS Code inputs, unsupported fields, and removal of extra project servers. Register new server aliases/overrides in the answers file, project them, and refresh approved baselines after validation. Additional globally configured and plugin-provided Codex MCP servers remain inherited; intentionally disabled integrations are not enabled by this repository.

GitHub uses `https://api.githubcopilot.com/mcp` and the existing `GITHUB_TOKEN` environment binding. Make the token available to the process launching Codex using your normal secret management; never commit it. A token present in one terminal may not be present in an already running desktop process. Neon retains the existing `https://mcp.neon.tech/sse` configuration; verify its transport with the installed client rather than silently changing the Copilot endpoint. Use `codex mcp login neon` if authentication is required. Next-devtools retains `npx next-devtools-mcp@0.3.6` and needs Node/npm available to the host.

Project Codex configuration requires a trusted project. Restart/reload the host after configuration or authentication changes, then check `/mcp` and actual tool discovery. A server listed by `codex mcp list` is configured, not proof of a successful connection or usable operations. This running conversation cannot gain tools merely because files were edited. Context7 appears in protected Copilot tool grants but is not configured in the repository inventory; it is not claimed as connected.

For tracker verification, use an explicit issue ID provided for planning and confirm issue details and complete comments through the actual exposed GitHub MCP operations. Do not fetch an unrelated issue just to pass maintenance. The shared capability contract approves equivalent GitHub MCP tool namespaces; it does not approve `gh`, direct HTTP, search, or local tracker fallback. Report authentication, tool exposure, or transport failures as blockers, not passing checks.

## Future maintenance and validation

Dual-platform support and the shared-source layout are permanent repository customizations. Read the manifest register and answers before applying upstream templates. Preserve the protected Copilot frontmatter hashes; do not restore full workflow copies inside either platform adapter. Map each upstream agent template to the shared role through `platform.roles`, then perform the per-region baseline merge there. Keep host-specific syntax in platform bindings/adapters. For relocated skills, use the current generated path and `platform.relocations`; never recreate the retired `.github/skills` copy.

For a future three-way template refill, use this approved rendering procedure:

1. Resolve the upstream template through `platform.roles`. Split its YAML frontmatter from its Markdown body before rendering either part.
2. Render the body to the recorded shared-role path with the scalar slot values. `QUESTION_TOOL` is `#capability:ask-user`; shared search/delegation/tracker slots refer to the active platform binding. Compare body heading regions against the shared-role baseline and current shared role.
3. Evaluate upstream frontmatter separately against the matching Copilot adapter. Resolve `PLATFORM_TOOLS` and `APPROVED_MCP_TOOLS` maps using that adapter's `.github/agents/...` key, never the shared-role path. Preserve all registered frontmatter customizations. Generate Codex adapter metadata using its own schema; never transplant Copilot tool/model syntax.
4. `platform.agent_roots`, `platform.bindings`, and `platform.roles` are structured routing metadata, not generic template slot maps. `AGENT_ROOT` is the scalar shared-role root; use the explicit recorded role filenames rather than deriving `.agent.md` names there. New template slots remain unresolved decisions until explicitly settled.
5. Shared-skill templates render directly to the current `.agents/skills` mapping, using neutral body slots and separate host metadata. Refresh only approved destination baselines; retain relocation history so old paths are not regenerated.

Any new shared role needs both host adapters and source/adapter/baseline entries. Any new shared skill needs invocation metadata appropriate to both hosts. Do not add per-agent MCP restrictions to Codex when updating a role. The user-approved extraction overrides the upstream prohibition on splitting mirrored bodies into partials. Upstream changes to that rule are informational until the user changes this customization.

Run these checks after agent-system changes:

```sh
uv run .agents/scripts/check-agent-system.py
uv run .agents/scripts/check-agent-system.py --baseline
git diff --check
```

The baseline comparison is run after refreshing only approved changed-file baselines. Preserve unrelated repository customizations. Inspect changed shared workflow regions against their old baselines, and exercise agent discovery in each host when available. The script checks static structure and provenance; it does not simulate host behavior or authenticate MCP servers.

Artifact linting is for planning-session artifacts and must not be run across sessions during maintenance. App lint/typecheck/test/build apply when buildable application files change; this revision changes only the agent system. Keep the applied-through Bootstrap version at the last fully verified version while runtime capability checks remain blocked.

Rollback: restore adapters, shared sources, root router, projection, and provenance as one revision. Restore the four old skill locations only when also removing their new shared copies. No credentials or user-level configuration are changed.

Sources: [Codex custom agents](https://learn.chatgpt.com/docs/agent-configuration/subagents?surface=app), [Codex skills](https://learn.chatgpt.com/docs/build-skills), [Codex MCP](https://learn.chatgpt.com/docs/extend/mcp?surface=cli), and [Copilot skills](https://docs.github.com/en/copilot/concepts/agents/about-agent-skills).
