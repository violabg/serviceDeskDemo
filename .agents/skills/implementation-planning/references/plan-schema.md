# Implementation Plan Schema

```markdown
# Implementation Plan

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

## 4. Operations and Timeline
| Step | Action | Validation |
| --- | --- | --- |
| 1 | ... | ... |

## 5. Validation Commands
- `npm test -- ...`
- `npm run typecheck`

## 6. Risks and Rollback
- ...
```