# Implementation Plan Schema

````markdown
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

## 2. Filesystem Tree
| Operation | Path | Reason |
| --- | --- | --- |
| NEW | ... | ... |
| MODIFIED | ... | ... |
| UNMODIFIED | ... | test scope only |

## 3. File Details

### `<path>`
- Operation:
- Purpose:
- Planned Changes:
- Business Logic:
- Coverage Scenarios:
  - ...

## 4. Proposed Diffs

Use `Proposed Diffs: None` only when the plan has no material file content changes.

### `<path>`
- Diff Required: true
- Rationale:

**Before:**

```text
Existing snippet with enough context to locate the change.
```

**After:**

```text
Proposed snippet for the same scope.
```

## 5. Operations and Timeline
| Step | Action | Validation |
| --- | --- | --- |
| 1 | ... | ... |

## 6. Validation Commands
- `npm test -- ...`
- `npm run typecheck`

## 7. Risks and Rollback
- ...
````

`Proposed Diffs` are mandatory for material code, markdown, configuration, schema, prompt, skill, or agent changes. Keep snippets concise, usually 5-15 lines of context. Use full-file before/after snippets only when a file is small enough that snippet-level diffs would be ambiguous.
