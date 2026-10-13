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
- Bootstrap Contract Applied Through: 9.2.0 (includes 9.0, 9.1; earlier: 6.0, 6.1, 7.0, 7.0.1, 8.0; 7.1 superseded by 8.0 `manage-work-item`)
- Bootstrap Snapshot Source Status: copied from installed skill changelog
- Maintain Skill Version Available: 3.4.0
- Maintain Skill Version Last Applied: 3.4.0
- Last Maintenance Date: 2026-10-13

## Generated System Paths

- Maintenance Root: `.agentic-system-maintenance/`
- Project Knowledge Root: `knowledge/`
- Knowledge Index: `knowledge/knowledge-index.md`
- Bootstrap/Maintainer skill bodies remain at their installed `.agents/skills/` paths; their resources are opened only during explicit maintenance.


- Root Instructions: `AGENTS.md`
- Native Agents: `.github/agents/demo-<role>.agent.md`, `.claude/agents/demo-<role>-claude.md` (six roles; Vision retired 2026-10-11)
- Canonical Agents: `docs/agents/canonical/{copilot,claude-code}/agents/`; role bodies identical across environments, frontmatter tools differ
- Skills and complete canonical copies: `.agents/skills/<original-name>/SKILL.md` (six, incl. `manage-work-item`); Claude Code discovers them through `.claude/skills/<name>` links
- Native Configuration: `.claude/settings.json` (maintenance skills user-invocable-only; roles denied for automatic delegation), `.mcp.json` (adds `next-devtools`)
- Claude Code Rules: `.claude/rules/`
- Shared Instructions: `docs/agents/instructions/`
- Native Copilot Instruction Adapters: `.github/instructions/`
- Environment Bindings: `docs/agents/bindings/{copilot,claude-code}.md`; neutral policy: `docs/agents/integration-policy.md`
- Context Glossary: `docs/agents/context-glossary.md`
- Knowledge Index: `knowledge/knowledge-index.md` (migrated from `docs/agents/knowledge/README.md`; links re-keyed)
- Plan Schema: `docs/agents/plan-schema.md`
- Test Plan Schema: `docs/agents/test-plan-schema.md`
- Artifact Gates: `docs/agents/artifact-gates.md`
- Work Item Adapter: `docs/agents/github-issues-adapter.md`
- Session Root: `sessions/`; explicit current ID only
- Session Identity: `sessions/<id>/session-identity.md`
- Session Memory: `sessions/<id>/session-memory.md`
- Session Log: `sessions/<id>/session-log.md`
- Execution Report: `sessions/<id>/execution-report.md`
- Bootstrap Changelog Snapshot: `.agentic-system-maintenance/changelogs/bootstrap-agentic-system.CHANGELOG.md`
- Context Audit: `.agentic-system-maintenance/context-audit.json`
- Approved Maintenance Plan: none retained (the 2026-10-11 plan and report were deleted on 2026-10-13 by user approval; see Maintenance History)
- Runtime Root: not adopted (existing `docs/agents/` and `sessions/` retained, 2026-10-11)
- Maintenance Renderer: `.agentic-system-maintenance/scripts/render-9.2.py` (records and baseline: `finalize-9.2.py`); `render-8.0.py`, `build-audits-8.0.py` and `finalize-8.0.py` are retained history and reference the deleted 2026-10-11 rollback folder
- Answers File: `.agentic-system-maintenance/agentic-system.answers.yaml`
- Baseline Directory: `.agentic-system-maintenance/.baseline/`
- Client Guides: `docs/agentic-system/README.md`, `docs/agentic-system/copilot.md`, `docs/agentic-system/claude-code.md` (for people; excluded from knowledge indexing and runtime loading; linked from `AGENTS.md` and `README.md`)
- Role Entrypoints And Handoff: `## Role entrypoints and handoff` in each binding
- Approved File Plan: `.agentic-system-maintenance/bootstrap-file-plan.md`
- Decisions: `.agentic-system-maintenance/decision-register.json`

## Environment Compatibility

- Execution Host: Claude Code 2.1.296 in VS Code (2026-10-11); earlier: Codex in VS Code Insiders, SDK path 0.153.0
- Selected Environments and role/operation maps: `.agentic-system-maintenance/agentic-system.answers.yaml`
- Compatibility Evidence: `.agentic-system-maintenance/compatibility.md`
- Canonical Source Snapshots: `.agentic-system-maintenance/sources/` (maintenance-only)
- Preservation Plan: `.agentic-system-maintenance/preservation-plan.json`
- Preservation Plan SHA-256: 378888aa61cbd64efe0556fdd72c9b61772f872b7fa0060fb41212d9a7dc4cb7
- Environment Audit: `.agentic-system-maintenance/environment-audit.json`; SHA-256: febcbcfa7ba466749043874e25705bf2f372831259a0f0cd8caf616aa598860a
- Native Body Mapping: `.agentic-system-maintenance/native-adapters.json`
- Structural Verification: `.agentic-system-maintenance/validation-report.md`
- Contract Audit: `.agentic-system-maintenance/contract-audit.md`

| Environment | Registration | Status | Limitations |
| --- | --- | --- | --- |
| Copilot | Six Markdown agents, six canonical skills, scoped instruction adapters; roles start from the Agent dropdown, Implementor handoff via New Chat | unverified | Image inspection inline; `vscode/askQuestions` limits unknown. Also discovers `.claude/agents` (`demo-*-claude`) and `.claude/skills` links; tool picker and handoffs require client verification |
| Claude Code | Six `demo-<role>-claude` subagents run as main sessions with `claude --agent`, six skills via `.claude/skills` links, native `AGENTS.md`, `.claude/rules`, `.claude/settings.json` | unverified | Image inspection via approved haiku `general-purpose` delegate with inline fallback; `AskUserQuestion` max 4 questions per call; Main-session GitHub MCP `issue_read` verified 2026-10-11; `claude --agent` role runs, Agent() deny behaviour and skillOverrides not exercised; diagnostics blocked |

## Customization Register

| C019 | Root, knowledge guard, selected bindings, knowledge index and all project knowledge | context separation and evidence paths | modified-rule | User approved targeted 7.0 migration on 2026-10-10; installed npx Bootstrap/Maintainer skills remain at existing paths, generated maintenance evidence moves to the dedicated root, all project knowledge moves to `knowledge/`, MCP setup remains unchanged | extends-canonical | always; native discovery and exclusion behavior unverified |


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
| C010 | `.agentic-system-maintenance/sources/registry/capabilities.yaml` | repository-search fallback | modified-rule | Approved repository-local 5.1.1 correction was superseded by the 5.2.0 upstream fallback; retained source now matches upstream, while C009 keeps concrete native bindings | superseded by upstream 5.2.0 | drop-when-superseded; resolved in 5.2.0 |
| C011 | `knowledge/testing-flow-checklist.md` | verification evidence and validation commands | modified-rule | Preserve repository-only 2026-09-26 knowledge updates; user approved preservation during 2026-09-27 upgrade; product evidence not reverified | independent repository documentation | always; last verified merge classification 5.3.0; baseline mismatch remains visible |
| C012 | `knowledge/dashboard-navigation-boundaries.md` | verification evidence, vocabulary and breadcrumb behavior | modified-rule | Preserve repository-only 2026-09-26 knowledge updates; user approved preservation during upgrade and full K4 source refresh via demo-knowledge-builder on 2026-09-27; routes, sidebar and breadcrumb sources/test assertions inspected, runtime not verified | independent repository documentation | always; last verified merge classification 5.3.0; baseline mismatch remains visible |

| C013 | Root, bindings, per-environment role slots and native bodies | environment ownership | slot-override | User approved environment-first routing, transitive isolation and static audit on 2026-10-08 | extends-canonical within declared slots | always; re-evaluate on client/schema changes; last checked 5.3.0 plus 6.1 isolation |
| C014 | Planning gathering and Knowledge Builder delegation slots | evidence execution | slot-override | User approved verified default delegation or identical bounded inline evidence on 2026-10-08; tracker access and visual capability guards preserved | extends-canonical within declared slots | always; re-evaluate on client/schema changes; last checked 5.3.0 plus 6.1 isolation |
| C015 | Canonical skills, instruction inventory and verifier | direct discovery and native scope adapters | modified-rule | User approved consolidation and necessary lossless instruction adapters on 2026-10-08; source snapshots/baselines remain maintenance evidence | independent registration; canonical bytes preserved | always; re-evaluate on discovery changes; last checked 5.3.0 plus 6.1 isolation |
| C016 | Codex GitHub Apps binding, three role contracts and seven Codex agent layers | issue retrieval and default-off app policy | modified-rule | User approved app `github`, only issue-fetch and issue-comments tools for Planner, Implementor and Direct Implementor; search/list/write prohibited for those roles; pagination and response schemas remain unverified | extends-canonical through Codex-only environment binding | always; re-evaluate on client/schema changes; runtime access unverified |
| C017 | Codex Neon MCP user config, generator and seven Codex agent layers | Neon Streamable HTTP transport, OAuth and exact operation allowlists | modified-rule | User approved Codex-only workflow repair; live read-only branch listing verified for the linked project on 2026-10-08; generated-role invocation remains unverified | extends-canonical through Codex-only environment binding | always; re-evaluate on client/schema changes; no credentials stored in repository |
| C018 | `docs/agents/integration-policy.md` | Database migration and privilege bootstrap workflow | added-section | User approved explicit Planner Section 4 operations and Implementor execution/verification gates for conditional schema migrations and idempotent Admin privilege seeding; preserve exact target authorization and explicit migration approval | extends-canonical through shared role-binding policy | always; re-evaluate when schema/migration or privilege-seed workflow changes |
| C020 | Work-item creation skill, shared GitHub adapter/policy, and selected bindings | explicit skill-scoped issue creation | modified-rule | User approved native GitHub CLI creation for default Codex on 2026-10-10 after connector 403; retain explicit skill invocation, final proposal approval, exact fields, bounded preflight/result verification and duplicate prevention. Copilot binding and custom-role grants are independent. | repository-authored procedure within existing tracker/client boundaries | always; re-evaluate on client/auth changes; CLI authentication/preflight and approved native creation verified on 2026-10-10 |

| C021 | AGENTS.md SKILL_ROOT slot and authored creation skill inventory | standalone routing and provenance | slot-override | User approved targeted Bootstrap 7.1 root routing, selected binding load and canonical formatting; add authored skill/changelog source snapshots and baseline pairs, retaining legacy text as comparison evidence | extends-canonical within declared root slot; skill itself repository-authored | always; last checked 5.3.0 plus targeted 7.1; native discovery outside this host unverified |

| C022 | `manage-work-item` and all bindings | `WORK_ITEM_WRITE` | slot-override | User approved D2 2026-10-11: GitHub MCP `issue_write` create/update in every environment; no delete, bulk, search or comment tools | extends-canonical within declared slot | always; re-evaluate on tracker/auth changes |
| C023 | `.codex/agents/*.toml`, `.codex/config.toml`, Codex binding | Codex GitHub transport | modified-rule | User: "codex to use github via mcp" (2026-10-11); GitHub MCP with `GITHUB_TOKEN` bearer reference; Codex App connector disabled in every role; supersedes C016 and C020 | extends-canonical through Codex-only environment binding | always; re-evaluate on client/auth changes; authentication unverified |
| C024 | Planner/Direct Implementor `VISION_INVOCATION`, `VISION_AGENT_NAME`, policy | visual evidence | slot-override | User: remove the Vision agent everywhere (2026-10-11); inline image inspection with `visual-evidence v1` JSON; supersedes C001, C002, C007, C008 | extends-canonical within declared slots | always |
| C025 | `.claude/agents/demo-<role>-claude.md`, `.claude/settings.json`, `.claude/skills` links, `.claude/rules` | Claude Code registration | new-agent | User chose native subagents with a `-claude` suffix and maximal sharing (2026-10-11); automatic delegation denied; maintenance skills user-invocable-only | independent native registration; canonical bodies preserved | re-evaluate on discovery changes |
| C026 | Environment-dependent body slots in all role copies | shared neutral bodies (S1) | slot-override | User asked to keep content shared (2026-10-11); slots point to the router-selected `docs/agents/bindings/<environment>.md`; exact identifiers only in bindings and native adapters | extends-canonical within declared slots | always; re-evaluate on client/schema changes |
| C027 | `knowledge/knowledge-index.md` | Path cells | modified-rule | 8.0 context-boundary contract requires repository-relative Path cells; links converted to backticked `knowledge/<file>` paths (2026-10-11) | extends-canonical | always |
| C028 | Planner/Direct Implementor `IMAGE_INSPECTION`, visual-evidence capability rows, integration policy, both bindings | image inspection and evidence format | slot-override | User approved 2026-10-13: Markdown `<image-name>_visual_evidence.md` per image (upstream 9.0); Copilot inline; Claude Code `general-purpose` delegate with `model: haiku`, inline fallback when the model cannot be passed; supersedes C024 | extends-canonical within declared slot and bindings | re-evaluate on client model or delegation changes; last checked 9.2.0 |
| C029 | Planner `ROLE_HANDOFF` and `QUESTION_TOOL`, planning-skill `ROLE_ACTIVATION`, both bindings | role entrypoints, handoff, question delivery | slot-override | User approved 2026-10-13 (Q3): neutral slot values point to the active binding, which holds the exact start, handoff and question-tool steps; extends C026; Claude Code `AskUserQuestion` takes at most 4 questions per call, so larger batches use consecutive calls | extends-canonical within declared slots | always; re-evaluate on client entrypoint or question-tool changes; last checked 9.2.0 |
| C030 | `docs/agentic-system/` | client guides | added-section | Bootstrap 9.0 client guides at the recommended root, written from recorded evidence; linked from `README.md` | independent repository documentation | always; regenerate when an environment, role, entrypoint or handoff step changes |

Retired or superseded 2026-10-11: C001, C002, C007, C008 (Vision retired; see C024), C016 and C020 (see C023), C021 (8.0 `manage-work-item` route). C010 remains resolved. C003, C013, C014, C015 re-checked for claude-code on 8.0.0.

Retired 2026-10-13 (9.2.0 upgrade): C024, superseded by C028 (Bootstrap 9.0 replaced `VISION_INVOCATION` with `IMAGE_INSPECTION` and fixed Markdown evidence).

Retired 2026-10-13: C008, C016, C017, C020 and C023 (Codex environment removed by user approval; their target files, bindings and generated layers were deleted). Rows are kept as history only and no longer apply to any file.

Canonical copies remain exact after approved slots and marker stripping. No other non-slot canonical edits are authorized.

## Generated, Skipped and Deferred

- Generated agents: Planner, Implementor, Direct Implementor, Integration Tester, Knowledge Builder, Ask for copilot and claude-code. Vision retired 2026-10-11.
- Generated skills: author-repo-skill, plan-bug-from-id, plan-user-story-from-id, user-story-analysis, integration-test-knowledge-checklist, manage-work-item (8.0.0, 2026-10-11), with original source names in directly discoverable canonical copies. `create-work-item-from-description` retired (D5).
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

## Bootstrap 8.0.0 Approved Upgrade And Claude Code (2026-10-11)

- Approval: user approved decisions D1–D6 ("approved recommended, remove the vision agent … everywhere, i also want codex to use github via mcp") and both operation sets ("Both U and E"); D-Q1: native subagents with a `-claude` suffix and maximal sharing.
- Upgrade: 8.0.0 templates rendered for all roles and skills; capability sidecar tokens resolved into `## Capability Bindings`; Bootstrap narration sections removed; 6.0 intake changes applied (deferral lifted); `manage-work-item` generated with `WORK_ITEM_WRITE` = GitHub MCP `issue_write`.
- Evolve: claude-code environment (ID `claude-code`, not `claude`, because `bindings/claude.md` collides case-insensitively with `CLAUDE.md` on macOS and auto-loads as nested memory); Vision retired; Codex GitHub moved to MCP.
- Merge: all regions MINE == BASE except C011/C012 (kept). Register-resolved: C001/C002/C007/C008/C016/C020/C021 superseded by explicit user decisions. Root `MAINTENANCE_ROOT` block kept (C019).
- Router fix: the shared `AGENTS.md` no longer carries Claude invocation syntax; `VALIDATION_COMMANDS` no longer sends ordinary work into the maintenance root.
- Verification: shipped canonical verifier passes (27 copies); context-boundary audit passes; environment audit fails only on the inherited `read/problems` lines in Codex and Claude Code Implementor/Integration Tester (8 outputs) and passes for all 67 runtime files without that literal; repository verifier results in `validation-report.md`. Live: Claude Code main-session `issue_read` verified; Codex GitHub configuration verified, authentication not.
- Session-folder contents were excluded. No product code, schema, migrations, tests or product runtime configuration changed.

## Bootstrap 9.2.0 Approved Upgrade (2026-10-13)

- Approval: user "Approve all" on the 2026-10-13 plan; Q1 Markdown visual evidence (take upstream, C024 retired), Q2 Claude Code haiku image delegate with Copilot inline, Q3 environment-specific steps in the bindings (C026); client guides at the recommended `docs/agentic-system/`.
- Upgrade: `render-9.2.py` re-rendered 11 canonical copies (Planner, Direct Implementor, Implementor, Knowledge Builder in both environments; both planning skills; `AGENTS.md`) and 8 native adapters from the recorded recipe plus the new `IMAGE_INSPECTION`, `ROLE_HANDOFF`, `ROLE_ACTIVATION`, Planner `QUESTION_TOOL` and `CLIENT_GUIDE_ROOT` values; empty `VISION_AGENT_NAME` frontmatter remnants removed; Planner gained the `visual-evidence` capability row; 9.1/9.2 batched clarifications applied; `artifact-gates.md` equals the 9.2 template.
- Authored edits: integration policy Visual evidence section and guide exclusion; Role entrypoints and handoff plus image-inspection procedure in both bindings; image line in the three agent-integration instructions; root README image line and guide link; three client guides.
- Records: answers synced with the recipe (Vision slots removed; role entrypoints per environment), decision register, context-audit inventory synced with the installed Bootstrap/Maintainer trees, retired literals extended, source snapshot (12 files) and changelog snapshot refreshed, baselines refreshed after validation.
- Merge: every affected region had MINE == BASE; only C024 conflicted and was resolved by Q1. C011/C012 retained.
- Unchanged: diagnostics slot gap stays blocked (9.2.0 adds no slot); business-logic-gap-detector deferred; native role entrypoints, handoffs and image inspection unverified in both clients.
- Session-folder contents were excluded. No product code, schema, migrations, tests or product runtime configuration changed.

## Maintenance History

| 2026-10-10 | 5.3.0 plus targeted 7.0 isolation | 3.2.1 | Approved evidence/layout migration: moved generated maintenance evidence to `.agentic-system-maintenance/`, consolidated all nine project knowledge documents and the index under `knowledge/`, retained installed Bootstrap/Maintainer skills at their existing paths, and preserved Codex/Copilot MCP configuration. Native loading/search exclusion remains unverified; inherited diagnostics source-slot gap remains blocked. |



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
| 2026-10-10 | 5.3.0 | 3.2.1 | Evolved the explicitly invoked work-item skill route for default Copilot and Codex, preserving role grants and requiring runtime authorization plus explicit issue approval; Codex issue creation and screenshot upload remain blocked/unverified. Refreshed only the five approved policy/binding baselines. |

After future edits, update answers, pristine baseline and customization register together. Use maintain-agentic-system for upgrades. Use the generated Knowledge Builder for topic-scoped evidence refresh, author-repo-skill for reusable procedures, and manage-work-item when ticket creation or update is explicitly requested.

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


## 2026-10-10 Codex Work-Item Creation Repair

Approval: user `approved` after review of the evolve plan and native GitHub CLI procedure. Plan: `.agentic-system-maintenance/maintenance-plan-2026-10-10-codex-issue-create.md`; report: `.agentic-system-maintenance/maintenance-2026-10-10-codex-issue-create.md`. Installed Bootstrap 7.1.0 is available; fully applied remains 5.3.0 with targeted 7.0/7.1 adoption. Maintain 3.2.1; maintenance date 2026-10-10.

Connector create returned 403 and remains blocked. CLI 2.100.0 authentication as violabg through the OS keyring and exact target ADMIN/Issues preflight are verified. CLI mutation was subsequently verified by creating the approved customer story as GitHub issue #8 and fetching only its returned URL; title and body match the approved proposal exactly. Role grants and Copilot binding were preserved. Source preservation and shared-resource coverage are audited; no credentials stored. Session contents and application files were excluded.

Root Skills conflict resolved by approved source render and removal of extra blank line; existing maintenance guard retained in its declared slot. The formerly untracked authored skill has no historical pristine baseline; preapply archive preserves original text and the approved revision is recorded as authored source. C020 updated, C021 added. Rollback: `history/2026-10-10-before-codex-issue-create/`. Protected knowledge differences and inherited diagnostics remain blocked/unverified, not absorbed.

| 2026-10-10 | 5.3.0 plus targeted 7.0/7.1 | 3.2.1 | Approved evolve: default-Codex native GitHub creation procedure after connector 403, standalone root route, authored skill provenance and inventories; retain prior deferrals and unrelated blocked checks. |

Final scoped Contract Auditor review passed. Structural checks: 674 passed, 3 inherited failures; full context audit blocked by unchanged knowledge-index Path cells. Native issue creation verification follows the approved standalone skill separately.

Native default-Codex creation verified: https://github.com/violabg/serviceDeskDemo/issues/8; command exit 0, exact returned-ID title/body verification passed, temporary body transport deleted. Connector create remains blocked by its external permission grant. No generated-role or Copilot execution is inferred from this default-host result.
| 2026-10-11 | 8.0.0 | 3.3.0 | Upgrade 5.3.0→8.0.0 (6.0 deferral lifted, `manage-work-item`, capability bindings) plus evolve: claude-code environment with `-claude` subagents and shared neutral bodies, Vision retired, Codex GitHub via MCP, `create-work-item-from-description` retired. Deferred: business-logic-gap-detector; blocked: diagnostics slot gap; unverified: native role execution in all clients and Codex GitHub authentication. |
| 2026-10-13 | 8.0.0 | 3.3.0 | Evolve: removed the Codex environment by user approval. Deleted `.codex/`, the Codex binding and canonical copies, the maintenance history folder and dated maintenance reports/plans (including baseline mirrors); removed Codex entries from answers, native adapters, preservation plan, audits and decision register (`github-app` row deleted; `mcp` and `environments` values pruned); updated root routing, README and integration router. Bootstrap skill and third-party shadcn reference intentionally unchanged. Environments now: copilot, claude-code. Native runtime verification of the two remaining environments remains unverified. |
| 2026-10-13 | 9.2.0 | 3.4.0 | Upgrade 8.0.0→9.2.0: Vision remnants removed, `IMAGE_INSPECTION` (Markdown evidence; Claude Code haiku delegate, Copilot inline), role entrypoints and fresh-context Implementor handoff via bindings, `ROLE_ACTIVATION` in planning skills, batched Planner clarifications through the question tool, client guides under `docs/agentic-system/`. Deferred: gap-detector skill; blocked: diagnostics slot; unverified: native role entrypoints, handoff and image inspection. |
