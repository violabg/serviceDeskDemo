# Maintenance Report 2026-10-11: Bootstrap 8.0 Upgrade and Claude Code

Plan: `maintenance-plan-2026-10-11-upgrade-8.0-claude.md` (approved: Sets U and E; D1–D6; D-Q1 native `-claude` subagents with shared bodies). Applied through: 8.0.0. Maintainer: 3.3.0. Rollback snapshot: `history/2026-10-11-before-8.0/` plus git history.

## Operations

| Op | Result |
| --- | --- |
| U1 | `scripts/render-8.0.py` renders 27 canonical copies and 22 native adapters from 8.0 templates with a three-way guard (MINE == BASE or own outputs only) |
| U2 | Six roles × three environments re-rendered; `## Capability Bindings` replaces Source Mapping / Capability Substitutions / Role Tooling Intent; bodies identical across environments (S1) |
| U3, U4 | Five existing skills re-rendered from 8.0 (6.0 intake applied) |
| U5 | `manage-work-item` generated; root route replaced; `create-work-item-from-description` removed with its links, baselines and source snapshots |
| U6 | `AGENTS.md` and knowledge guard from 8.0; roster without Vision; validation line no longer routes ordinary work to the maintenance root; no client syntax in the shared router |
| U7 | Answers rebuilt (slots from recipe, capabilities for three environments, decisions, integration evidence, `RUNTIME_ROOT` not adopted); sources, changelog snapshot and shipped verifiers refreshed; baselines refreshed; manifest updated |
| E1 | Vision canonical and native files removed in Codex and Copilot |
| E2 | Inline image inspection; `visual-evidence v1` JSON artifact |
| E3 | Codex roles: `[apps.github]` off with no tools; `[mcp_servers."github"]` with `GITHUB_TOKEN` bearer reference; `issue_read` for Planner/Implementor/Direct Implementor; project `.codex/config.toml` with `issue_read`, `issue_write` |
| E4 | Codex, Copilot bindings, router, policy and adapter rewritten for GitHub MCP, `manage-work-item`, no Vision |
| E5 | `claude-code` canonical copies and `docs/agents/bindings/claude-code.md` |
| E6 | `.claude/settings.json`: maintenance skills `user-invocable-only`; `Agent(demo-<role>-claude)` denied |
| E7 | `.claude/rules/{knowledge-guard,planning-sessions,agent-integrations}.md` |
| E8 | `.mcp.json`: `next-devtools` added, other entries untouched |
| E9 | `.claude/agents/demo-<role>-claude.md`; `.claude/skills/<name>` links |
| E10 | `README.md` Agent Flow updated |
| Extra | `knowledge/knowledge-index.md` Path cells made repository-relative (8.0 context-boundary contract; C027) |

## Deviations from the plan, with reasons

- Environment ID `claude-code` instead of `claude`: `docs/agents/bindings/claude.md` matches `CLAUDE.md` on case-insensitive macOS and was auto-loaded as nested memory.
- `claude --agent` hint moved from `AGENTS.md` into the Claude binding: the shared router must not contain client syntax.
- Renderer trailing-newline trim removed after the shipped verifier rejected it; Copilot instruction adapter hash fixed to hash the body.

## Validation

See `validation-report.md`. Shipped canonical verifier: pass (27). Context boundaries: pass (173). Environment bindings: blocked only by inherited `read/problems` (8 outputs); pass for 67 runtime files without it. Live: Claude Code main-session GitHub `issue_read` verified; Codex GitHub configured, authentication unverified. Product lint/typecheck/test/build skipped (no product changes).

## Remaining risks

- Native role discovery and execution unverified in all three clients.
- `GITHUB_TOKEN` must reach the Codex process (and stays required for Claude Code).
- Copilot lists Claude-format `demo-*-claude` agents and linked skills; listing behavior unverified.
- `issue_write` is visible to the default agent in Codex and Claude Code; restriction to `manage-work-item` is instruction-level.
- Diagnostics gate blocked until the upstream templates gain a diagnostics tooling slot.

Session-folder contents were not enumerated, read or modified.
