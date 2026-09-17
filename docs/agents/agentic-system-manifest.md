# Agentic System Manifest

## Source Package

- Package: `agentic-system-kit`
- Installed Bootstrap Skill Path: `.agents/skills/bootstrap-agentic-system/SKILL.md`
- Installed Bootstrap Skill Changelog Path: `.agents/skills/bootstrap-agentic-system/CHANGELOG.md`
- Installed Maintain Skill Path: `.agents/skills/maintain-agentic-system/SKILL.md`
- Installed Maintain Skill Changelog Path: `.agents/skills/maintain-agentic-system/CHANGELOG.md`
- Package Changelog Path For Context: `.agents/skills/bootstrap-agentic-system/CHANGELOG.md`

## Installed Contract Versions

- Bootstrap Skill Version Used: `3.4.0`
- Bootstrap Contract Applied Through: `3.4.0`
- Maintenance Target: `4.1.0` (Vision model applied; full 4.0.0 capability verification remains blocked)
- Bootstrap Snapshot Source Status: copied from installed skill changelog
- Maintain Skill Version Last Applied: `2.1.0`
- Last Maintenance Date: 2026-09-17

## Generated System Paths

- Root Instructions: `AGENTS.md`
- Context Glossary: `CONTEXT.md`
- Knowledge Index: `docs/agents/knowledge/README.md`
- Plan Schema: `docs/agents/plan-schema.md`
- Artifact Gates: `docs/agents/artifact-gates.md`
- Test Plan Schema: `docs/agents/test-plan-schema.md`
- Agent Directory: `.github/agents`
- Skill Directory: `.github/skills`
- Bootstrap Changelog Snapshot: `docs/agents/skill-changelogs/bootstrap-agentic-system.CHANGELOG.md`
- Answers File: `docs/agents/agentic-system.answers.yaml`
- Baseline Directory: `docs/agents/.baseline/`
- Session Root: `sessions/`
- Work Item Adapter Contract: `.github/skills/plan-bug-from-id/SKILL.md` and `.github/skills/plan-user-story-from-id/SKILL.md`
- Planning Session Identity Artifact: `sessions/<planning-session-id>/session-identity.md`

## Bootstrap Decisions

- Platform: GitHub Copilot.
- Agent prefix: `demo-`.
- Work-item adapter: GitHub Issues using `violabg/serviceDeskDemo#<number>` and planner-only `mcp_github_mcp_s2_issue_read`.
- Session contract: tracker requests use `sessions/us-<issue-number>/` and `sessions/bug-<issue-number>/`; free-form requests use a confirmed request-based ID. Direct resume by supplied or active ID only.
- Knowledge: preserve `docs/agents/knowledge/README.md` as the index and use `CONTEXT.md` as the glossary.
- Visual evidence: `demo-vision`; store source PNG captures and a short Markdown note under `sessions/<planning-session-id>/visual/`.
- Vision model: `gpt-5.6 luna` (user-approved exact model).
- Validation: artifact gate linting, then lint, typecheck, test, and build for buildable app changes.

## Mirror Inventory

### Generated

- `templates/instructions/AGENTS.md` to `AGENTS.md`
- `templates/instructions/knowledge-guard.instructions.md` to `.github/instructions/knowledge-guard.instructions.md`
- `templates/instructions/planning-sessions.instructions.md` to `.github/instructions/planning-sessions.instructions.md`
- `templates/plan-schema.md` to `docs/agents/plan-schema.md`
- `templates/artifact-gates.md` to `docs/agents/artifact-gates.md`
- `templates/test-plan-schema.md` to `docs/agents/test-plan-schema.md`
- `templates/agents/planner.agent.md` to `.github/agents/demo-planner.agent.md`
- `templates/agents/implementor.agent.md` to `.github/agents/demo-implementor.agent.md`
- `templates/agents/integration-tester.agent.md` to `.github/agents/demo-integration-tester.agent.md`
- `templates/agents/knowledge-builder.agent.md` to `.github/agents/demo-knowledge-builder.agent.md`
- `templates/agents/ask.agent.md` to `.github/agents/demo-ask.agent.md`
- `templates/agents/vision.agent.md` to `.github/agents/demo-vision.agent.md`
- `templates/skills/plan-bug-from-id/SKILL.md` to `.github/skills/plan-bug-from-id/SKILL.md`
- `templates/skills/plan-user-story-from-id/SKILL.md` to `.github/skills/plan-user-story-from-id/SKILL.md`
- `templates/skills/user-story-analysis/SKILL.md` to `.github/skills/user-story-analysis/SKILL.md`
- `templates/skills/integration-test-knowledge-checklist/SKILL.md` to `.github/skills/integration-test-knowledge-checklist/SKILL.md`

### Skipped

- `templates/skills/author-repo-skill/SKILL.md`: not selected for the first install.
- `templates/skills/business-logic-gap-detector/SKILL.md`: not selected for the first install.

### Deferred

- Initial knowledge-index refinement: preserve the existing index; run `demo-knowledge-builder` after Bootstrap.

## Marker And Tool Decisions

- Source-only `CANONICAL-TEMPLATE-SLOT` comments were stripped from all generated runtime mirror files.
- Canonical non-slot wording and baseline frontmatter were preserved.
- `mcp_github_mcp_s2_issue_read` remains the recorded planner-only retrieval binding, but its exact availability is unverified against the configured `github/*` surface. ID-based workflows must stop when unavailable; no replacement was silently approved.
- Existing registered Planner and Knowledge Builder MCP/editor tool surfaces are preserved verbatim. Their wildcard grants predate this maintenance; no tools were added. Exact per-role strings are recorded in the answers file.

## Customization Register

The following deliberate deviations are repository-owned and must be preserved on future maintenance runs unless explicitly changed.

| ID | Target File | Region | Kind | Reason | Upstream Relation | Survives Upgrade | Last Verified Version |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `demo-planner-tools` | `.github/agents/demo-planner.agent.md` | frontmatter `tools` | `modified-rule` | User customized the planner tool surface to include repository-approved MCP and editor capabilities. | `overrides-canonical` | `always` | `3.4.0` |
| `demo-knowledge-builder-tools` | `.github/agents/demo-knowledge-builder.agent.md` | frontmatter `tools` | `modified-rule` | User customized the knowledge-builder tool surface to include repository-approved MCP and editor capabilities. | `overrides-canonical` | `always` | `3.4.0` |
| `custom-mcp-config` | `.vscode/mcp.json` | `servers` | `modified-rule` | User added custom MCP server configuration that informs approved agent tool-surface customizations. | `independent` | `always` | `3.4.0` |
| `customer-terminology` | `CONTEXT.md` | Customer glossary row | `modified-rule` | User established Customer as the canonical application and label term; client is explanatory only. | `independent` | `always` | `3.4.0` |

| `native-search-binding` | Five updated agent contracts | Bootstrap Template Repository Search; Capability Substitutions; search instructions | `modified-rule` | Bind source search terminology to existing role tools and bounded file reads; remove nonexistent root-registry dependency. | `extends-canonical` | `drop-when-superseded` | `4.0.0` |
| `tester-integration-scope` | `.github/agents/demo-integration-tester.agent.md` | Gate 9 / Do not | `modified-rule` | Permit integration tests, retaining system/E2E exclusion; upstream accidentally prohibits its own role. | `overrides-canonical` | `drop-when-superseded` | `4.0.0` |
| `tester-local-schema-lifecycle` | `.github/agents/demo-integration-tester.agent.md` | Gates 5–8 | `modified-rule` | Match the approved local schema: session-local unapproved drafts, approval metadata, same-file revision, TestingInProgress status. | `extends-canonical` | `drop-when-superseded` | `4.0.0` |
| `planner-gate3-validation` | `.github/agents/demo-planner.agent.md` | Gate 3 / Completion Criteria and verification | `modified-rule` | Retain baseline C1–C6 criteria and table still required by upstream behavior rules. | `extends-canonical` | `drop-when-superseded` | `4.0.0` |
| `planner-blocker-precedence` | `.github/agents/demo-planner.agent.md` | Operating Contract / Gate execution model | `modified-rule` | Preserve required blocker halts over routine auto-advance; failed capability checks must stop. | `extends-canonical` | `drop-when-superseded` | `4.0.0` |
| `preserve-runtime-formatting` | Existing agent and skill mirrors | Unchanged regions; tools frontmatter | `modified-rule` | Approved merge retains repository formatting and exact tool lists while applying changed behavior. | `independent` | `always` | `4.0.0` |
| `vision-model` | `.github/agents/demo-vision.agent.md` | frontmatter `model` | `slot-override` | User explicitly selected the Vision model for Bootstrap 4.1.0. | `overrides-canonical` | `always` | `4.1.0` |

## Maintenance History

| Date | Maintain Skill Version | Bootstrap Contract Before | Bootstrap Contract After | Plan Or Summary Path | Notes |
| --- | --- | --- | --- | --- | --- |
| 2026-07-29 | none | none | `2.0.0` | This manifest | Initial Bootstrap installation. |
| 2026-07-29 | `2.0.0` | `2.0.0` | `2.0.0` | This manifest | Evolve run added `demo-ask` and registered deliberate planner, knowledge-builder, and MCP customizations. |
| 2026-07-30 | `2.0.0` | `2.0.0` | `3.1.0` | This manifest | Upgrade run refreshed planning-session rules, planner session-artifact workflow, plan schema, changelog snapshot, and baseline provenance. |
| 2026-07-31 | `2.0.0` | `3.1.0` | `3.1.2` | This manifest | Upgrade run restored missing generated skill mirrors, re-added `demo-ask` to the root router, refreshed the Bootstrap changelog snapshot, and refreshed baseline provenance. |
| 2026-08-02 | `2.0.0` | `3.1.2` | `3.1.2` | This manifest | Evolve run clarified Customer terminology, synchronized three generated mirrors with current Bootstrap templates, and refreshed baseline provenance. |
| 2026-08-03 | `2.0.0` | `3.1.2` | `3.3.0` | This manifest | Upgrade run applied Bootstrap 3.2.0 capability guards and 3.3.0 role tooling-intent profiles; preserved registered planner and knowledge-builder tool customizations and refreshed baseline provenance. |
| 2026-08-26 | `2.0.0` | `3.3.0` | `3.4.0` | This manifest | Upgrade run accepted the four already-present 3.4.0 agent refinements, preserved registered tool-surface customizations, retained the approved business-logic-gap-detector deferral, and refreshed baseline provenance. Evolve review found no root-router change required. |

| 2026-09-13 | `2.1.0` | `3.4.0` | `3.4.0` (target `4.0.0` partially applied) | This manifest, maintenance assessment below | User approved upgrade and merge policy. Applied guards, invocation slots, local test schema, session workflow, and restored workflow bodies; retained protected tools and corrected audited contradictions. Tracker verification remains blocked, not deferred or passed. |
| 2026-09-17 | `2.1.0` | `3.4.0` | `3.4.0` (target `4.1.0` partially applied) | This manifest, maintenance assessment below | User approved and selected `gpt-5.6 luna` for Vision. Applied the 4.1.0 model slot; full 4.0.0 capability verification remains blocked. |

## Maintenance Assessment — 2026-09-13

- Mode: upgrade to installed Bootstrap 4.0.0, plus the approved integration-scope correction. Approval: **true**, explicit user approval in the maintenance conversation.
- Detection: root router, six agents, four generated skills, scoped instructions, glossary, knowledge index, schemas, manifest, answers, and all 19 original baseline pairs existed. The new test schema adds the twentieth pair.
- Repository drift: existing Implementor/Vision formatting, checklist blank lines, and glossary EOF normalization; no substantive local region conflict identified. Protected tool customizations remain unchanged.
- Session-folder contents were excluded from discovery, reads, validation, and edits. Application code, tests, schema, migrations, and runtime configuration were not changed.

### Classified Bootstrap 4.0.0 deltas

| Delta | Classification | Operation / evidence |
| --- | --- | --- |
| Approved-binding capability guards | applied | Updated Ask, Implementor, Integration Tester, Knowledge Builder, and Planner. Existing per-role native search operations replace source-only terminology. |
| Target tool and invocation slots | applied | Answers now record per-role exact tools, question invocation, bounded native-or-inline gathering/discovery, and Vision invocation. Existing tool surfaces retained. Live invocation verification remains separately unknown. |
| Local test-plan YAML fallback | applied | Installed `test-plan-schema.md`; Tester schema binding, draft/approval lifecycle, and status spelling aligned with it. |
| Direct session resume and Planner evidence writes | applied | Planner permits current-session evidence writes and forbids other-session enumeration. |
| Conditional tracker setup | applied | Planning-session instructions distinguish tracker-backed and free-form requests; existing no-fallback tracker decision preserved. |
| Restored workflow bodies and examples | applied | Updated generated Planner, Ask, Tester, Knowledge Builder and work-item gathering bodies; registered necessary coherence corrections. |
| Grouped routine Bootstrap intake approvals | not applicable | Existing installation, no new Bootstrap intake. |
| Exact tracker binding availability | unknown | Current tool discovery did not expose `mcp_github_mcp_s2_issue_read`; `github/*` configuration alone proves neither exact invocation nor comment retrieval. Requires verification in the target Copilot host. ID-based planning remains blocked if the binding is absent. |

### Region merge outcomes and operations

- Unchanged baseline regions with upstream behavior changes: take upstream. Equivalent regions: retain repository wording/formatting. Repository formatting overlaps: approved merge of upstream behavior with existing formatting where practical.
- Planner and Knowledge Builder frontmatter: retain protected `always` customization rows. All six role tool lists remain unchanged.
- Planner Gate 3 and blocker stops: retain baseline validation and required failure behavior where upstream changes would leave contradictory references; see register rows.
- Tester schema and Gate 9: apply the approved local schema and scope correction; normalize draft persistence and status spelling as required for compatibility.
- Updated runtime files: `.github/agents/demo-{ask,implementor,integration-tester,knowledge-builder,planner}.agent.md`, both `.github/skills/plan-*-from-id/SKILL.md` mirrors, and `.github/instructions/planning-sessions.instructions.md`.
- Added `docs/agents/test-plan-schema.md`. Updated this manifest, `agentic-system.answers.yaml`, and the local Bootstrap changelog snapshot. Refresh baseline copies only for these approved changed/added files, after validation.
- Root router, glossary, Vision, other skill mirrors, knowledge documents, implementation-plan schema, and artifact gates remain unchanged.

### Validation and remaining limitations

- Validation passed: YAML parsing for answers, all agent/skill frontmatter, and scoped instructions; 20 unique generated entries; unchanged role tool lists; resolved runtime slot markers; five capability guards; restored Planner criteria and blocker stops; test-schema fields, status spelling, draft/approval lifecycle; changelog snapshot equality; `git diff --check`. Focused Contract Auditor recheck confirmed all four coherence findings resolved and found no additional material regressions. Baseline equality checked after the approved refresh.
- Full 4.0.0 completion is **blocked**, not claimed. Phase G required capability inputs, output artifacts, prerequisites, and exact live tool bindings cannot all be verified here: tracker is unverified; existing Vision image intake and target-host delegation have not been exercised. The pre-existing visual-evidence substitution in Vision/Implementor still names a root registry that is absent, and remains part of this blocked capability audit.
- Pre-existing Phase F/G concerns remain: Planner does not explicitly state knowledge-index schema provenance and schema-over-formatting precedence; generated ID skills do not explicitly state Planner-only activation. No complete Phase F/G pass is claimed.
- `pnpm agent:lint-artifacts` is intentionally not run: it reads a planning session, excluded by the approved maintenance scope. `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build` are not applicable to these agent-documentation changes.
- Rollback: restore only this maintenance diff (including matching baseline copies), remove the newly added test schema and its baseline, and restore provenance together; preserve unrelated working-tree changes.
- Next: verify the exact issue-and-comments binding in the configured Copilot host before advancing applied-through to 4.0.0. Run `demo-knowledge-builder` after this structural update. For tracker creation workflows use `create-work-item-from-description`; author repeatable repository procedures as local skills rather than expanding agent contracts.

## Maintenance Assessment — 2026-09-17

- Mode: upgrade toward installed Bootstrap 4.1.0. Approval: **true**; user selected `gpt-5.6 luna` as the exact Vision model.
- Classified 4.1.0 delta: Vision model decision — **applied**. The answers file records the slot and the Vision agent declares the approved model.
- Region merge: Vision frontmatter had no repository-side change beyond the approved slot addition; all existing custom formatting and tool-surface decisions were preserved.
- Session-folder contents were excluded from discovery, reads, validation, and edits. Application code, tests, schema, migrations, and runtime configuration were not changed.
- Full contract application remains blocked by the previously recorded 4.0.0 capability-verification gaps; `Bootstrap Contract Applied Through` therefore remains `3.4.0`.
