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

## Context Glossary

- Glossary-Worthy Terms Found: yes | no
- Existing Glossary Path: `CONTEXT.md` | `<path>` | none
- Proposed Glossary Operation: NEW | MODIFIED | UNMODIFIED
- Reason:
- Terms or Boundaries To Capture:
- Glossary Conflicts:
- Conflict Resolution Questions Asked:
- User-Selected Conflict Resolutions:
- No-Change Rationale:

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
- Platform-specific checks:

## Risks and Rollback

- Risk:
- Rollback:
````

Approval rule: no file writes until `Approved: true` can be tied to an explicit user message.
