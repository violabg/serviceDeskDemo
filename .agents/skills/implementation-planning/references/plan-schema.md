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

## 2. Selected Repository Knowledge
- Selected Knowledge Files: None
- Reason:

## 3. Filesystem Tree

> Paths link to their File Details entry below for quick navigation.

| Operation | Path | Reason |
| --- | --- | --- |
| NEW | [`...`](#file-slug) | ... |
| MODIFIED | [`...`](#file-slug) | ... |
| UNMODIFIED | [`...`](#file-slug) | test scope only |

Path slug rule: lowercase the path, replace every `/` and `.` with `-`.
Example: `lib/tickets/service.ts` → `#file-lib-tickets-service-ts`

## 4. File Details

<a id="file-slug"></a>

### `<path>`
- Operation:
- Purpose:
- Planned Changes:
- Business Logic:
- Coverage Scenarios:
  - ...

## 5. Proposed Diffs

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

## 6. Operations and Timeline
| Step | Action | Validation |
| --- | --- | --- |
| 1 | ... | ... |

## 7. Validation Commands
- `npm test -- ...`
- `npm run typecheck`

## 8. Risks and Rollback
- ...
````

`Proposed Diffs` are mandatory for material code, markdown, configuration, schema, prompt, skill, or agent changes. Keep snippets concise, usually 5-15 lines of context. Use full-file before/after snippets only when a file is small enough that snippet-level diffs would be ambiguous.
