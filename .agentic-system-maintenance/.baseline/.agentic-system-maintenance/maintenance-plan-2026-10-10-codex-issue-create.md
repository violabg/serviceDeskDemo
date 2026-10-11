# Approved Codex Work-Item Creation Maintenance Plan

Date: 2026-10-10. Mode: evolve. Approval: user `approved` after the complete proposed plan and GitHub CLI procedure were presented. Active environment: Codex; shared resources also consumed by Copilot. Session-folder contents and application files are excluded from discovery and edits.

## Evidence and scope

The connector create operation returned `403 Resource not accessible by integration` for github.com/violabg/serviceDeskDemo. Official GitHub documentation identifies insufficient permissions. Existing gh 2.100.0 is authenticated as violabg through the OS keyring with repo scope. A read-only exact-repository lookup returned ADMIN and hasIssuesEnabled=true. Authentication/preflight are verified; issue mutation remains unverified until the approved customer story is created. No credential values, global configuration, login/scope changes, custom-role grants, or application changes are authorized.

## Deltas and merge decisions

- Platform compatibility: blocked connector create -> use approved native CLI procedure for this explicit default-Codex skill only. Connector permission grant remains external.
- Repository customization: blanket shell ban -> approve only the selected binding's documented native procedure, preserving final proposal approval and exact fields. C020 re-evaluated and explicitly approved; C016 role grants retained.
- Authored-skill provenance: missing inventory/baseline -> register current skill and changelog as authored outputs; preserve legacy text in the preapply archive and keep authored source snapshots. No pristine canonical source is invented for them.
- Bootstrap 6.0: deferred under prior approval. Bootstrap 6.1 isolation: applied static bindings; generated-role native verification remains unknown. Targeted 7.0 context isolation and 7.0.1 installed-resource preservation: applied. Remaining provider/native verification: unknown and retained visibly. Bootstrap 7.1 standalone root routing: requires update -> applied by approved SKILL_ROOT block fill.
- Codex binding, integration router/policy and GitHub adapter: existing baseline regions match MINE; approved repository evolution updates only explicit creation regions.
- Root Skills region: MINE has an extra blank line and THEIRS adds standalone routing; approved merge renders the current template with recorded slots and removes the extra blank line. Existing maintenance guard remains an approved MAINTENANCE_ROOT block fill. No other canonical role/instruction/skill mirror changes.

## Approved operations and context classifications

Runtime: AGENTS.md; .agents/skills/create-work-item-from-description/SKILL.md and CHANGELOG.md; docs/agents/bindings/codex.md; docs/agents/integration-bindings.md; docs/agents/integration-policy.md; docs/agents/github-issues-adapter.md. Exact CLI syntax belongs only to the Codex binding. Shared files load the selected environment only. Copilot binding and all role layers retain their current procedures/grants.

Maintenance: this plan; maintenance-2026-10-10-codex-issue-create.md; agentic-system.answers.yaml; agentic-system-manifest.md; compatibility.md; preservation-plan.json; environment-audit.json; context-audit.json; sources/templates/instructions/AGENTS.md; sources/authored/create-work-item-from-description/SKILL.md and CHANGELOG.md; changelogs/bootstrap-agentic-system.CHANGELOG.md; approved affected baseline companions. All are beneath .agentic-system-maintenance. No knowledge files or maintenance skill entrypoints change.

Loaded runtime references: root -> selected binding and standalone skill; skill -> integration-bindings router -> selected binding, and GitHub adapter; binding -> neutral policy/adapter. Context audit and environment audit must register this complete conditional chain. Maintenance-only roots remain .agentic-system-maintenance, .agents/skills/bootstrap-agentic-system, and .agents/skills/maintain-agentic-system, including aliases.

## Validation and result handling

Run python3 .agentic-system-maintenance/scripts/verify-agentic-system.py; node .agents/skills/bootstrap-agentic-system/scripts/verify-canonical-copies.mjs .agentic-system-maintenance/sources . .agentic-system-maintenance/preservation-plan.json; node .agents/skills/bootstrap-agentic-system/scripts/verify-context-boundaries.mjs . .agentic-system-maintenance/context-audit.json; node .agents/skills/bootstrap-agentic-system/scripts/verify-environment-bindings.mjs . .agentic-system-maintenance/environment-audit.json. Check authored skill frontmatter, complete approved inventory/baselines, exact recipe hashes, authority consistency and scoped diff; request final Contract Auditor review.

Before edits the structural verifier had 651 passes and 5 failures: root canonical formatting, root baseline equality, protected K8/K4 baseline equality and inherited diagnostics binding. Only approved root failures are addressed; preserve unrelated knowledge differences and four inherited Codex diagnostic outputs as blocked. Product diagnostics/typecheck/lint/tests/build are inapplicable to documentation-only maintenance. Generated-role and Copilot native behavior remain unverified.

After maintenance verification, resume the previously approved customer story via the explicit standalone skill and newly approved CLI binding. Use the exact approved title/body and exact repository; verify only its returned URL. Do not retry automatically after an uncertain result. Record native-create verification separately from generated-role access.

## Provenance and rollback

Keep fully applied Bootstrap at 5.3.0 and record targeted 7.0/7.1 changes; Maintain 3.2.1. Update C020 for the approved procedure and C021 for the targeted root slot/authored provenance. Refresh approved baselines only after preservation and scoped compatibility verification. Rollback inputs are the 16 exact preapply files in history/2026-10-10-before-codex-issue-create; remove only new outputs introduced by this plan and restore its own changed files. Do not revert unrelated edits. Final operation report will list remaining inherited failures and recommendations.

Context-audit discovery: the preapply inventory misclassified 44 excluded installed Bootstrap/Maintainer resources as ordinary maintenance entrypoints. The archived plan reproduces the same failure. The approved audit-plan update corrects only their inventory kind to maintenance, preserving installed paths and exclusion policy. This platform-compatibility metadata delta is now applied; no installed skill file changed.

Inventory refresh also registered the existing context-audit.json itself as maintenance provenance, which lacked a generated/baseline pair and self inventory entry before this run. It is now included once as a primary file; no recursive baseline snapshot is inventoried.
