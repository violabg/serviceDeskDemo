# Agentic System Manifest

## Source Package

- Package: agentic-system-kit
- Installed Bootstrap Skill Path: `.agents/skills/bootstrap-agentic-system/SKILL.md`
- Installed Bootstrap Skill Changelog Path: `.agents/skills/bootstrap-agentic-system/CHANGELOG.md`
- Installed Maintain Skill Path: `.agents/skills/maintain-agentic-system/SKILL.md`
- Installed Maintain Skill Changelog Path: `.agents/skills/maintain-agentic-system/CHANGELOG.md`
- Package Changelog Path For Context: none

## Installed Contract Versions

- Bootstrap Skill Version Used: 5.0.0
- Bootstrap Contract Applied Through: 5.2.0 with the explicit Vision native-metadata exceptions below
- Bootstrap Snapshot Source Status: copied from installed skill changelog
- Maintain Skill Version Available: 3.0.0
- Maintain Skill Version Last Applied: 3.0.0
- Last Maintenance Date: 2026-09-25

## Generated System Paths

- Root Instructions: `AGENTS.md`
- Native Agents: `.codex/agents/`, `.github/agents/`
- Canonical Agents: `docs/agents/canonical/{codex,copilot}/agents/`
- Skills: `.agents/skills/demo-*/SKILL.md`; canonical skills: `docs/agents/canonical/shared/skills/`
- Instructions: `.github/instructions/`
- Context Glossary: `docs/agents/context-glossary.md`
- Knowledge Index: `docs/agents/knowledge/README.md` (preexisting, preserved)
- Plan Schema: `docs/agents/plan-schema.md`
- Test Plan Schema: `docs/agents/test-plan-schema.md`
- Artifact Gates: `docs/agents/artifact-gates.md`
- Work Item Adapter: `docs/agents/github-issues-adapter.md`
- Session Root: `sessions/`; explicit current ID only
- Session Identity: `sessions/<id>/session-identity.md`
- Session Memory: `sessions/<id>/session-memory.md`
- Session Log: `sessions/<id>/session-log.md`
- Execution Report: `sessions/<id>/execution-report.md`
- Bootstrap Changelog Snapshot: `docs/agents/skill-changelogs/bootstrap-agentic-system.CHANGELOG.md`
- Answers File: `docs/agents/agentic-system.answers.yaml`
- Baseline Directory: `docs/agents/.baseline/`
- Approved File Plan: `docs/agents/bootstrap-file-plan.md`
- Decisions: `docs/agents/decision-register.json`

## Environment Compatibility

- Execution Host: Codex in VS Code Insiders; SDK path 0.153.0
- Selected Environments and role/operation maps: `docs/agents/agentic-system.answers.yaml`
- Compatibility Evidence: `docs/agents/compatibility.md`
- Canonical Source Snapshots: `docs/agents/sources/` (outside skill/agent discovery roots)
- Preservation Plan: `docs/agents/preservation-plan.json`
- Preservation Plan SHA-256: 0bc4fd64fd1d37b5bea06fbc3345b11d31e753126c30163013aef1f4ca5ccc87
- Native Body Mapping: `docs/agents/native-adapters.json`
- Structural Verification: `docs/agents/validation-report.md`
- Contract Audit: `docs/agents/contract-audit.md`

| Environment | Registration | Status | Limitations |
| --- | --- | --- | --- |
| Codex | Seven TOML agents, five shared skills, root routing | unverified | Native discovery, MCP layer inheritance and effective role operations not executed in current sandbox |
| Copilot | Seven Markdown agents, five shared skills, scoped instructions | unverified | Actual client/model/tool picker and generated-role handoffs require client verification |

## Customization Register

| ID | Target | Region | Kind | Reason / user evidence | Upstream Relation | Survives Upgrade |
| --- | --- | --- | --- | --- | --- | --- |
| C001 | `.github/agents/demo-vision.agent.md` | disable-model-invocation | modified-rule | User explicitly requires Planner to spawn Vision when the active model lacks vision | overrides-canonical | always; retain until user changes it |
| C002 | Planner and Direct Implementor copies | VISION_INVOCATION slot | slot-override | Inline extraction if capable, otherwise Luna delegate; parent JSON reference bridges Planner JSON intake and Vision SlimUI output | extends-canonical within declared slot | always |
| C003 | Native skill adapters | name | native-registration | demo-prefixed invocation names distinguish configured skills from shipped source mirrors | independent; body exact | re-evaluate on discovery changes |
| C004 | `.github/instructions/agent-integrations.instructions.md` and integration-bindings.md | repository bindings | added-section | GitHub-only planning, exact MCP grants, English, current-role routing, native authority limits | extends-canonical | always |
| C005 | two existing knowledge files and README | obsolete references and test ownership | modified-rule | Reconcile missing Demo agents/glossary, session identity and Integration Tester production-code boundary | independent repository documentation | always |
| C006 | `docs/agents/context-glossary.md` | Customer/Client terminology normalization | modified-rule | User approved `Customer`/`Customers` as the canonical Service Desk term; normalize `Client`/`clients` from issue wording in user stories and bugs | independent repository documentation | always |
| C007 | `.github/agents/demo-vision.agent.md` | model and tools frontmatter | modified-rule | User selected GPT-6 Luna (copilot) and web/GitHub retrieval for repository images; duplicate tool removed without changing granted tool set | overrides-canonical native metadata | always; recheck tool availability and scope |
| C008 | `.codex/agents/demo-vision.toml` | model metadata | modified-rule | User approved the Codex counterpart for repository image analysis with GPT-6 Luna; native image viewing still requires runtime verification | overrides-canonical native metadata | always; recheck model and image tool at runtime |
| C009 | `docs/agents/integration-bindings.md`, `docs/agents/agentic-system.answers.yaml` | repository-search resolution and visual binding | added-section | Gate 5 must continue with derived, bounded clusters from native workspace search when a cluster-producing tool is absent; Codex image viewing must receive actual image input | extends-canonical through existing search slot and native operation binding | always; re-evaluate if native search/image tools change |
| C010 | `docs/agents/sources/registry/capabilities.yaml` | repository-search fallback | modified-rule | Approved repository-local 5.1.1 correction was superseded by the 5.2.0 upstream fallback; retained source now matches upstream, while C009 keeps concrete native bindings | superseded by upstream 5.2.0 | drop-when-superseded; resolved in 5.2.0 |

Canonical copies remain exact after approved slots and marker stripping. The native Vision metadata overrides are not described as unchanged canonical translations. No other non-slot canonical edits are authorized.

## Generated, Skipped and Deferred

- Generated agents: Planner, Implementor, Direct Implementor, Integration Tester, Knowledge Builder, Ask, Vision for both environments.
- Generated skills: author-repo-skill, plan-bug-from-id, plan-user-story-from-id, user-story-analysis, integration-test-knowledge-checklist, with demo-prefixed native names.
- Deferred skill: business-logic-gap-detector. The canonical Implementor body retains its existing special-mode text; no configured gap-detector skill is installed.
- No duplicate knowledge index, clarification schema, local tracker or new product tests.
- Knowledge Builder bootstrap: existing index preserved; only approved glossary/reference reconciliation performed. A future topic-scoped Knowledge Builder run should verify stale knowledge and fill integration-testing gaps.
- Every inline fill and replaced block is in the preservation recipe and answers; all source-only markers are stripped. Native adapters and their complete-body hashes are inventoried separately.
- Five legacy baseline files outside the current generated inventory remain preserved (`.github/skills/` four copies and `CONTEXT.md`); the structural no-orphan-baseline check remains unresolved. Runtime search and remote-image access are also unverified in the generated roles.

## Maintenance History

| Date | Bootstrap contract | Maintain version applied | Summary |
| --- | --- | --- | --- |
| 2026-09-19 | 5.0.0 plus explicit C001 exception | none | First approved install, seven roles and five skills; runtime verification outstanding |
| 2026-09-19 | 5.0.0 | 3.0.0 | Evolved the context glossary to normalize `Client`/`clients` to `Customer`/`Customers` in issue intake and planning artifacts |
| 2026-09-19 | 5.1.0 | 3.0.0 | Applied the Bootstrap 5.1.0 implementation-plan schema delta; refreshed schema and changelog provenance; runtime verification remains outstanding |
| 2026-09-25 | 5.1.1 (repository-local) | 3.0.0 | Evolved native repository-search fallback for Copilot and Codex, retained the user's Copilot Vision metadata, updated Codex Vision model, and corrected local Bootstrap source fallback; generated-role runtime verification remains outstanding |
| 2026-09-25 | 5.2.0 | 3.0.0 | Upgraded seven canonical role mirrors and their native bodies; took upstream search fallback for C010, retained C009 native bindings, and added remote issue-image byte/permission guidance. Native search and image workflows remain unverified in generated roles. |

After future edits, update answers, pristine baseline and customization register together. Use maintain-agentic-system for upgrades. Use the generated Knowledge Builder for topic-scoped evidence refresh, demo-author-repo-skill for reusable procedures, and create-work-item-from-description when ticket creation is explicitly requested.
