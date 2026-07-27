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
- Visual artifact support check:
- Root instruction file check:
- Context glossary repo-code/domain focus check:
- Platform-specific checks:

## Risks and Rollback

- Risk:
- Rollback:
````

Approval rule: no file writes until `Approved: true` can be tied to an explicit user message.
