# Bootstrap File Plan Template

Use this before creating or modifying agent-system files.

````markdown
# Agentic System File Plan

## Approval Status

- Approved: false
- Approved By:
- Approved At:
- Source Message:

## Selected Environments

- Environment IDs And User Selection:
- Execution Host (Not A Target Default):
- Client / Version / Context Per Environment:
- Reason:

## Agent Naming

- Prefix Status: proposed | provided | undecided
- Prefix:
- Reason:
- Example Agent Names:

## Design Overview

- Goal:
- Scope:
- Out of Scope:
- Key Decisions:

## Work-Item And Session Contract

- Adapter And Exact Approved Retrieval Tools:
- External Issue ID Format And Validation:
- Current-Issue-Only Rule And Explicit-Reference Exception:
- Required Retrieved Fields And Markdown Conversion:
- Session Root:
- Type-Aware Planning Session ID Recommendation:
- User-Approved Prefix Override:
- Direct Resume Rule:

## Environment And Preservation Plan

- Explicitly Selected Environments And Separate Execution Host:
- Official Sources, Retrieval Dates, Applicable Versions, And Local Evidence:
- Shared Canonical Copies, Per-Environment Bindings, And Native Adapters:
- Source Hashes, Approved Substitution Recipe, And Preservation Command:
- Role / Operation / Environment Tool And Permission Bindings:
- Discovery Collisions, Complete Instruction Loading, And Verification Results:
- Blocked Or Unverified Workflows:

## Batch Approval Plan

Batch Change Choices: select | defer | skip | reorder | split | combine.

| Batch | Approval Status | Proposed Files | Blocking Decisions | Validation |
| --- | --- | --- | --- | --- |
| Core System | pending | root instructions, glossary if needed, manifest, changelog snapshot, knowledge-index shell, repo-local schema files, templates, Planner, Implementor, Tester, Knowledge Builder, Ask if selected | platform, prefix, root instructions, tool decisions, glossary decisions, schema paths | root/template/frontmatter/schema checks |
| Knowledge Builder Bootstrap | pending | knowledge index updates and knowledge files | knowledge gaps, authority boundaries, source evidence | knowledge-index checks |
| Skill Template Generation | pending | selected repo-local skills | generated/skipped/deferred choices, tracker/session adapter | skill mirror and adapter checks |
| Client Guides | pending | `<client-guide-root>/README.md` and one guide per selected environment | guide root, role start methods, handoff steps | guide evidence and link check |
| Contract Audit | pending | audit artifact or final report | approved selections, substitutions, and unresolved compatibility | mirror/tool/manifest validation |

## Image Inspection

- Visual Evidence Found: yes | no | unknown
- Visual Evidence Types: screenshots | mockups | wireframes | diagrams | UI snapshots | browser screenshots | image assets | issue attachments | QA images | none
- Image Inspection Per Environment: inline by the role | approved cheaper-model delegate | blocked | not applicable
- Delegate Model Per Environment (Exact, Verified): `<model>` | not applicable
- Remote Image Access (Private Attachments): verified | blocked | unverified | not applicable
- Visual Evidence Artifact Path Pattern: `<session-root>/<planning-session-id>/artifacts/<image-name>_visual_evidence.md`
- Reason:
- User-Selected Option:

## Role Entrypoints And Client Guides

- Role Route Per Environment (Exactly One): native \| skill — evidence per client surface:
- Environment-Level Bindings (Skill Route Only): every operation the environment's roles need, or not applicable

| Environment | Role | Start Method | Enforcement | Status |
| --- | --- | --- | --- | --- |
| `<id>` | Planner | native agent `<exact-command-or-ui-step>` \| planning skills `plan-bug-from-id`, `plan-user-story-from-id` | runtime-enforced \| instruction-only | verified \| blocked \| unverified |
| `<id>` | `<other-role>` | native agent `<exact-command-or-ui-step>` \| role skill `<agent-prefix><role>` | runtime-enforced \| instruction-only | verified \| blocked \| unverified |

- Role-Bound Skill Activation Per Environment:
- Planner To Implementor Handoff Step Per Environment (New Conversation, Planning Session ID):
- Client Guide Root: `docs/agentic-system/` | `<approved-path>`
- Client Guide Files And Consuming Environments:
- Guide Exclusions From Knowledge Indexing And Runtime Loading:

## Context Glossary

- Glossary-Worthy Terms Found: yes | no
- Existing Glossary Path: `CONTEXT.md` | `<path>` | none
- Proposed Glossary Operation: NEW | MODIFIED | UNMODIFIED
- Reason:
- Repo Code/Domain Terms or Boundaries To Capture:
- Agentic System Terms To Capture Separately:
- Glossary Conflicts:
- Conflict Resolution Questions Asked:
- User-Selected Conflict Resolutions:
- No-Change Rationale:

## Root Instructions

- Root Instruction Path: `AGENTS.md` | `<platform-equivalent-path>`
- Operation: NEW | MODIFIED | UNMODIFIED
- Reason:
- If Not `AGENTS.md`, Approved Equivalent And Rationale:
- Entrypoints To Reference:
- Context Glossary Path To Reference:
- Knowledge Index Path To Reference:
- Implementation Plan Schema Path To Reference:
- Manifest Path To Reference:
- Prompt-Sensitive Routing Rule: route the current request to relevant agents, skills, schemas, knowledge-index entries, glossary, partials, and validation commands without bulk-loading repository facts or full role contracts

## Agent Instruction Structure

- Canonical Mirror Runtime Rule: retain complete canonical copies; verified native adapters load or losslessly embed them when direct registration is unavailable.
- Slot Marker Rule: final generated runtime files strip source-only `CANONICAL-TEMPLATE-SLOT` marker comments.
- Manifest Slot Decision Record:
- Partial Instruction Directory: `<agent-dir>/<prefix>-partials/` | `<path>` | none
- Partial Loading Rule For Non-Mirrored Additions:
- Cross-Role Dependency Loading Rule:
- Prompt-Specific Partial Groups For Non-Mirrored Additions:
- Shared Or Repo-Wide Partial Groups:
- Roles Using Additive Partials: Planner | Implementor | Tester | Knowledge Builder | Ask | none
- Repo-Specific Roles Or Split Templates:
- Non-Slot Drift (Blocking):
- Reason:

## Canonical Template Mirrors

- Slot Syntax: inline `{{SLOT_NAME}}` placeholders for small values; non-nested `<!-- CANONICAL-TEMPLATE-SLOT: SLOT_NAME START -->` / `<!-- CANONICAL-TEMPLATE-SLOT: SLOT_NAME END -->` blocks for larger repo-dependent assumptions.
- Slot Fallback Rule: block content is canonical fallback and may be replaced only from target-repository evidence or explicit user approval.
- Generated Runtime Rule: strip slot marker comments from generated runtime files after applying approved slot content.
- Manifest Record Rule: record source mirror path, generated path, approved slot replacements, approved placeholder values, marker stripping, and native adapters with complete instruction-loading evidence.

| Mirror | Generated Path | Personalization Slots | Marker Comments In Generated Runtime | Non-Slot Preservation Result | Approval Status |
| --- | --- | --- | --- | --- | --- |
| `templates/agents/planner.agent.md` | `<agent-dir>/<prefix>-planner.agent.md` | prefix, tracker/session paths, knowledge paths, approved tools | stripped | none | pending |
| `templates/agents/implementor.agent.md` | `<agent-dir>/<prefix>-implementor.agent.md` | prefix, validation commands, approved tools | stripped | none | pending |
| `templates/agents/integration-tester.agent.md` | `<agent-dir>/<prefix>-tester.agent.md` | prefix, validation commands, approved tools | stripped | none | pending |
| `templates/agents/knowledge-builder.agent.md` | `<agent-dir>/<prefix>-knowledge-builder.agent.md` | prefix, knowledge paths, glossary path, approved tools | stripped | none | pending |
| `templates/agents/ask.agent.md` | `<agent-dir>/<prefix>-ask.agent.md` | prefix, knowledge paths, approved tools | none | pending |

## Canonical Skill Inventory

| Skill Mirror | Recommendation | User Choice | Personalization Slots | Manifest Record |
| --- | --- | --- | --- | --- |
| `templates/skills/author-repo-skill/SKILL.md` | generate | generate | skill root, repository search tool, knowledge source, validation commands | generated |
| `templates/skills/manage-work-item/SKILL.md` | generate when a tracker write binding is verified | undecided | tracker adapter, work-item retrieval tools, work-item write tools | deferred |
| `templates/skills/plan-bug-from-id/SKILL.md` | generate | generate | tracker adapter or local Markdown contract, session root, Planner name | generated |
| `templates/skills/plan-user-story-from-id/SKILL.md` | generate | generate | tracker adapter or local Markdown contract, session root, Planner name | generated |
| `templates/skills/user-story-analysis/SKILL.md` | ask user | undecided | work item adapter, stakeholder terminology | deferred |
| `templates/skills/business-logic-gap-detector/SKILL.md` | ask user | undecided | knowledge paths, validation commands, repository search tools | deferred |
| `templates/skills/integration-test-knowledge-checklist/SKILL.md` | ask user | undecided | test knowledge paths, validation commands | deferred |

## Runtime Schemas

| Source Schema | Generated Path | Operation | Required Preservation | Planner Reference | Approval Status |
| --- | --- | --- | --- | --- | --- |
| `templates/plan-schema.md` | `<template-dir>/plan-schema.md` | NEW | four-section plan shape, `section-filesystem-tree` anchor, file-detail anchors and backlinks, coverage scenarios, flush-left diff blocks, operations timeline rules | required | pending |

The generated Planner carries the clarification-question format in its own body. Do not plan a second file for it.

Record any stronger repo-local equivalent or adaptation in the manifest, including why it replaces the source schema and which required preservation points it still satisfies.

## Version Provenance

- Manifest Path: `<agentic-system-manifest-path>`
- Operation: NEW | MODIFIED | UNMODIFIED
- Installed Bootstrap Skill Changelog Path:
- Repo-Local Bootstrap Changelog Snapshot Path:
- Bootstrap Skill Version Used:
- Bootstrap Contract Applied Through:
- Bootstrap Snapshot Source Status: copied from installed skill changelog | inferred from repo evidence | unknown
- Maintain Skill Version Available:
- Installed Maintain Skill Changelog Path: none | `<path>`
- Package Changelog Path For Context: none | `<path>`
- Bootstrap Baseline Notes:
- Unknown Version Or Snapshot Gaps:
- Root Instructions Reference Manifest Only Behind Explicit Maintenance Guard: yes | no

## Context Boundaries And Integration Setup

- Project Knowledge Root And Index: `knowledge/` / `knowledge/knowledge-index.md`
- Runtime Root: `.agentic-system/` | `<approved-top-level-path>`; existing session, schema, or issue locations kept in place:
- Dedicated Top-Level Maintenance Root: `.agentic-system-maintenance/` | `<approved-top-level-path>`
- Other Maintenance-Only Locations And Aliases:
- File Kinds, Loaded References, And Explicit Maintenance Routers:
- Search / Knowledge Source Exclusions Before Retrieval:
- Native Automatic Loading And Maintenance EntryPoint Evidence:
- Context Audit Inventory, Plan Hash, Command, And Native Fixture Results:
- Per-Environment Integration Transport, Registration Scope, Authentication Method, Credential References (No Secrets), Required Scopes, Login / Reload Steps, And Per-Role Read-Only Verification:
- Legacy Path Migration, Preserved Merge Inputs, Collisions, Rollback, And Deferred Gaps:

## Maintenance Baseline

- Answers File Path: `<maintenance-root>/agentic-system.answers.yaml`
- Baseline Directory Path: `<maintenance-root>/.baseline/`
- Operation: NEW | MODIFIED | UNMODIFIED
- Slots Recorded: `<count>` of `<slots-used-by-the-generated-system>`
- Capabilities Recorded: `<count>`, including every fallback substitution
- Baseline Copies Planned: one per generated file listed under Proposed Files
- Customization Register Rows Planned: `<count>` | none for a first install

Every generated file must have a pristine baseline copy and an answers-file entry. A generated file without both is a broken maintenance baseline, not an acceptable omission.

## Failure Modes

| Failure Mode | Why Likely Here | Damage | Prevented By | Success Signal |
| --- | --- | --- | --- | --- |
| ... | ... | ... | ... | ... |

## Proposed Files

| Operation | Path | Kind / Canonical Source | Consuming Environments | Purpose |
| --- | --- | --- | --- | --- |
| NEW | `...` | canonical-copy / adapter / resource / provenance | `<ids>` | ... |
| MODIFIED | `...` | `<source>` | `<ids>` | ... |
| UNMODIFIED | `...` | context only | `<ids>` | ... |

## File Details

### `<path>`

- Operation:
- Purpose:
- Naming Impact:
- Planned Changes:
- Who Uses It:
- Gate or Skill Supported:
- Failure Mode Prevented:
- Diff Required:
- Diff Rationale:

For modified files, include concise proposed diffs when material.

```diff
- old shape
+ new shape
```

For new files, include full or near-full proposed structure.

## Operations

| Step | Action | Validation |
| --- | --- | --- |
| 1 | ... | ... |

## Validation

- Markdown diagnostics:
- Frontmatter checks:
- Internal link checks:
- Canonical Template Mirror preservation check:
- Personalization Slot check:
- Canonical Skill Inventory manifest check:
- Visual evidence artifact and image inspection check:
- Role entrypoint and Planner handoff check:
- Client guide evidence and link check:
- Root instruction file check:
- Context glossary repo-code/domain focus check:
- Platform-specific checks:

## Risks and Rollback

- Risk:
- Rollback:
````

Approval rule: no file writes until `Approved: true` can be tied to an explicit user message.
