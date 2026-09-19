# Approved Bootstrap File Plan

- Approved: true
- Approved By: repository user
- Approved At: 2026-09-19 (date only; exact message timestamp unavailable)
- Source Message: "approved", following the master file plan, Knowledge Builder MCP addition and Direct Implementor addition.
- Batch choice: combined installation; core, Vision, knowledge-reference reconciliation, five skills, maintenance baseline, audit. No product implementation is approved by this file.
- Bootstrap version: 5.0.0. Selected environments: Codex and Copilot. Prefix: demo-. Language: English.

## Scope and ownership

Shared root, schemas, glossary, knowledge index, skills and session contract have one source. Role contracts have environment-specific complete copies because tool names and invocation bindings differ. Native adapters embed every body byte in order. The source templates, hashes and substitutions are in preservation-plan.json and sources/. Marker stripping is recorded for all canonical copies.

The five native skills use demo-prefixed names to avoid collision with source templates exposed by the execution host. Their canonical bodies are preserved. The Vision native Copilot flag is the explicit user-authorized exception: false instead of the source true. Planner/Direct Implementor's declared invocation slot implements conditional delegation and the parent JSON reference to SlimUI.

Keep the existing nine-entry knowledge index unchanged. Add a code/domain glossary. Reconcile README session/agent names and two knowledge files' stale references. Keep test-exclusion rules; clarify that Integration Tester reports production defects to Implementor rather than repairing production itself. Pre-bootstrap copies of those three files support exact rollback.

## Tool and session decisions

See decision-register.json and integration-bindings.md for exact roles, native tools, MCP identifiers, user approval evidence and invocation procedures. Planning uses GitHub IDs #<positive-number>, type-aware bug-/us- session IDs, direct resume and bounded directly-linked issue retrieval. No local tracker fallback. Native question routing and local session persistence implement approved substitutions.

## Validation and rollback

Run the independent Python verifier, and the shipped Node verifier when its runtime is available. Check canonical coverage and exact preservation, frontmatter string types, TOML scalar/array syntax and complete body decoding, schemas, baseline coverage, paths, roster and tool assignments. Use isolated fixture contracts outside sessions for file operations. Actual client/role behavior remains unverified where unavailable. Product lint/typecheck/test/build are skipped: no product code or runtime config changed.

Rollback only this inventory's NEW files and restore its three MODIFIED documents from pre-bootstrap/. Never delete preexisting sessions, skills, config or product files. Baseline copies themselves are backup artifacts and are not recursively baselined.

## File inventory

| Operation | Path | Kind | Consumers |
| --- | --- | --- | --- |
| NEW | `docs/agents/pre-bootstrap/README.md` | provenance | codex, copilot |
| NEW | `docs/agents/pre-bootstrap/docs/agents/knowledge/testing-flow-checklist.md` | provenance | codex, copilot |
| NEW | `docs/agents/pre-bootstrap/docs/agents/knowledge/dashboard-navigation-boundaries.md` | provenance | codex, copilot |
| NEW | `docs/agents/sources/registry/capabilities.yaml` | provenance | codex, copilot |
| NEW | `docs/agents/sources/registry/placeholders.yaml` | provenance | codex, copilot |
| NEW | `docs/agents/sources/templates/knowledge-index-schema.md` | provenance | codex, copilot |
| NEW | `docs/agents/sources/templates/agent-role-contracts.md` | provenance | codex, copilot |
| NEW | `docs/agents/sources/templates/agentic-system-manifest.md` | provenance | codex, copilot |
| NEW | `docs/agents/sources/templates/agentic-system-answers.md` | provenance | codex, copilot |
| NEW | `docs/agents/sources/templates/bootstrap-file-plan.md` | provenance | codex, copilot |
| NEW | `docs/agents/sources/contracts/platform-compatibility.md` | provenance | codex, copilot |
| NEW | `docs/agents/sources/templates/agents/planner.agent.md` | provenance | codex, copilot |
| NEW | `docs/agents/canonical/codex/agents/demo-planner.agent.md` | canonical-copy | codex |
| NEW | `.codex/agents/demo-planner.toml` | native-adapter | codex |
| NEW | `docs/agents/sources/templates/agents/implementor.agent.md` | provenance | codex, copilot |
| NEW | `docs/agents/canonical/codex/agents/demo-implementor.agent.md` | canonical-copy | codex |
| NEW | `.codex/agents/demo-implementor.toml` | native-adapter | codex |
| NEW | `docs/agents/sources/templates/agents/direct-implementor.agent.md` | provenance | codex, copilot |
| NEW | `docs/agents/canonical/codex/agents/demo-direct-implementor.agent.md` | canonical-copy | codex |
| NEW | `.codex/agents/demo-direct-implementor.toml` | native-adapter | codex |
| NEW | `docs/agents/sources/templates/agents/integration-tester.agent.md` | provenance | codex, copilot |
| NEW | `docs/agents/canonical/codex/agents/demo-integration-tester.agent.md` | canonical-copy | codex |
| NEW | `.codex/agents/demo-integration-tester.toml` | native-adapter | codex |
| NEW | `docs/agents/sources/templates/agents/knowledge-builder.agent.md` | provenance | codex, copilot |
| NEW | `docs/agents/canonical/codex/agents/demo-knowledge-builder.agent.md` | canonical-copy | codex |
| NEW | `.codex/agents/demo-knowledge-builder.toml` | native-adapter | codex |
| NEW | `docs/agents/sources/templates/agents/ask.agent.md` | provenance | codex, copilot |
| NEW | `docs/agents/canonical/codex/agents/demo-ask.agent.md` | canonical-copy | codex |
| NEW | `.codex/agents/demo-ask.toml` | native-adapter | codex |
| NEW | `docs/agents/sources/templates/agents/vision.agent.md` | provenance | codex, copilot |
| NEW | `docs/agents/canonical/codex/agents/demo-vision.agent.md` | canonical-copy | codex |
| NEW | `.codex/agents/demo-vision.toml` | native-adapter | codex |
| NEW | `docs/agents/canonical/copilot/agents/demo-planner.agent.md` | canonical-copy | copilot |
| NEW | `.github/agents/demo-planner.agent.md` | native-adapter | copilot |
| NEW | `docs/agents/canonical/copilot/agents/demo-implementor.agent.md` | canonical-copy | copilot |
| NEW | `.github/agents/demo-implementor.agent.md` | native-adapter | copilot |
| NEW | `docs/agents/canonical/copilot/agents/demo-direct-implementor.agent.md` | canonical-copy | copilot |
| NEW | `.github/agents/demo-direct-implementor.agent.md` | native-adapter | copilot |
| NEW | `docs/agents/canonical/copilot/agents/demo-integration-tester.agent.md` | canonical-copy | copilot |
| NEW | `.github/agents/demo-integration-tester.agent.md` | native-adapter | copilot |
| NEW | `docs/agents/canonical/copilot/agents/demo-knowledge-builder.agent.md` | canonical-copy | copilot |
| NEW | `.github/agents/demo-knowledge-builder.agent.md` | native-adapter | copilot |
| NEW | `docs/agents/canonical/copilot/agents/demo-ask.agent.md` | canonical-copy | copilot |
| NEW | `.github/agents/demo-ask.agent.md` | native-adapter | copilot |
| NEW | `docs/agents/canonical/copilot/agents/demo-vision.agent.md` | canonical-copy | copilot |
| NEW | `.github/agents/demo-vision.agent.md` | native-adapter | copilot |
| NEW | `docs/agents/sources/templates/skills/author-repo-skill/SKILL.md` | provenance | codex, copilot |
| NEW | `docs/agents/canonical/shared/skills/author-repo-skill/SKILL.md` | canonical-copy | codex, copilot |
| NEW | `.agents/skills/demo-author-repo-skill/SKILL.md` | native-adapter | codex, copilot |
| NEW | `docs/agents/sources/templates/skills/plan-bug-from-id/SKILL.md` | provenance | codex, copilot |
| NEW | `docs/agents/canonical/shared/skills/plan-bug-from-id/SKILL.md` | canonical-copy | codex, copilot |
| NEW | `.agents/skills/demo-plan-bug-from-id/SKILL.md` | native-adapter | codex, copilot |
| NEW | `docs/agents/sources/templates/skills/plan-user-story-from-id/SKILL.md` | provenance | codex, copilot |
| NEW | `docs/agents/canonical/shared/skills/plan-user-story-from-id/SKILL.md` | canonical-copy | codex, copilot |
| NEW | `.agents/skills/demo-plan-user-story-from-id/SKILL.md` | native-adapter | codex, copilot |
| NEW | `docs/agents/sources/templates/skills/user-story-analysis/SKILL.md` | provenance | codex, copilot |
| NEW | `docs/agents/canonical/shared/skills/user-story-analysis/SKILL.md` | canonical-copy | codex, copilot |
| NEW | `.agents/skills/demo-user-story-analysis/SKILL.md` | native-adapter | codex, copilot |
| NEW | `docs/agents/sources/templates/skills/integration-test-knowledge-checklist/SKILL.md` | provenance | codex, copilot |
| NEW | `docs/agents/canonical/shared/skills/integration-test-knowledge-checklist/SKILL.md` | canonical-copy | codex, copilot |
| NEW | `.agents/skills/demo-integration-test-knowledge-checklist/SKILL.md` | native-adapter | codex, copilot |
| NEW | `docs/agents/sources/templates/instructions/knowledge-guard.instructions.md` | provenance | codex, copilot |
| NEW | `.github/instructions/knowledge-guard.instructions.md` | canonical-copy | codex, copilot |
| NEW | `docs/agents/sources/templates/instructions/planning-sessions.instructions.md` | provenance | codex, copilot |
| NEW | `.github/instructions/planning-sessions.instructions.md` | canonical-copy | codex, copilot |
| NEW | `docs/agents/sources/templates/instructions/AGENTS.md` | provenance | codex, copilot |
| NEW | `AGENTS.md` | canonical-copy | codex, copilot |
| NEW | `docs/agents/sources/templates/plan-schema.md` | provenance | codex, copilot |
| NEW | `docs/agents/plan-schema.md` | shared-resource | codex, copilot |
| NEW | `docs/agents/sources/templates/test-plan-schema.md` | provenance | codex, copilot |
| NEW | `docs/agents/test-plan-schema.md` | shared-resource | codex, copilot |
| NEW | `docs/agents/sources/templates/artifact-gates.md` | provenance | codex, copilot |
| NEW | `docs/agents/artifact-gates.md` | shared-resource | codex, copilot |
| NEW | `docs/agents/skill-changelogs/bootstrap-agentic-system.CHANGELOG.md` | provenance | codex, copilot |
| NEW | `docs/agents/scripts/verify-canonical-copies.mjs` | provenance | codex, copilot |
| NEW | `docs/agents/context-glossary.md` | shared-resource | codex, copilot |
| NEW | `docs/agents/github-issues-adapter.md` | shared-resource | codex, copilot |
| NEW | `docs/agents/integration-bindings.md` | shared-resource | codex, copilot |
| NEW | `.github/instructions/agent-integrations.instructions.md` | shared-resource | codex, copilot |
| MODIFIED | `README.md` | shared-resource | codex, copilot |
| MODIFIED | `docs/agents/knowledge/testing-flow-checklist.md` | shared-resource | codex, copilot |
| MODIFIED | `docs/agents/knowledge/dashboard-navigation-boundaries.md` | shared-resource | codex, copilot |
| NEW | `docs/agents/preservation-plan.json` | provenance | codex, copilot |
| NEW | `docs/agents/native-adapters.json` | provenance | codex, copilot |
| NEW | `docs/agents/scripts/generate-agentic-system.py` | provenance | codex, copilot |
| NEW | `docs/agents/scripts/verify-agentic-system.py` | provenance | codex, copilot |
| NEW | `docs/agents/compatibility.md` | provenance | codex, copilot |
| NEW | `docs/agents/decision-register.json` | provenance | codex, copilot |

The manifest, answers, this approved file plan, validation report and audit report complete the provenance inventory. Every primary file has a byte-for-byte baseline; backup copies are not recursively inventoried.
