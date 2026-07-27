# Bootstrap File Plan Template

Use this before creating or modifying agent-system files.

````markdown
# Agentic System File Plan

## Approval Status

- Approved: false
- Approved By:
- Approved At:
- Source Message:

## Proposed Platform

- Platform:
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

## Batch Approval Plan

| Batch | Approval Status | Proposed Files | Blocking Decisions | Validation |
| --- | --- | --- | --- | --- |
| Core System | pending | root instructions, glossary if needed, manifest, changelog snapshot, knowledge-index shell, repo-local schema files, templates, Planner, Implementor, Tester, Knowledge Builder, Ask if selected | platform, prefix, root instructions, tool decisions, glossary decisions, schema paths | root/template/frontmatter/schema checks |
| Vision Evidence | selected | Vision agent or visual-intake skill | visual support option, relevant visual assets, artifact format | visual artifact support check |
| Knowledge Builder Bootstrap | pending | knowledge index updates and knowledge files | knowledge gaps, authority boundaries, source evidence | knowledge-index checks |
| Skill Template Generation | pending | selected repo-local skills | generated/skipped/deferred choices, tracker/session adapter | skill mirror and adapter checks |
| Contract Audit | pending | audit artifact or final report | approved omissions or wording changes | mirror/tool/manifest validation |

## Visual Artifacts

- Visual Evidence Found: yes | no | unknown
- Visual Evidence Types: screenshots | mockups | wireframes | diagrams | UI snapshots | browser screenshots | image assets | issue attachments | QA images | none
- Proposed Visual Support: Vision agent | visual-intake skill | deferred | no change
- Proposed Visual Artifact Format: SlimUI | structured Markdown | repo-local format | not applicable
- Visual Artifact Path Pattern:
- Reason:
- User-Selected Option:

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
- Clarification Question Schema Path To Reference:
- Manifest Path To Reference:
- Prompt-Sensitive Routing Rule: route the current request to relevant agents, skills, schemas, knowledge-index entries, glossary, partials, and validation commands without bulk-loading repository facts or full role contracts

## Agent Instruction Structure

- Canonical Mirror Runtime Rule: generated agents and skills with mirrors keep mirrored runtime bodies in the main generated files.
- Slot Marker Rule: final generated runtime files strip source-only `CANONICAL-TEMPLATE-SLOT` marker comments.
- Manifest Slot Decision Record:
- Partial Instruction Directory: `<agent-dir>/<prefix>-partials/` | `<path>` | none
- Partial Loading Rule For Non-Mirrored Additions:
- Cross-Role Dependency Loading Rule:
- Prompt-Specific Partial Groups For Non-Mirrored Additions:
- Shared Or Repo-Wide Partial Groups:
- Roles Using Additive Partials: Planner | Implementor | Tester | Knowledge Builder | Vision | Ask | none
- Repo-Specific Roles Or Split Templates:
- Approved Non-Slot Relocations:
- Reason:

## Canonical Template Mirrors

- Slot Syntax: inline `{{SLOT_NAME}}` placeholders for small values; non-nested `<!-- CANONICAL-TEMPLATE-SLOT: SLOT_NAME START -->` / `<!-- CANONICAL-TEMPLATE-SLOT: SLOT_NAME END -->` blocks for larger repo-dependent assumptions.
- Slot Fallback Rule: block content is canonical fallback and may be replaced only from target-repository evidence or explicit user approval.
- Generated Runtime Rule: strip slot marker comments from generated runtime files after applying approved slot content.
- Manifest Record Rule: record source mirror path, generated path, approved slot replacements, approved placeholder values, marker stripping, and any approved non-slot wording or relocation change.

| Mirror | Generated Path | Personalization Slots | Marker Comments In Generated Runtime | Non-Slot Wording Or Relocation Changes | Approval Status |
| --- | --- | --- | --- | --- | --- |
| `templates/agents/planner.agent.md` | `<agent-dir>/<prefix>-planner.agent.md` | prefix, tracker/session paths, knowledge paths, approved tools | stripped | none | pending |
| `templates/agents/implementor.agent.md` | `<agent-dir>/<prefix>-implementor.agent.md` | prefix, validation commands, approved tools | stripped | none | pending |
| `templates/agents/integration-tester.agent.md` | `<agent-dir>/<prefix>-tester.agent.md` | prefix, validation commands, approved tools | stripped | none | pending |
| `templates/agents/knowledge-builder.agent.md` | `<agent-dir>/<prefix>-knowledge-builder.agent.md` | prefix, knowledge paths, glossary path, approved tools | stripped | none | pending |
| `templates/agents/ask.agent.md` | `<agent-dir>/<prefix>-ask.agent.md` | prefix, knowledge paths, approved tools | none | pending |
| `templates/agents/vision.agent.md` | `<agent-dir>/<prefix>-vision.agent.md` | prefix, visual evidence strategy, artifact format, approved tools | none | pending |

## Canonical Skill Inventory

| Skill Mirror | Recommendation | User Choice | Personalization Slots | Manifest Record |
| --- | --- | --- | --- | --- |
| `templates/skills/plan-bug-from-id/SKILL.md` | generate | generate | tracker adapter or local Markdown contract, session root, Planner name | generated |
| `templates/skills/plan-user-story-from-id/SKILL.md` | generate | generate | tracker adapter or local Markdown contract, session root, Planner name | generated |
| `templates/skills/user-story-analysis/SKILL.md` | ask user | undecided | work item adapter, stakeholder terminology | deferred |
| `templates/skills/business-logic-gap-detector/SKILL.md` | ask user | undecided | knowledge paths, validation commands, repository search tools | deferred |
| `templates/skills/integration-test-knowledge-checklist/SKILL.md` | ask user | undecided | test knowledge paths, validation commands | deferred |

## Runtime Schemas

| Source Schema | Generated Path | Operation | Required Preservation | Planner Reference | Approval Status |
| --- | --- | --- | --- | --- | --- |
| `templates/plan-schema.md` | `<template-dir>/plan-schema.md` | NEW | filesystem-tree links, File Details anchors, backlinks, approval metadata, operations, validation commands, risks and rollback | required | pending |
| `templates/question-schema.md` | `<template-dir>/question-schema.md` | NEW | blocking rule, question register, answers table, per-question chat shape, answer-choice format | required | pending |

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
- Root Instructions Reference Manifest: yes | no

## Failure Modes

| Failure Mode | Why Likely Here | Damage | Prevented By | Success Signal |
| --- | --- | --- | --- | --- |
| ... | ... | ... | ... | ... |

## Proposed Files

| Operation | Path | Purpose | User | Failure Mode Prevented |
| --- | --- | --- | --- | --- |
| NEW | `...` | ... | ... | ... |
| MODIFIED | `...` | ... | ... | ... |
| UNMODIFIED | `...` | context only | ... | ... |

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
- Visual artifact support check:
- Root instruction file check:
- Context glossary repo-code/domain focus check:
- Platform-specific checks:

## Risks and Rollback

- Risk:
- Rollback:
````

Approval rule: no file writes until `Approved: true` can be tied to an explicit user message.
