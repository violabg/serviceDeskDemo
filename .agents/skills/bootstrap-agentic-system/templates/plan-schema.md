# Implementation Plan Schema

Use this schema for generated Planner agents when they produce the implementation plan that gates code work. It is preserved here as reusable skill reference material.

````text
# Implementation Plan

## Session ID
- Session:

## Approval Status
- Approved: false
- Approved By:
- Approval Date:

## 1. Design Overview
- Goal:
- Scope:
- Out of Scope:
- Key Decisions:

## 2. Selected Repository Knowledge
- Selected Knowledge Files:
- Rule Inventory:
- Alignment Notes:

## 3. Filesystem Tree

> Paths link to their File Details entry below for quick navigation.

| Operation | Path | Reason |
| --- | --- | --- |
| NEW | [`...`](#file-slug) | ... |
| MODIFIED | [`...`](#file-slug) | ... |
| UNMODIFIED | [`...`](#file-slug) | context or validation scope only |

Path slug rule: lowercase the path, replace every run of non-alphanumeric characters with `-`, then trim leading and trailing `-`.

## 4. File Details

<a id="file-slug"></a>

### `<path>`
Back to [Filesystem Tree](#3-filesystem-tree)

- Operation:
- Purpose:
- Planned Changes:
- Who Uses It:
- Failure Mode Prevented:
- Diff Required: true
- Diff Rationale:

For `MODIFIED` files:

**Proposed Diff:**

```diff
- removed line shown in red in markdown renderers that support diff highlighting
+ added line shown in green in markdown renderers that support diff highlighting
```

For `NEW` files:

**Proposed File:**

```md
# Example Title

Full or near-full expected contents go here.
```

Use `Proposed Diff: None` only when the file has no material content changes.

## 5. Operations and Timeline

| Step | Action | Validation |
| --- | --- | --- |
| 1 | ... | ... |

## 6. Validation Commands
- `...`

## 7. Risks and Rollback
- ...
````

Adaptation rule: keep the structure unless the target repository has a stronger equivalent. Modify fields only to fit real repo workflow, artifact names, validation tools, and approval model.
