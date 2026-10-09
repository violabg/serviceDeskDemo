# Codex GitHub Apps Binding Maintenance

Date: 2026-10-08. Mode: evolve. Approval: true; user selected `Approve revised scope`. Bootstrap applied-through remains 5.3.0; no Bootstrap contract upgrade is proposed. Session-folder contents were excluded from discovery and edits.

## Scope and evidence

The selected Codex issue-retrieval binding is stale: role contracts and native TOMLs use `mcp__github__issue_read`, but the approved Codex Apps surface is `mcp__codex_apps__github_fetch_issue` and `mcp__codex_apps__github_fetch_issue_comments`. GitHub issue search, listing, and writes remain forbidden. Copilot continues to use its existing `github/issue_read` binding without edits to `.github` files.

The Codex app ID is `github`, as approved. Codex documentation supports app-level default tool policy and individual tool enablement in custom-agent config layers. Actual connected-account schemas and runtime behavior are not verified. Whether issue comments support the required pagination inputs, and whether issue-fetch returns type or labels, remain unknown. The workflow must require explicit pagination, stop if complete pagination is unsupported, use type/labels only when returned by issue fetch, and ask rather than infer a missing issue type.

## Delta and merge outcomes

- Codex GitHub issue retrieval: `requires update`; the approved tool names replace the stale binding, only in Codex.
- Codex app default-off and role-specific enablement: `requires update`; apply the approved two read tools only to Planner, Implementor, and Direct Implementor, while defaulting GitHub app tools off for all seven Codex roles.
- Comment pagination support, issue response type/label coverage, connected-account availability, and effective Codex config-layer inheritance: `unknown`; preserve as unverified and do not claim runtime compatibility.
- GitHub issue search/list/write: prohibited and not applicable to the approved operations; do not configure or invoke them.
- Copilot GitHub binding and `.github` outputs: unchanged; not part of this Codex-only change.
- No Bootstrap deltas are collected or applied. The approved region changes are repository customizations; the previously matching binding/adapter baseline regions are the comparison points. Existing baseline debt is not resolved by this work.

## Approved operations

- Update `docs/agents/bindings/codex.md`, `docs/agents/github-issues-adapter.md`, `docs/agents/integration-bindings.md`, and the generator so issue retrieval, role operations, and generated Codex app configuration agree.
- Update the three affected Codex canonical role contracts and all seven `.codex/agents/*.toml` policies; preserve all non-GitHub tools and all Copilot files.
- Update the structural verifier to parse and check Codex app policies and exact least-privilege tool assignments. Update the Codex runtime inventory, adapter inventory, answers, preservation recipe, decision record, compatibility evidence, validation report, and manifest provenance/register.
- Refresh baselines only for approved changed files after generated-content and preservation checks pass. Do not absorb unrelated or unresolved differences.
- Add a survives-upgrade manifest customization row for the Codex-only GitHub Apps binding.

## Risk, validation, and rollback

The main risk is a mismatch between the documented app policy and the connected Codex client's effective tool schema or config inheritance. Static validation can verify only declared policy and generated records, not live tool access. No pagination or response-field support will be asserted without runtime schema evidence.

Run `python3 docs/agents/scripts/verify-agentic-system.py`, parse all Codex agent TOMLs with Python `tomllib`, run the environment binding audit, and check the scoped diff. Preserve any pre-existing verifier failures and identify them separately. Do not run product lint, tests, or builds for this agent-system-only change. If rollback is needed, restore only paths changed under this approved plan and their refreshed baselines; preserve all unrelated user edits.

Approval status: approved for the exact operations above. Session-folder contents remain excluded.