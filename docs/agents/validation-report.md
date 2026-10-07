# Structural Validation Report

Date: 2026-10-07. Bootstrap 6.0.0 approved upgrade checks: **PASS**. Full structural conformance: **FAIL**, with the same three approved retained baseline-debt failures. Native runtime compatibility: **unverified** for Codex and Copilot.

## Executed Checks

| Check | Result | Scope |
| --- | --- | --- |
| Shipped Node canonical verifier | PASS | All 22 canonical copies exactly match retained templates after approved slot fills and marker removal |
| Native decoded body/hash comparison | PASS | All 19 adapters embed the full canonical body in order |
| Native metadata comparison against pre-change backup | PASS | Models, MCP filters, tools and native metadata unchanged; C003 demo names and Vision exceptions retained |
| Focused source/inventory verification | PASS | 73 inventory source hashes match retained sources; 11 refreshed sources and the changelog snapshot match installed Bootstrap; answers and recipes agree |
| Intake contract checks | PASS | Exactly four ordered bug fields, six story fields; separate dependency evidence and approved supplied-ID title resolution |
| Role/environment boundary checks | PASS | Existing MCP grants and selected environments unchanged; Knowledge Builder rebuild unverified, other rebuilds and wiki operations blocked within recorded scope |
| Independent Python structural verifier | FAIL: 625 passed, 3 failed | Only the retained baseline exceptions below; disposable fixtures outside existing sessions |
| Scoped git diff --check | PASS | Approved agent-system paths |

Commands: `node .agents/skills/bootstrap-agentic-system/scripts/verify-canonical-copies.mjs docs/agents/sources . docs/agents/preservation-plan.json`; `python3 -B docs/agents/scripts/verify-agentic-system.py`; focused Python reconstruction, decoding, source/hash/intake/scope assertions; scoped `git diff --check`.

Python's `-B` option prevents bytecode writes. An unintended bytecode update from the earlier read-only audit import was restored before application and excluded from the final changes. No verifier report-refresh option was used: its older fixed-date/host prose does not describe this run.

## Approved Retained Failures

1. Pristine baseline equality: `docs/agents/knowledge/testing-flow-checklist.md` (C011).
2. Pristine baseline equality: `docs/agents/knowledge/dashboard-navigation-boundaries.md` (C012).
3. No orphan or missing baseline entries: five legacy orphan files remain (`CONTEXT.md` and four legacy `.github/skills` copies); no current generated primary or baseline is missing.

The user approved retaining this debt in the maintenance plan and replied `ok approved` on 2026-10-07. These results remain failures, not passing conformance. The knowledge files and their old baseline bytes were not changed. Canonical copies remain exact; native Vision exceptions remain explicitly registered rather than certified as unchanged canonical metadata.

## Verification Limits

Static file/body/hash verification does not prove selected-client discovery, actual complete instruction loading, effective tool availability, authentication, image input or role handoffs. GitHub issue-read is not exposed in this maintenance host; no live issue was fetched. Markdown normalization and supplied-ID batch execution remain unverified in the generated roles. No external wiki source is approved; a wiki-dependent workflow is blocked. No native client/version upgrade was performed.

Product diagnostics, typecheck, lint, tests and build were not run: the approved changes are agent-system-only. No application code, schema, migrations, product tests, runtime configuration or actual session contents were read or modified. The Python verifier's disposable file-contract fixture was outside the configured session root.

Approved changed baselines were refreshed after canonical/body/hash verification. The final operation inventory, source scope, customization decisions and read-only auditor result are recorded in `docs/agents/contract-audit.md`. Compatibility follow-ups remain in `docs/agents/compatibility.md`.
