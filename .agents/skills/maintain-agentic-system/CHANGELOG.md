# maintain-agentic-system Changelog

Install-safe release history for the `maintain-agentic-system` skill. Maintainer reads its current installed copy of this file for behavior context, but it must still inspect the actual repository state before proposing updates.

## Current Version

- `2.0.0`

## 2026-07-29

### 2.0.0

- Replaced the ad hoc "propose the smallest upgrade" review with an explicit three-way merge per region: the pristine baseline as `BASE`, the current template re-filled from the answers file as `THEIRS`, and the repository file as `MINE`. A region only one side changed resolves without a question; a region both sides changed always asks.
- Added `upgrade`, `evolve`, and `audit` modes to one entrypoint, with `audit` read-only.
- Added customization register rules, so a deviation recorded once is not re-litigated at every upgrade and an `overrides-canonical` region is never overwritten silently.
- Defined the degraded path for systems with no baseline or answers file: every difference becomes a conflict question, and reconstructing the baseline is the first proposed operation.
- Split the skill into a router plus contracts under `contracts/`, and removed the duplicated generated-system checklist. Maintainer now cites the Bootstrap audit contract instead of carrying a copy that drifts from it.
- Dropped the separate clarification-question schema. The generated Planner already carries the per-question chat format, and the second copy had drifted from it, so Maintainer no longer expects or reconciles that file.

## 2026-07-27

### 1.8.0

- Added explicit upstream, schema, template, and changelog reconciliation for systems created from the rewritten Bootstrap source model.
- Required Maintainer to classify each Bootstrap contract delta as applied, not applicable, deferred, superseded, unknown, or requiring update using manifest records, changelog snapshots, current installed changelogs, and direct repository evidence.

### 1.7.1

- Required Maintainer to verify that modularization does not drop always-loaded guidance, cross-role dependency modules, or repo-specific role extensions.

### 1.7.0

- Forbade Maintainer from scanning, enumerating, reading, or editing session-folder contents during maintenance.
- Added maintenance checks for thin main Markdown agent contracts plus prompt-scoped partials when the platform uses modular agent files.

### 1.6.1

- Required Maintainer to refresh the repo-local Bootstrap changelog snapshot and update the manifest to the new current baseline after approved maintenance succeeds.

### 1.6.0

- Changed maintenance provenance rules to prefer the repo-local Bootstrap changelog snapshot and the currently installed Bootstrap skill `CHANGELOG.md` over the package-root changelog.
- Required Maintainer to keep using direct repository evidence to mark entries `applied` when the repo already satisfies a later Bootstrap release even if local version files are missing or stale.

### 1.5.0

- Added version-provenance maintenance using the agentic-system manifest and Bootstrap release deltas.

### 1.4.0

- Added maintenance checks for context-glossary terminology normalization introduced by Bootstrap 1.11.0.

### 1.3.0

- Added maintenance checks for missing visual-artifact decisions and Vision agent coverage in existing systems.

## 2026-07-26

### 1.2.0

- Added maintenance checks for root instruction coverage and repo-code-focused context glossaries to keep existing systems aligned with Bootstrap 1.6.0.

### 1.1.0

- Aligned maintenance audits with the current Bootstrap contract, including mandatory Knowledge Builder coverage, context-glossary discipline, Planner path references, and index-first knowledge loading.
- Added bounded maintenance scout and contract-auditor subagents when supported by the agent platform.
- Added final maintenance contract validation before handoff.

## 2026-07-24

### 1.0.0

- Initial public release for maintaining existing repo-local Agentic Systems.
