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
- Bootstrap Contract Applied Through: 5.3.0 with the explicit Vision native-metadata exceptions below
- Bootstrap Snapshot Source Status: copied from installed skill changelog
- Maintain Skill Version Available: 3.1.0
- Maintain Skill Version Last Applied: 3.1.0
- Last Maintenance Date: 2026-10-10

## Generated System Paths

- Root Instructions: `AGENTS.md`
- Native Agents: `.codex/agents/`, `.github/agents/`
- Canonical Agents: `docs/agents/canonical/{codex,copilot}/agents/`
- Skills and complete canonical copies: `.agents/skills/<original-name>/SKILL.md`; no native skill wrappers
- Shared Instructions: `docs/agents/instructions/`
- Native Copilot Instruction Adapters: `.github/instructions/`
- Environment Bindings: `docs/agents/bindings/{codex,copilot}.md`; neutral policy: `docs/agents/integration-policy.md`
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
- Preservation Plan SHA-256: fe60506753713168ec6e6a6bf7d44447dd06136c7437a0950dc1638439d5bdd7
- Environment Audit: `docs/agents/environment-audit.json`; SHA-256: 5477c3bbd9a279c716fff1bca23e5881961942580f46969237fd091eb3d274fc
- Native Body Mapping: `docs/agents/native-adapters.json`
- Structural Verification: `docs/agents/validation-report.md`
- Contract Audit: `docs/agents/contract-audit.md`

| Environment | Registration | Status | Limitations |
| --- | --- | --- | --- |
| Codex | Seven TOML agents, five directly discoverable canonical skills, root routing | unverified | Native discovery, GitHub Apps config-layer inheritance, connected schemas and effective role operations not executed in current sandbox |
| Copilot | Seven Markdown agents, five directly discoverable canonical skills, scoped instruction adapters | unverified | Actual client/model/tool picker and generated-role handoffs require client verification |

## Customization Register

| ID | Target | Region | Kind | Reason / user evidence | Upstream Relation | Survives Upgrade |
| --- | --- | --- | --- | --- | --- | --- |
| C001 | `.github/agents/demo-vision.agent.md` | disable-model-invocation | modified-rule | User explicitly requires Planner to spawn Vision when the active model lacks vision | overrides-canonical | always; retain until user changes it |
| C002 | Planner and Direct Implementor copies | VISION_INVOCATION slot | slot-override | Inline extraction if capable, otherwise Luna delegate; parent JSON reference bridges Planner JSON intake and Vision SlimUI output | extends-canonical within declared slot | always |
| C003 | `.agents/skills/<original-name>/SKILL.md` | name and discovery | modified-rule | User approved original source names and complete direct canonical skills on 2026-10-08; runtime wrappers retired; source-template catalog collision remains unverified | independent native discovery; canonical metadata intact | re-evaluate on discovery changes; last checked 5.3.0 plus 6.1 isolation |
| C004 | Environment bindings, neutral integration policy and Copilot integration instruction | repository bindings | added-section | Approved 2026-10-08 separation preserves GitHub-only planning, exact grants, English, current-role routing and authority limits; exact syntax belongs to its owner | extends-canonical through existing tooling slots | always; last checked 5.3.0 plus 6.1 isolation |
| C005 | two existing knowledge files and README | obsolete references and test ownership | modified-rule | Reconcile missing Demo agents/glossary, session identity and Integration Tester production-code boundary | independent repository documentation | always |
| C006 | `docs/agents/context-glossary.md` | Customer/Client terminology normalization | modified-rule | User approved `Customer`/`Customers` as the canonical Service Desk term; normalize `Client`/`clients` from issue wording in user stories and bugs | independent repository documentation | always |
| C007 | `.github/agents/demo-vision.agent.md` | model and tools frontmatter | modified-rule | User selected GPT-6 Luna (copilot) and web/GitHub retrieval for repository images; duplicate tool removed without changing granted tool set | overrides-canonical native metadata | always; recheck tool availability and scope |
| C008 | `.codex/agents/demo-vision.toml` | model metadata | modified-rule | User approved the Codex counterpart for repository image analysis with GPT-6 Luna; native image viewing still requires runtime verification | overrides-canonical native metadata | always; recheck model and image tool at runtime |
| C009 | Neutral integration policy, environment bindings and answers | repository-search resolution and visual binding | added-section | Preserve derived bounded clusters and actual image input; selected binding provides exact native procedure, approved 2026-10-08 | extends-canonical through existing search slot and native operation binding | always; re-evaluate if native search/image tools change; last checked 5.3.0 plus 6.1 isolation |
| C010 | `docs/agents/sources/registry/capabilities.yaml` | repository-search fallback | modified-rule | Approved repository-local 5.1.1 correction was superseded by the 5.2.0 upstream fallback; retained source now matches upstream, while C009 keeps concrete native bindings | superseded by upstream 5.2.0 | drop-when-superseded; resolved in 5.2.0 |
| C011 | `docs/agents/knowledge/testing-flow-checklist.md` | verification evidence and validation commands | modified-rule | Preserve repository-only 2026-09-26 knowledge updates; user approved preservation during 2026-09-27 upgrade; product evidence not reverified | independent repository documentation | always; last verified merge classification 5.3.0; baseline mismatch remains visible |
| C012 | `docs/agents/knowledge/dashboard-navigation-boundaries.md` | verification evidence, vocabulary and breadcrumb behavior | modified-rule | Preserve repository-only 2026-09-26 knowledge updates; user approved preservation during upgrade and full K4 source refresh via demo-knowledge-builder on 2026-09-27; routes, sidebar and breadcrumb sources/test assertions inspected, runtime not verified | independent repository documentation | always; last verified merge classification 5.3.0; baseline mismatch remains visible |

| C013 | Root, bindings, per-environment role slots and native bodies | environment ownership | slot-override | User approved environment-first routing, transitive isolation and static audit on 2026-10-08 | extends-canonical within declared slots | always; re-evaluate on client/schema changes; last checked 5.3.0 plus 6.1 isolation |
| C014 | Planning gathering and Knowledge Builder delegation slots | evidence execution | slot-override | User approved verified default delegation or identical bounded inline evidence on 2026-10-08; tracker access and visual capability guards preserved | extends-canonical within declared slots | always; re-evaluate on client/schema changes; last checked 5.3.0 plus 6.1 isolation |
| C015 | Canonical skills, instruction inventory and verifier | direct discovery and native scope adapters | modified-rule | User approved consolidation and necessary lossless instruction adapters on 2026-10-08; source snapshots/baselines remain maintenance evidence | independent registration; canonical bytes preserved | always; re-evaluate on discovery changes; last checked 5.3.0 plus 6.1 isolation |
| C016 | Codex GitHub Apps binding, three role contracts and seven Codex agent layers | issue retrieval and default-off app policy | modified-rule | User approved app `github`, only issue-fetch and issue-comments tools for Planner, Implementor and Direct Implementor; search/list/write prohibited; pagination and response schemas remain unverified | extends-canonical through Codex-only environment binding | always; re-evaluate on client/schema changes; runtime access unverified |
| C017 | Codex Neon MCP user config, generator and seven Codex agent layers | Neon Streamable HTTP transport, OAuth and exact operation allowlists | modified-rule | User approved Codex-only workflow repair; live read-only branch listing verified for the linked project on 2026-10-08; generated-role invocation remains unverified | extends-canonical through Codex-only environment binding | always; re-evaluate on client/schema changes; no credentials stored in repository |
| C018 | `docs/agents/integration-policy.md` | Database migration and privilege bootstrap workflow | added-section | User approved explicit Planner Section 4 operations and Implementor execution/verification gates for conditional schema migrations and idempotent Admin privilege seeding; preserve exact target authorization and explicit migration approval | extends-canonical through shared role-binding policy | always; re-evaluate when schema/migration or privilege-seed workflow changes |

Canonical copies remain exact after approved slots and marker stripping. The native Vision metadata overrides are not described as unchanged canonical translations. No other non-slot canonical edits are authorized.

## Generated, Skipped and Deferred

- Generated agents: Planner, Implementor, Direct Implementor, Integration Tester, Knowledge Builder, Ask, Vision for both environments.
- Generated skills: author-repo-skill, plan-bug-from-id, plan-user-story-from-id, user-story-analysis, integration-test-knowledge-checklist, with original source names in directly discoverable canonical copies (2026-10-08).
- Deferred skill: business-logic-gap-detector. The canonical Implementor body retains its existing special-mode text; no configured gap-detector skill is installed.
- No duplicate knowledge index, clarification schema, local tracker or new product tests.
- Knowledge Builder bootstrap: existing index preserved; only approved glossary/reference reconciliation performed. A future topic-scoped Knowledge Builder run should verify stale knowledge and fill integration-testing gaps.
- Every inline fill and replaced block is in the preservation recipe and answers; all source-only markers are stripped. Native adapters and their complete-body hashes are inventoried separately.
- Four legacy `.github/skills` copies and their baselines were retired under the 2026-10-08 approval. The unrelated `CONTEXT.md` orphan baseline remains preserved; the structural no-orphan-baseline check remains unresolved. Runtime search and remote-image access are also unverified in the generated roles.

## Bootstrap 5.3.0 Approved Upgrade

- Approval: user `approved all`, 2026-09-27, including the proposed per-file path values and Copilot Integration Tester restoration.
- Ask/Knowledge Builder canonical capability and tooling regions take upstream; unchanged baseline proves no overlapping repository edits. Native bodies are regenerated losslessly with existing tool grants. Explicit operation evidence preserves read-only Ask and knowledge-only editing.
- Planning gathering outputs already satisfy the release; only source marker hashes and snapshots change. Vision C001/C007/C008 explicit choices remain authoritative over the recommendation. Existing customization rows remain in force; C004 repository bindings now include explicit 5.3.0 operation scope.
- Copilot Integration Tester formatting drift is resolved by restoring the exact recorded body/frontmatter, not by baselining the drift.
- C011/C012 preserve the two repository-only knowledge updates without refreshing their pristine baselines. Five orphan baselines remain approved deferred debt; full structural validation is not certified as passing.
- Both selected environments remain unverified for generated-role discovery, effective tools, MCP prerequisites, handoffs and image operations. No client-version upgrade is implied.
- Session-folder contents were excluded from discovery and edits. Product code, runtime configuration and tests were outside scope.

## Maintenance History

| Date | Bootstrap contract | Maintain version applied | Summary |
| --- | --- | --- | --- |
| 2026-09-19 | 5.0.0 plus explicit C001 exception | none | First approved install, seven roles and five skills; runtime verification outstanding |
| 2026-09-19 | 5.0.0 | 3.0.0 | Evolved the context glossary to normalize `Client`/`clients` to `Customer`/`Customers` in issue intake and planning artifacts |
| 2026-09-19 | 5.1.0 | 3.0.0 | Applied the Bootstrap 5.1.0 implementation-plan schema delta; refreshed schema and changelog provenance; runtime verification remains outstanding |
| 2026-09-25 | 5.1.1 (repository-local) | 3.0.0 | Evolved native repository-search fallback for Copilot and Codex, retained the user's Copilot Vision metadata, updated Codex Vision model, and corrected local Bootstrap source fallback; generated-role runtime verification remains outstanding |
| 2026-09-25 | 5.2.0 | 3.0.0 | Upgraded seven canonical role mirrors and their native bodies; took upstream search fallback for C010, retained C009 native bindings, and added remote issue-image byte/permission guidance. Native search and image workflows remain unverified in generated roles. |
| 2026-09-27 | 5.3.0 | 3.0.0 | Approved upgrade of Ask/Knowledge Builder capability tables and native bodies; refreshed explicit operation provenance and source hashes; restored Copilot Integration Tester canonical formatting; preserved Luna and knowledge drift, with baseline debt and native runtime verification deferred. |
| 2026-09-27 | 5.3.0 | 3.0.0 | User-approved demo-knowledge-builder publication of K4 dashboard navigation refresh and focused index trigger; inspected route/sidebar/breadcrumb sources and existing test assertions; no product changes or native-runtime verification; knowledge baselines remain unchanged. |

| 2026-10-08 | 5.3.0 | 3.1.0 | Approved Codex-only GitHub Apps correction; enabled only issue fetch/comments for three roles, defaulted the app off in all seven Codex layers, preserved Copilot and prohibited search/list/write; runtime schema and access remain unverified. |
| 2026-10-08 | 5.3.0 | 3.1.0 | Repaired Codex Neon MCP endpoint, OAuth and per-role transport/allowlists; verified a read-only branch listing for the linked project; custom-role invocation remains unverified. |
| 2026-10-10 | 5.3.0 | 3.1.0 | Evolved shared database workflow policy: Planner must include conditional migration, privilege seed and Admin verification steps; Implementor must confirm plan coverage, exact target authorization, and apply/verify only when needed. Session contents and product code were excluded. |

After future edits, update answers, pristine baseline and customization register together. Use maintain-agentic-system for upgrades. Use the generated Knowledge Builder for topic-scoped evidence refresh, demo-author-repo-skill for reusable procedures, and create-work-item-from-description when ticket creation is explicitly requested.

## 2026-10-08 Approved Environment Isolation

User approved the focused evolve plan, original skill names, bounded inline evidence fallback and deferral of 6.0 changes. Maintain 3.1.0 applied; Bootstrap applied-through stays 5.3.0. See `maintenance/2026-10-08-plan.md` and its operations inventory. Exact preservation is verified statically; the runtime isolation audit is blocked by an inherited diagnostics source-slot gap; native generated-role discovery/access remains unverified. Source-template skill catalog collisions remain visible. Session contents were excluded. Two protected knowledge differences and the unrelated CONTEXT baseline orphan are retained.

| 2026-10-08 | 5.3.0 plus targeted 6.1.0 isolation | 3.1.0 | Approved evolve: separated environments, corrected default delegation, consolidated configured canonical skills, added static runtime audit; deferred full 6.0/6.1 adoption and retained existing baseline/native-discovery debt. |

## 2026-10-08 Codex GitHub Apps Correction

User approved app ID `github`, with `default_tools_enabled = false` for all seven Codex role layers and only `github_fetch_issue` plus `github_fetch_issue_comments` enabled for Planner, Implementor and Direct Implementor. Copilot's GitHub binding and `.github` outputs were not changed. Issue search, listing and tracker writes remain prohibited.

The connected tool schemas, comment pagination support, issue-fetch type/label coverage, account availability and effective layer inheritance remain unverified. The shared adapter requires explicit complete pagination, uses type/labels only if returned, and stops or asks when evidence is missing. Structural checks retain the known Codex `read/problems` audit gap, the two protected knowledge baseline differences, and the `CONTEXT.md` orphan baseline. Session-folder contents were excluded.

## Inherited Diagnostics Source Contract Gap

Status: **BLOCKED** for Codex Implementor and Integration Tester diagnostics. The saved 5.3.0 source mirrors and installed 6.1.0 mirrors hardcode `read/problems` outside a declared tooling slot (Implementor one occurrence, Integration Tester four). The Codex canonical copies and their decoded TOML embeddings retain these exact source lines. The new full audit correctly rejects this Copilot binding in all four runtime outputs; no waiver or invented Codex tool was added. The other 51 direct runtime file scans found no foreign binding; the full audit remains failing rather than certifying partial coverage. A follow-up source-contract proposal should add a declared `DIAGNOSTICS_TOOL` placeholder to those mirrors and bind each environment to its actual diagnostics procedure. Until approved and applied, preserve the gap and block the affected diagnostic operation.


## 2026-10-08 Codex Neon MCP Repair

Codex's global Neon URL used the legacy SSE endpoint, so Codex CLI could not speak the configured transport. The endpoint now uses Streamable HTTP (`https://mcp.neon.tech/mcp`), OAuth is connected, and the user-level allowlist exposes only the nine Neon operations declared by the Codex role bindings. The seven generated Codex agent layers now each include complete Neon and next-devtools transport settings; their role-specific Neon allowlists remain exact. Copilot files and configuration were not changed.

A fresh Codex CLI read-only run and a current `mcp__neon__list_branches` call successfully listed the linked project's `main` branch and made no database changes. The separate `mcp__codex_apps__neon` connector is not logged in here; it is independent of Codex user-configured MCP OAuth. The first immediate call raced MCP startup and did not see the tool; the next trace confirmed a successful call. Codex should allow optional MCP servers to finish startup before treating an initial missing-tool response as final. The generated custom-role runtime and layer inheritance remain unverified. See `maintenance/2026-10-08-codex-neon-mcp.md` and `compatibility.md`.
