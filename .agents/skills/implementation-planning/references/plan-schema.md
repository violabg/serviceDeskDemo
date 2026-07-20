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

Path slug rule: lowercase the path, replace every run of non-alphanumeric characters with `-`, then trim leading and trailing `-`.
Example: `lib/tickets/service.ts` → `#file-lib-tickets-service-ts`
Example: `app/(dashboard)/customers/[id]/page.tsx` → `#file-app-dashboard-customers-id-page-tsx`

## 4. File Details

<a id="file-slug"></a>

### `<path>`
Back to [Filesystem Tree](#3-filesystem-tree)

- Operation:
- Purpose:
- Planned Changes:
- Business Logic:
- Coverage Scenarios:
  - ...
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

```ts
export function example() {
  return "full planned file contents go here"
}
```

Use `Proposed Diff: None` only when this file has no material content changes.

For new files, include the full planned file contents in a language-specific fenced block whenever practical so the implementor can review the intended structure, not just a tiny excerpt. Do not replace meaningful sections with placeholder comments or omitted-line markers unless the user asks for a condensed artifact.

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

`Proposed Diff` is mandatory for `MODIFIED` entries with material code, markdown, configuration, schema, prompt, skill, or agent changes. `Proposed File` is mandatory for `NEW` entries. Prefer `diff` fenced blocks for modified files so removals render in red and additions in green where supported. Keep modified snippets concise, usually 5-15 lines of context. For new files, use full language-fenced contents rather than a diff.
