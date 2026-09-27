# Structural Validation Report

## Bootstrap 5.3.0 Maintenance Verification: 2026-09-27

- User approved all operations in the 5.2.0 to 5.3.0 plan, including exact new path values and the separate Copilot Integration Tester restoration.
- Node canonical preservation: PASS, all 22 canonical copies checked against retained sources and the approved substitution recipe.
- Native body preservation: PASS, all 19 adapters decode to the complete canonical body and match their recorded body SHA-256. The Copilot Integration Tester formatting repair restores its exact recorded body and supported frontmatter.
- Full Python structural verification: FAIL, 625 checks passed and 3 checks failed. The failures are exactly the two retained knowledge baseline mismatches and the no-orphan check covering five legacy entries; no new upgrade failure was found.
- Source snapshots: Ask and Knowledge Builder templates, both planning skill templates, placeholder registry, compatibility contract snapshot and Bootstrap changelog updated to installed 5.3.0. Planning skill rendered bodies remain unchanged.
- Native runtime compatibility: unverified for both selected environments. No generated-role discovery, effective MCP/tool authorization, handoff, private issue-image retrieval or image-input test was performed. Static parsing and host availability do not establish those properties.
- Product diagnostics, typecheck, lint, tests and build are not applicable to this agent-system-only change. Required agent-system verification is listed below. No application code, runtime configuration or product tests changed.
- Existing session-folder contents were excluded from discovery and edits. The Python verifier uses an isolated disposable fixture outside existing session folders.

## Commands

- `node docs/agents/scripts/verify-canonical-copies.mjs docs/agents/sources . docs/agents/preservation-plan.json`
- Independent decoding and full-body/hash comparison for all native adapters using the retained Python decoder.
- `python3 docs/agents/scripts/verify-agentic-system.py`
- `git diff --check -- docs/agents .codex/agents .github/agents`

## Preserved Baseline Debt

- `docs/agents/knowledge/testing-flow-checklist.md`: keep repository-only verification and validation-command updates; baseline remains unchanged (C011).
- `docs/agents/knowledge/dashboard-navigation-boundaries.md`: keep repository-only verification, vocabulary and breadcrumb behavior updates; baseline remains unchanged (C012).
- Five orphan baseline entries: four legacy `.github/skills/` copies and `CONTEXT.md`. User approved preserving this unresolved debt, not silently deleting it or certifying inventory completeness.

## Validation Limits

The upgrade applies the 5.3.0 contract deltas with registered Vision exceptions C001/C007/C008 retained. The complete generated-system validation is not a full pass while baseline debt and native runtime verification remain unresolved. The older Node/sandbox restrictions in installation history do not apply to this host.

- `git diff --check` passed for the changed agent-system paths. Source snapshots and hashes match the installed sources; broad service bindings are removed and forbidden plan/session operations retain explicit role restrictions.
