> Earlier dated sections are historical installation evidence. Current ownership and limitations are in the 2026-10-08 maintenance sections and answers. Historical tool names and skill aliases are not runtime bindings.

# Environment Compatibility Evidence

Discovery: 2026-09-18. Installation: 2026-09-19. Selected targets: Codex and GitHub Copilot in VS Code. Execution host for installation: Codex in a VS Code Insiders agent host (environment SDK path reports 0.153.0); the previously inspected standalone Codex CLI was 0.155.0 and VS Code stable 1.138.0. Do not conflate those clients. The current sandbox blocks Node and Git even after escalation requests; Python file operations remain available.

| Evidence source | Established behavior | Local result |
| --- | --- | --- |
| https://learn.chatgpt.com/docs/agent-configuration/subagents | Project `.codex/agents/*.toml`, name/description/developer_instructions, model and per-agent config layers | Registrations generated; actual discovery, layer inheritance and execution unverified |
| https://learn.chatgpt.com/docs/agent-configuration/agents-md | Root AGENTS.md and scoped instruction chain | Root router generated; request-sensitive modular reads are an instruction procedure, not native applyTo |
| https://learn.chatgpt.com/docs/build-skills | `.agents/skills` discovery; duplicate names remain separate | Unique demo-prefixed native skill names avoid collisions with Bootstrap mirrors; actual picker check pending |
| https://code.visualstudio.com/docs/agent-customization/custom-agents | `.github/agents`, tool strings, delegation allowlist, complete body loading, model and invocation metadata | Syntax/body checks available; actual client loading and tool access unverified |
| https://code.visualstudio.com/docs/agent-customization/custom-instructions | Root AGENTS.md and `.github/instructions` applyTo | Requires enabled chat.useAgentsMdFile/chat.includeApplyingInstructions and appropriate client harness; not changed globally |
| https://code.visualstudio.com/docs/agent-customization/agent-skills | Shared `.agents/skills` supported | Native adapters generated, discovery unverified |
| https://code.visualstudio.com/docs/agents/run/subagents | Coordinator routing for delegate questions; nested delegation off by default | Explicit coordinator route installed; behavioral execution pending |
| https://code.visualstudio.com/docs/agents/reference/ai-features-cheat-sheet | Built-in file/search/execution tools | Source baseline preserved; client can silently ignore absent tools, so diagnostics required |
| https://docs.github.com/en/copilot/reference/ai-models/supported-models | GPT-5.6 Luna, minimum VS Code 1.128.0 | Previous stable VS Code version meets minimum; account access and current Insiders picker unverified |
| https://developers.openai.com/api/docs/models/gpt-5.6-luna | Image input support | Previous local Codex model catalog listed gpt-5.6-luna with text/image input; generated delegate execution unverified |
| https://github.com/github/github-mcp-server | Historical 2026-09-18 issue_read catalog inspection | Historical evidence only; this is not the current Codex binding. Copilot's existing binding remains separate. |
| https://mcp.neon.tech/api/list-tools | Exact raw Neon tools and migration lifecycle | Public catalog confirmed; configured server not exposed in this session; qualified names unverified |
| https://github.com/vercel/next-devtools-mcp/blob/v0.3.6/src/tools/nextjs-docs.ts | Pinned v0.3.6 documentation tool | Existing config version preserved; Next tools exposed in host, per-role execution not performed |

## Required client verification

1. Reload each selected client; confirm seven demo agents and five demo skills. Do not select similarly named Bootstrap source templates.
2. Inspect Copilot Chat Diagnostics and the tool picker: exact configured MCP names, full agent loading, AGENTS.md and applicable instruction loading. Missing tools are not silently accepted.
3. In a disposable fixture outside sessions, test one read/search, one authorized artifact write, question/coordinator routing and an approved handoff. Test Ask's effective read-only boundary separately.
4. Verify Codex role-layer app policy inheritance leaves GitHub tools off by default and enables only the approved issue-fetch/comments tools in the three selected roles.
5. Verify Luna availability and conditional invocation from a model lacking image input. Verify inline image processing from an image-capable model. Keep test images and artifacts in the disposable fixture.
6. Verify the connected Neon and GitHub tools on the exact intended context before using those dependent workflows. Do not mutate data merely to test connectivity.

Until these checks succeed, both installations have status **unverified**, not fully compatible. A missing required tool blocks only operations that depend on it. Canonical preservation and native instruction-body equality are separate structural checks.

## Codex GitHub Apps Binding (2026-10-08)

Codex agent layers use app ID `github`, default app tools off, and enable only `github_fetch_issue` plus `github_fetch_issue_comments` for Planner, Implementor, and Direct Implementor. GitHub issue search, listing, and writes are not configured. The two tool names and app policy follow the approved Codex binding; connected-account availability and effective layer inheritance remain unverified.

The issue-comments input schema and support for explicit pagination remain unknown. The issue-fetch response's type/label coverage is also unknown. The adapter requires complete explicit comment pagination and permits type/labels only when returned; otherwise the workflow stops or asks rather than inferring. No runtime operation was performed.

## 2026-09-25 Maintenance Evidence

- Selected targets remain Codex and GitHub Copilot in VS Code. Official Codex subagent documentation (`https://learn.chatgpt.com/docs/agent-configuration/subagents`, retrieved 2026-09-25) documents project TOML registrations, per-agent model selection and inherited tools. The GPT-6 Luna model page (`https://developers.openai.com/api/docs/models/gpt-6-luna`, retrieved 2026-09-25) lists image input. The Codex Vision registration now selects `gpt-6-luna`; its actual discovery and native image-viewing access are unverified.
- Official VS Code custom-agent documentation (`https://code.visualstudio.com/docs/agent-customization/custom-agents`, retrieved 2026-09-25) documents `model`, `tools` and `disable-model-invocation`, and warns that unavailable tools can be ignored. The user-selected Copilot Vision model and repository retrieval tools require a live model/tool picker check; no image processing has been verified in that role.
- Bootstrap 5.2.0 permits bounded native file/path and text search without cluster metadata; `docs/agents/integration-bindings.md` retains the approved Copilot and Codex commands and locally derived grouping. No search MCP is required. Test Planner and Direct Implementor search in their generated roles using a disposable fixture outside existing session folders; their effective runtime access is still unverified.
- Bootstrap 5.2.0 also requires a selected visual role to fetch and inspect remote issue-image bytes with repository permissions, or request an inaccessible image from the user. The source registry, canonical role text and bindings now state this rule; no private issue image was provided for a permissions/image-input test. Codex and Copilot Vision remote-image access remains unverified and must not be inferred from issue lookup or URL access alone.

## 2026-09-27 Maintenance Evidence

- Targets remain Codex and Copilot with their recorded versions; no target version change was selected. Official Codex subagent documentation (https://learn.chatgpt.com/docs/agent-configuration/subagents, retrieved 2026-09-27) documents project .codex/agents TOML registrations, required name/description/developer_instructions and per-agent configuration layers. Official VS Code custom-agent documentation (https://code.visualstudio.com/docs/agent-customization/custom-agents, retrieved 2026-09-27) documents .github/agents Markdown instructions and tools/model/invocation metadata. These sources support registration structure; they do not establish live discovery, full loading or effective grants in the recorded clients.
- Ask and Knowledge Builder native bodies are generated verbatim from the approved 5.3.0 canonical copies. Existing registration metadata and MCP grants are unchanged. Ask's read-only, no-session boundary and Knowledge Builder's knowledge/session-output boundary govern the expanded discovery tables; out-of-scope operations are recorded explicitly.
- Node and Git are available in this maintenance host. The older installation record's sandbox limitations are historical. Neither selected generated-role runtime was executed by this upgrade; model/tool availability, authorization, full loading and handoffs remain unverified.
- User approved preservation of GPT-6 Luna selections, repository-only knowledge drift and unresolved baseline inventory debt. No private issue image or actual generated-role image input was tested.

## 2026-10-08 Maintenance Evidence

Selected targets remain codex and copilot; observed CLI 0.160.0 does not upgrade the recorded target selection. User approved environment isolation, original-name complete canonical skill discovery, bounded inline evidence when delegation is unavailable, and deferral of Bootstrap 6.0. Answers retain unverified role operations and effective permissions.

Official documentation retrieved 2026-10-08:

- [Codex skill discovery](https://learn.chatgpt.com/docs/build-skills): repositories use .agents/skills; duplicate names are not merged; full SKILL.md is read after discovery.
- [VS Code skills](https://code.visualstudio.com/docs/agent-customization/agent-skills): .agents/skills is supported; directory/name agreement is required; experimental Codex Agent Host can also discover .github/skills. Relative supporting resources must remain resolvable. These five relocated skills use repository-relative references and no skill-local resources.
- [VS Code subagents](https://code.visualstudio.com/docs/agents/run/subagents): delegation depends on harness and effective tool availability. This documentation does not establish the running Copilot client's selector schema.

Host evidence: collaboration.spawn_agent accepts task_name/message and optional fork_turns, with no agent_type argument. Bounded evidence agents successfully ran during maintenance. Custom demo role registration, native post-move discovery, MCP authentication, image access and Copilot selector/default invocation remain unverified. The supplied Copilot error establishes that agentName="agent" is not registered in the reported client; no replacement name is guessed. The approved inline procedure preserves the exact evidence task and artifacts while avoiding dependence on an unavailable default selector.

The initial host catalog recursively exposes Bootstrap template skills with the same original names as configured runtime skills. Required source mirrors were preserved in their installed package; source-template catalog collisions remain unresolved native-discovery debt. Root/role routing identifies exact configured skill paths and rejects templates as runtime workflows. A later discovery-specific change must prove safe source package exclusion or relocation before claiming one visible entry per skill.

Static verification: 22 exact canonical copies and all decoded native bodies pass. Complete runtime audit coverage is 55 files; the full foreign-binding audit fails on the inherited diagnostics source-slot gap described below. Audit plan and hash are in answers/manifest. Static results do not establish actual registration or effective permissions. No target version, global settings, credentials or MCP grants were changed.

## Inherited Diagnostics Source Contract Gap

Status: **BLOCKED** for Codex Implementor and Integration Tester diagnostics. The saved 5.3.0 source mirrors and installed 6.1.0 mirrors hardcode `read/problems` outside a declared tooling slot (Implementor one occurrence, Integration Tester four). The Codex canonical copies and their decoded TOML embeddings retain these exact source lines. The new full audit correctly rejects this Copilot binding in all four runtime outputs; no waiver or invented Codex tool was added. The other 51 direct runtime file scans found no foreign binding; the full audit remains failing rather than certifying partial coverage. A follow-up source-contract proposal should add a declared `DIAGNOSTICS_TOOL` placeholder to those mirrors and bind each environment to its actual diagnostics procedure. Until approved and applied, preserve the gap and block the affected diagnostic operation.


## Codex Neon MCP Verification (2026-10-08)

- Fixed the Codex Neon server URL from the legacy `/sse` route to Streamable HTTP `https://mcp.neon.tech/mcp`, completed OAuth, and saved a user-level `enabled_tools` allowlist containing the nine workflow operations. Project-level authorization is restricted to `wild-salad-95156534`; the consent grant selected Docs, Schema, Branches and Querying with read/write scope because migration operations are part of the Implementor workflow. Role-level tool filters further restrict each agent.
- `codex mcp get neon` reports the server enabled, Streamable HTTP transport, correct URL, OAuth auth, and nine allowed operation names. A fresh `codex exec --ephemeral --sandbox read-only` trace called `neon.list_branches` successfully and returned `main` (branch `br-sweet-dream-af0d75vt`, archived). No data was changed.
- The initial fast call raced MCP startup and reported the tool missing; a subsequent trace showed the Neon call completing successfully. Codex workflows should allow the optional server to finish startup before deciding a tool is unavailable. The active ChatGPT session does not inherit the local user's Codex MCP configuration.
- The seven Codex role TOMLs parse with complete transport configuration and exact per-role allowlists. Generated-role invocation/inheritance remains unverified, so this proves local Codex CLI MCP access and static role configuration, not every custom role's runtime behavior. Copilot was not changed.


## Codex Standalone Issue Creation (2026-10-10)

Selected context: default Codex agent in this active local host; no new target version or global configuration. User approved the native GitHub CLI procedure for the explicitly invoked creation skill. Connector creation was rejected with 403. This is an alternative authorized procedure for the same GitHub adapter; it does not repair or grant the connector's remote permissions.

Official sources retrieved 2026-10-10:
- https://docs.github.com/en/rest/using-the-rest-api/troubleshooting-the-rest-api#resource-not-accessible — integration error indicates insufficient permissions.
- https://docs.github.com/en/rest/issues/issues#create-an-issue — issue creation endpoint and permission requirements.
- https://cli.github.com/manual/gh_issue_create — native issue create supports explicit repository, title and body-file; returned URL/nonzero handling must avoid duplicates.
- https://learn.chatgpt.com/docs/extend/mcp?surface=cli — Codex integration registration/authentication and per-tool controls; a missing scope is not repaired by instruction text.

Local evidence: gh 2.100.0 at /opt/homebrew/bin/gh; installed create help confirms command flags. Existing login is violabg via OS keyring with repo scope. No token values are recorded. Bounded `gh repo view` of github.com/violabg/serviceDeskDemo returned ADMIN and enabled issues. Configuration: configured. Authentication: verified in default host. Repository preflight: verified-native read. Creation: unverified until the already approved real story executes. Generated-role operations, Copilot runtime, and native discovery/exclusion outside this active host remain unverified. No login, scope refresh, app-policy change or custom-role tool grant was made.

The root loads the complete skill then only its selected environment binding. Shared resources contain no Codex CLI calls; exact syntax is isolated in the Codex binding. The skill permits only approved native procedures, keeps final issue approval and forbids automatic retry after uncertain results. All previous full environment-audit diagnostics failures remain visible.

Context-audit discovery: the preapply inventory misclassified 44 excluded installed Bootstrap/Maintainer resources as ordinary maintenance entrypoints. The archived plan reproduces the same failure. The approved audit-plan update corrects only their inventory kind to maintenance, preserving installed paths and exclusion policy. This platform-compatibility metadata delta is now applied; no installed skill file changed.

Native creation outcome: **verified-native** for the explicitly invoked default-Codex workflow on 2026-10-10. Created the previously approved customer story once as https://github.com/violabg/serviceDeskDemo/issues/8, exit 0, then verified its exact approved title/body with the returned URL. Temporary body-file deleted. No unresolved issue fields. GitHub connector create remains blocked; generated-role reads and Copilot remain unverified.

## 2026-10-11: Bootstrap 8.0.0, claude-code, Vision retirement, Codex GitHub MCP

Execution host: Claude Code 2.1.296 in VS Code. Selected environments: codex, copilot, claude-code (user: "add claude to the system").

| Evidence source (retrieved 2026-10-11) | Established behavior | Local result |
| --- | --- | --- |
| https://code.claude.com/docs/en/memory | AGENTS.md is read natively when no CLAUDE.md/CLAUDE.local.md exists (v2.1.277+); `.claude/rules` with `paths:` frontmatter; a nested `CLAUDE.md` loads on demand | AGENTS.md loaded in this session; no CLAUDE.md created. A file named `bindings/claude.md` was observed auto-loading as nested memory on case-insensitive macOS, so the environment ID and binding are `claude-code` |
| https://code.claude.com/docs/en/sub-agents | `.claude/agents/*.md`; `name`, `description`, `tools` (incl. `mcp__<server>__<tool>`); body is the full system prompt; subagents lack `AskUserQuestion`; `permissions.deny: Agent(name)` blocks delegation; `claude --agent` runs as main session | Six `demo-<role>-claude` adapters with enforced tools and complete bodies; delegation deny in `.claude/settings.json`; not exercised |
| https://code.claude.com/docs/en/skills | Project skills only in `.claude/skills/`; symlinked skill folders supported; `disable-model-invocation`; `skillOverrides` (`user-invocable-only`) | Six links to `.agents/skills`; maintenance skills user-invocable-only; not exercised |
| https://code.claude.com/docs/en/settings | Project `.claude/settings.json` precedence and scopes | Shared settings file created |
| https://learn.chatgpt.com/docs/extend/mcp | Codex `[mcp_servers.<name>]` `url`, `bearer_token_env_var`, `enabled_tools`; project `.codex/config.toml` for trusted projects | `codex mcp list` (codex-cli 0.162.1) shows `github` enabled at `https://api.githubcopilot.com/mcp/` with bearer env var `GITHUB_TOKEN`; the variable was absent in the inspected shell; no authenticated Codex call |
| https://code.visualstudio.com/docs/agent-customization/custom-agents, /agent-skills, /overview | VS Code also discovers `.claude/agents` (Claude format) and `.claude/skills`; no documented switch to disable it; duplicate-name handling undocumented | Claude registrations use distinct `-claude` names; Copilot binding forbids selecting them; skill links resolve to the same source; client listing unverified |

Live checks: Claude Code main session `mcp__github__issue_read` (`get`, violabg/serviceDeskDemo#1) succeeded. No `issue_write` call was made in any client.

Static verification: shipped canonical verifier passes (27 copies); context-boundary audit passes (173 files); environment audit is blocked only by the inherited `read/problems` lines (Codex and Claude Code Implementor/Integration Tester canonical and native copies, 8 outputs) and passes for all 67 runtime files without that literal.

Required client verification (pending):

1. Codex: make `GITHUB_TOKEN` available to the Codex process, reload, confirm six `demo-*` roles, then one `issue_read get` from Planner.
2. Copilot: confirm six `demo-*` agents and how the `.claude/agents` `demo-*-claude` entries are listed; tool picker diagnostics for `github/issue_read` and `github/issue_write`.
3. Claude Code: `claude --agent demo-planner-claude` loads the role with its tool list and `AskUserQuestion`; `Agent(demo-*-claude)` deny prevents automatic delegation without blocking `--agent`; `/manage-work-item` is listed and not model-invoked; maintenance skills are hidden from the model.
4. All: inline image inspection writes `visual-evidence v1` JSON in a disposable fixture.

Status: all three environments **unverified**; diagnostics **blocked** in Codex and Claude Code Implementor/Integration Tester.
