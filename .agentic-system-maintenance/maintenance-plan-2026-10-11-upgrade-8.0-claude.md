# Maintenance Plan 2026-10-11: Bootstrap 8.0 Upgrade, Claude Code Environment, Vision Retirement, Codex GitHub MCP

- Approval: **true** — Sets U and E approved 2026-10-11 (user: "Both U and E"); D-Q1 resolved: native subagents with a `-claude` name suffix; maximise shared content.
- Maintainer: 3.3.0. Installed Bootstrap: 8.0.0. Applied through: 5.3.0 + targeted 7.0 isolation + targeted 7.1 routing.
- Session-folder contents were excluded from discovery and will be excluded from edits. No application code, schema, migrations, product tests or product runtime configuration are touched.

## 1. Mode

Two operation sets, approvable separately:

- **Set U — `upgrade`** to Bootstrap 8.0.0, including the previously deferred 6.0.0 intake changes (the 8.0 mirrors already contain them; keeping them deferred would require keeping 5.3 sources alive).
- **Set E — `evolve`**: add the `claude-code` environment; retire Vision in every environment; move Codex GitHub access from the `github` Codex App connector to the GitHub MCP server.

User decisions recorded 2026-10-11 (message: "approved recommended, remove the vision agent … everywhere, i also want codex to use github via mcp"):

| # | Decision | Value |
| --- | --- | --- |
| D1 | Scope | One plan, U and E separated |
| D2 | `WORK_ITEM_WRITE` | GitHub MCP `issue_write` (create; update after read) in every environment; Codex via MCP instead of `gh` CLI (supersedes C020) |
| D3 | `RUNTIME_ROOT` | Not adopted: keep `docs/agents/` runtime resources and `sessions/`; record locations |
| D4 | Vision | Retired everywhere; Planner and Direct Implementor inspect images inline |
| D5 | `create-work-item-from-description` | Removed permanently (skill, `.claude/skills` link, baselines, routes) |
| D6 | Codex GitHub | GitHub MCP server for reads and writes; Codex App `github` connector disabled |

## 2. Detected components and maintenance baseline

- Manifest, answers (v2) and `.baseline/` all present → full three-way merge.
- Runtime: `AGENTS.md`; 14 canonical role copies `docs/agents/canonical/{codex,copilot}/agents/`; 7 `.codex/agents/*.toml`; 7 `.github/agents/*.agent.md`; 5 skills `.agents/skills/<name>/`; 2 shared instructions + Copilot adapters; bindings, policy, adapter, schemas, glossary; `knowledge/`.
- Baseline vs MINE: 54/56 identical. Differences: C011/C012 knowledge files (kept), and the installer-deleted `create-work-item-from-description` (D5).
- `.claude/skills/` contains installer symlinks to the Bootstrap and Maintainer skills (maintenance-only roots).
- `.mcp.json` (untracked): `github` (HTTP `https://api.githubcopilot.com/mcp/`, `Authorization` from `${GITHUB_TOKEN}`), `neon`, `context7`. No `next-devtools`.
- The 5.0 first-install renderer `scripts/generate-agentic-system.py` refuses existing installs and has stale paths; it stays as provenance.

## 3. Repository changes affecting the system

- The kit reinstall (skills-lock.json) deleted `create-work-item-from-description`; `AGENTS.md:23`, `docs/agents/integration-bindings.md`, both bindings and `github-issues-adapter.md` still route to it (broken now).
- `.vscode/mcp.json`: Neon moved to `/mcp`, `context7` added (user change; preserved).
- Claude Code 2.1.296 in use with the repository.

## 4. Classified Bootstrap deltas

| Version | Delta | Cause | Class | Operation |
| --- | --- | --- | --- | --- |
| 6.0.0 | Bug intake four fields; related-ID title batch; Markdown with code blocks/image URLs | canonical | requires update (deferral lifted by D1) | U3, U4 |
| 6.0.0 | Wiki catalog/page and index-rebuild bindings | canonical | not applicable for wiki (no wiki source); index-rebuild requires update | U2 bindings |
| 6.1.0 | Environment isolation, delegate selectors, single skill source | platform | applied (C013–C015); re-applied for `claude-code` | E-set |
| 7.0.0 | Knowledge/maintenance separation, exclusions | canonical | applied (C019); requires update for `claude-code` maintenance-skill aliases | E6 |
| 7.0.1 | Installed skills stay at installed paths | canonical | applied | — |
| 7.1.0 | Standalone creation route | canonical | superseded by 8.0 | U5 |
| 8.0.0 | `manage-work-item` + `WORK_ITEM_WRITE` | canonical | requires update | U5 |
| 8.0.0 | Capability sidecars; `CAPABILITY_BINDINGS`; no Bootstrap narration in agents | canonical | requires update (21 agent files carry old sections) | U2 |
| 8.0.0 | `RUNTIME_ROOT` | canonical | not applicable by D3; recorded | U7 |
| 8.0.0 | `MAINTENANCE_ROOT` slot recorded | canonical | requires update (answers only; already applied in files) | U7 |
| 8.0.0 | Blueprint six-batch order | canonical | not applicable (first-install only) | — |
| Maintain 3.3.0 | Retired creation skill → `manage-work-item`; runtime-root move optional | canonical | requires update / not applicable | U5 / D3 |
| — | `business-logic-gap-detector` | canonical | deferred (unchanged) | — |

## 5. Per-region merge outcomes

| Region(s) | MINE vs BASE | THEIRS vs BASE | Register | Outcome |
| --- | --- | --- | --- | --- |
| All agent/skill canonical regions except below | unchanged | changed (8.0) | none | take THEIRS |
| Agent frontmatter `agents:` (Planner, Direct Implementor) | unchanged | changed (Vision empty, D4) | C002 retired | take THEIRS; adapters omit empty delegate |
| `VISION_INVOCATION` slot | unchanged | slot value changed (D4) | C002 | user-resolved: inline (see U6) |
| Vision agent files (6) and C001/C007/C008 regions | unchanged | removed (D4) | always | user-resolved: remove; rows retired |
| `AGENTS.md` `SKILL_ROOT` route | unchanged | changed (8.0 route) | C021 always | user-resolved (D5): take THEIRS |
| Codex GitHub binding / role TOML `[apps.github]` | unchanged | changed (D6) | C016, C020 | user-resolved: take MCP binding; rows superseded |
| Discovery regions | unchanged | changed (`claude-code`) | C003, C013–C015 re-evaluate | resolved by D-Q1 below |
| `knowledge/testing-flow-checklist.md`, `dashboard-navigation-boundaries.md` | changed | unchanged | C011, C012 always | keep MINE |
| Neon/Next role boundaries (C017, C018) | unchanged | unchanged | always | keep; replicate for Claude |

### Open question D-Q1 (blocks Set E only): how Claude Code runs the roles

VS Code Copilot also discovers `.claude/agents/` (Claude format) and `.claude/skills/`, and has no documented switch to turn that off. Claude Code subagents cannot use `AskUserQuestion`.

- **Option R (recommended): router-loaded roles.** No `.claude/agents/`. In Claude Code the main session loads `docs/agents/canonical/claude/agents/demo-<role>.agent.md` through the existing `AGENTS.md` router, exactly as the router already describes. Pros: no Copilot discovery collision, questions work natively, smallest footprint. Con: per-role tool limits (Ask read-only, Planner no product edits) are instruction-level only in Claude Code.
- **Option N: native subagents.** `.claude/agents/demo-<role>.md` with enforced `tools`, run with `claude --agent demo-<role>`; `permissions.deny` `Agent(demo-*)` blocks automatic delegation. Pros: enforced tool allowlists. Cons: Copilot lists a second `demo-*` agent per role carrying Claude bindings (an isolation violation unless verified that VS Code ignores or de-duplicates them); `--agent` support in the VS Code extension unverified.

## 6. Proposed file operations

### Set U — Bootstrap 8.0 upgrade (Codex, Copilot; Claude copies generated from the same render)

| Op | Files | Change | Risk |
| --- | --- | --- | --- |
| U1 | `.agentic-system-maintenance/scripts/render-8.0.py` (new, maintenance) | Deterministic renderer: 8.0 mirrors + answers slot values + new decisions; three-way check refuses any region whose MINE ≠ BASE unless register-resolved | Low; maintenance-only |
| U2 | `docs/agents/canonical/{codex,copilot}/agents/demo-{planner,implementor,direct-implementor,integration-tester,knowledge-builder,ask}.agent.md`; matching `.codex/agents/*.toml`, `.github/agents/*.agent.md` | Re-render from 8.0: drop Source Mapping / Capability Substitutions / Role Tooling Intent; add `## Capability Bindings` (`CAPABILITY_BINDINGS` per role/env from sidecars, resolved to concrete tools/paths; wiki tokens bound to "not available — no wiki source approved; stop and report"; index rebuild bound to the role's knowledge-edit scope) | Medium; large text change, mechanically verified |
| U3 | `.agents/skills/plan-bug-from-id/SKILL.md`, `plan-user-story-from-id/SKILL.md` | Take 8.0 (6.0 intake: bug four fields; story related-ID titles via one `issue_read get` per listed ID, no recursion) | Medium; changes artifact shape for new sessions only |
| U4 | `.agents/skills/{author-repo-skill,user-story-analysis,integration-test-knowledge-checklist}/SKILL.md` | Take 8.0 | Low |
| U5 | new `.agents/skills/manage-work-item/SKILL.md`; `AGENTS.md` (`SKILL_ROOT` route); delete `.agents/skills/create-work-item-from-description/*`, `.claude/skills/create-work-item-from-description` (git rm), their baselines/sources | `TRACKER_ADAPTER` = GitHub Issues adapter; `WORK_ITEM_RETRIEVAL` = selected binding's `issue_read` (get, get_comments, get_labels); `WORK_ITEM_WRITE` = selected binding's `issue_write` (method create; method update after read/approval/re-read); no delete, bulk, search, comment or admin tools | Medium; write tool exposure |
| U6 | `AGENTS.md`, `.github/instructions/knowledge-guard.instructions.md` + adapter | Take 8.0 router/guard; roster without Vision; keep validation line but move the agent-system check out of ordinary routing (fixes context-boundary finding: ordinary runtime must not run a maintenance-root script) | Low |
| U7 | answers, manifest, baseline, preservation plan, environment audit, context audit, changelog snapshot, sources | Record `MAINTENANCE_ROOT`, `RUNTIME_ROOT` (not adopted, D3), `CAPABILITY_BINDINGS`, `WORK_ITEM_WRITE`; applied-through 8.0.0; refresh last | Low |

### Set E — evolve

| Op | Files | Change | Risk |
| --- | --- | --- | --- |
| E1 | delete `docs/agents/canonical/{codex,copilot}/agents/demo-vision.agent.md`, `.codex/agents/demo-vision.toml`, `.github/agents/demo-vision.agent.md` (+ baselines) | Vision retired (D4) | Low |
| E2 | Planner/Direct Implementor copies (via U2) | `VISION_AGENT_NAME` = "" (adapters omit delegate); `VISION_INVOCATION` = inspect each image inline with the active client's native image read (Codex `view_image` on a local path; Copilot `read/readFile`; Claude `Read`); fetch public remote URLs with the role's web fetch; if bytes are unreadable or private, ask the user to save the image locally; never infer from a URL. `VISUAL_ARTIFACT_FORMAT` = JSON `visual-evidence v1` in `sessions/<id>/artifacts/visual/<image>.json` with `session_id`, `image`, `observed_text`, `layout`, `components`, `states`, `uncertainties` (replaces SlimUI, whose spec lived in the retired Vision body) | Medium; artifact format change for new sessions |
| E3 | `.codex/agents/demo-{planner,implementor,direct-implementor}.toml` (+ others for `[apps.github]`), new `.codex/config.toml` | Remove per-tool app grants, keep `[apps.github] default_tools_enabled = false` in every role; add `[mcp_servers."github"] url = "https://api.githubcopilot.com/mcp/"`, `bearer_token_env_var = "GITHUB_TOKEN"`, `enabled_tools = ["issue_read"]` for the three tracker roles. Project `.codex/config.toml` (trusted projects only) adds the same server for the default agent with `["issue_read","issue_write"]` for `manage-work-item` | Medium; requires `GITHUB_TOKEN` in Codex's process environment; write tool visible to the default agent (instruction-level skill scope) |
| E4 | `docs/agents/bindings/codex.md`, `integration-bindings.md`, `github-issues-adapter.md`, `integration-policy.md` | Codex names `mcp__github__issue_read` / `mcp__github__issue_write`; remove Codex App and `gh` CLI creation procedure (C016/C020 superseded); remove Vision/Luna sections; generic adapter wording for three clients | Medium |
| E5 | new `docs/agents/canonical/claude/agents/demo-{6 roles}.agent.md`, new `docs/agents/bindings/claude.md`; `AGENTS.md` environment list `codex`, `copilot` or `claude`; `AGENT_ROOT` "(codex, copilot or claude)" | Claude bindings: `Read`, `Grep`, `Glob`, `Edit`, `Write`, `Bash` (Implementor, Direct Implementor, Integration Tester only), `WebFetch` (Ask, Planner, Knowledge Builder), questions via `AskUserQuestion` in the main session, evidence delegation via `Agent` with `subagent_type: "general-purpose"` (questions return to parent), MCP `mcp__github__issue_read`/`issue_write`, `mcp__neon__*` per C017/C018 allowlists, `mcp__next_devtools__*` per existing allowlist | Medium |
| E6 | new `.claude/settings.json` | `skillOverrides`: `bootstrap-agentic-system` and `maintain-agentic-system` → `user-invocable-only` (closes 7.0 model-invocation alias gap; explicit `/maintain-agentic-system` still works). Option N adds `permissions.deny: ["Agent(demo-*)"]` | Low |
| E7 | `.claude/rules/{knowledge-guard,planning-sessions,agent-integrations}.md` | Native path-scope adapters: `paths:` frontmatter + lossless embedded canonical bodies (same as Copilot `.github/instructions` adapters) | Low |
| E8 | `.mcp.json` | Add `next-devtools` (`npx next-devtools-mcp@0.3.6`) so Claude matches existing Next.js grants; preserve existing entries; no secrets (file is untracked; propose tracking it since auth is an env reference) | Low |
| E9 | `.claude/agents/demo-{6 roles}-claude.md`; `.claude/skills/{6 runtime skills}` symlinks | Native adapters with `name`, `description`, `tools`, full canonical body (lossless embedding); skill symlinks to the single `.agents/skills` source | Copilot lists Claude-format agents (distinct names) and duplicate skill entries with identical bodies; unverified |
| E10 | `README.md` (generated output) | Agent Flow: remove Vision row; list three environments; skill names incl. `manage-work-item` | Low |

## 7. Customization register

| Row | Action |
| --- | --- |
| C001, C002, C007, C008 | Retire (Vision removed, D4) |
| C016 | Superseded by C023 |
| C020 | Superseded by C022 / 8.0 `manage-work-item` |
| C021 | Superseded by 8.0 route |
| C009 | Update: visual binding is inline-only; search bindings add Claude |
| C003, C013–C015 | Re-verified for `claude-code`; last checked 8.0.0 |
| C022 (new) | `WORK_ITEM_WRITE` = GitHub MCP `issue_write` create/update in all clients; slot-override; always |
| C023 (new) | Codex GitHub MCP server, `GITHUB_TOKEN` bearer, per-role `enabled_tools`; Codex App connector off; modified-rule; always; re-evaluate on client/auth changes |
| C024 (new) | Vision retired; inline image inspection; `visual-evidence v1` JSON; slot-override; always |
| C025 (new) | Claude Code role-loading model (Option R or N) and `.claude/settings.json` maintenance-skill override; extends-canonical; re-evaluate on discovery changes |

## 8. Approval status

**true** for Set U and Set E (2026-10-11).

D-Q1 resolution (user: "native subagents with claude subfix so i can understand the difference, is there a way to keep as much content as possible shared between agents and skills so we don't have too much duplications"):

- Option N with names `demo-<role>-claude` in `.claude/agents/`; Copilot may list them but they are visibly Claude-specific. `permissions.deny: ["Agent(demo-*-claude)"]` stops automatic delegation; roles run via `claude --agent demo-<role>-claude`.
- Sharing (S1): environment-dependent body slots (`QUESTION_TOOL`, `KNOWLEDGE_DISCOVERY_DELEGATION`, `WORK_ITEM_GATHERING`, `WORK_ITEM_RETRIEVAL`, `REPOSITORY_SEARCH_TOOL`, `VISION_INVOCATION`, env-dependent `CAPABILITY_BINDINGS` rows) are filled with references to the router-selected `docs/agents/bindings/<environment>.md`, so canonical bodies are identical across environments; only frontmatter `tools` differs per environment. Exact client identifiers live only in each environment's binding file and native adapter. Skills stay single-source; Claude discovers them through `.claude/skills/<name>` symlinks into `.agents/skills/`.

## 9. Validation

1. `node .agentic-system-maintenance/scripts/verify-canonical-copies.mjs .agentic-system-maintenance/sources . .agentic-system-maintenance/preservation-plan.json` (all canonical copies, three environments).
2. `node … verify-environment-bindings.mjs . .agentic-system-maintenance/environment-audit.json` (foreign literals: `mcp__codex_apps__*`, `gh issue create`, `demo-vision`, Luna, cross-client tool names).
3. `node … verify-context-boundaries.mjs . .agentic-system-maintenance/context-audit.json`.
4. `python3 .agentic-system-maintenance/scripts/verify-agentic-system.py` (updated for three environments and no Vision).
5. TOML/JSON/YAML parse of all native files; zero `CANONICAL-TEMPLATE-SLOT` markers in runtime files.
6. Bounded read-only live checks: Claude `mcp__github__issue_read` get on one existing issue; Codex the same after reload, if `GITHUB_TOKEN` reaches Codex. No `issue_write` call is made for verification.
7. Product lint/typecheck/test/build skipped: no product files change.

## 10. Rollback

Before writing, copy every touched runtime file plus answers/manifest/plans to `.agentic-system-maintenance/history/2026-10-11-before-8.0/`. Rollback = restore that folder and `git checkout` the deleted tracked files. Baselines are refreshed last, only after validation passes.

## 11. Environments, shared files and compatibility

| Environment | Change | Status after apply |
| --- | --- | --- |
| codex | 8.0 re-render; Vision removed; GitHub via MCP (`GITHUB_TOKEN`) | unverified until reload + issue read |
| copilot | 8.0 re-render; Vision removed | unverified (client picker/diagnostics) |
| claude-code 2.1.296 | New: router-loaded (R) or native (N) roles; skills via existing `.agents/skills` paths read by the router; AGENTS.md read natively (no CLAUDE.md); `.claude/rules` adapters; settings override | unverified until role/skill checks; `AGENTS.md` loading verified in this session |

Shared consumers: `AGENTS.md`, `integration-bindings.md`, `integration-policy.md`, `github-issues-adapter.md`, schemas, glossary, skills, `knowledge/` — all three environments. Evidence sources (retrieved 2026-10-11): code.claude.com/docs/en/{memory,sub-agents,skills,settings}; learn.chatgpt.com/docs/extend/mcp; code.visualstudio.com/docs/agent-customization/{custom-agents,agent-skills,overview}.
