# Design model

Lab-authored contract, derived from the captured design tools, the design submit schema and the reference design artifact. The runtime implements it in `runtime/lib/design.mjs` and `runtime/lib/design-store.mjs`. The request schema is `runtime/assets/design-requests.schema.json` (served by `#capability:design-schema`).

A DESIGN job produces one design. It lives in `sessions/<sessionId>/designs/<designId>/`:

| File | What it is |
| --- | --- |
| `design.json` | the structured design (this contract) |
| `design.integrity.json` | the hash of the last runtime write; a mismatch means `design.json` was edited outside the runtime |
| `snapshot.md`, `verification-view.md` | the projections (contracts/projections.md), regenerated on every write |
| `design.html` | the review document, regenerated on every write |
| `iterations/IT<n>.snapshot.json` | the workspace snapshot taken when an iteration opens |

## Model

```json
{
  "schemaVersion": 2, "sessionId": "...", "designId": "...", "originJobId": "...",
  "status": "Draft | Approved", "approvedAt": null, "planName": null, "planDescription": null,
  "modifiedAfterApproval": false, "createdAt": "...", "updatedAt": "...",
  "counters": { "obligation": 0, "openPoint": 0, "contract": 0, "api": 0, "pathFile": 0,
                "operation": 0, "decision": 0, "fileReference": 0, "iteration": 0 },
  "obligations": [ { "id": "O1", "origin": "Requirement | Developer", "behavior": "...", "class": "...",
                     "boundaries": "...", "sourceRef": "...",
                     "elements": [ { "id": 1, "kind": "Guard", "text": "...", "sourceSpan": "..." } ] } ],
  "openPoints": [ { "id": "OP1", "question": "...", "whyAskingMySelf": "..." } ],
  "fileReferences": [ { "id": "FR1", "symbol": "Type.Member", "files": ["path"],
                        "details": [ { "path": "path", "why": "...", "purpose": "..." } ] } ],
  "overview": { "currentState": "...", "gaps": "... {{O1.1}} ..." },
  "decisions": [ { "id": "D1", "topic": "...", "question": "...", "source": "Requirements", "context": "...",
                   "why": "...", "how": "...", "blocking": false, "highlight": false, "realizedIn": ["IM1"],
                   "options": [ { "id": "D1.1", "text": "...", "chosen": true } ] } ],
  "path": { "title": "...", "generator": "orchestrator", "requirementRef": "requirement_R_lock",
            "operationsIntro": "...", "contracts": [ { "id": "CT1", "...": "..." } ], "apis": [ { "id": "API1" } ],
            "filesystem": { "intro": "...", "files": [ { "id": "FS1", "path": "...", "status": "Added" } ] },
            "operations": [ { "id": "IM1", "kind": "Code", "instructions": "{{O1.1}} ...", "dependsOn": ["IM0"],
                              "files": [], "refObligations": ["O1"], "refElements": ["O1.1"],
                              "branches": [], "negatives": [], "exceptions": [], "implementationStatus": null } ] },
  "iterations": [ { "id": "IT1", "request": "...", "workspacePath": "...", "createdAt": "...", "closedAt": null,
                    "status": "Open | Closed", "files": [ { "path": "...", "change": "Added", "detail": null } ],
                    "verifications": [], "blocks": [], "notes": "" } ],
  "history": [ { "at": "...", "action": "...", "summary": "..." } ]
}
```

Element `kind` is exactly one of `Direction | Conjunct | Quantifier | Guard | Effect | StateSemantics | Exception`; `Definition` is not a value.

**Identity.** The runtime assigns every id from `counters`, in order, and never renumbers, reuses or reorders one. The k-th element of an obligation is `O#.k`. Persisted references are prefixed (`IM1`, `O1.2`); `#capability:design-submit` takes cardinal numbers and converts them.

**Validation.** A payload with an unknown property is refused and nothing is applied.

## row-writes

`#capability:design-obligations`, `#capability:design-open-points`, `#capability:design-file-references`, `#capability:design-decisions` — arguments `sessionId`, `jobId`, `request`:

```json
{ "operation": "Add | Read | Update | Delete", "rows": [ ... ], "ids": [ "O1" ] }
```

| Operation | Effect | Response |
| --- | --- | --- |
| `Add` | rows carry no id; the runtime assigns the next id | `{"added": ["O1", "O2"]}` |
| `Read` | `ids` selects rows; empty `ids` reads all | `{"rows": [ ... ]}` |
| `Update` | each row names its `id`; only the fields sent change | `{"updated": ["O1"]}` |
| `Delete` | removes the rows named by `ids` | `{"deleted": ["O1"]}` |

Table rules:

- **Obligations.** `origin` defaults to `Requirement`. On `Update`, an element with `id` is patched in place, an element without `id` is appended with the next element number, and an element with `removed: true` is deleted; a removed element number is never reused.
- **Decisions.** Options get `D#.1`, `D#.2`, ... in the order sent. Exactly one option is chosen: on `Update`, the option sent with `chosen: true` becomes the only chosen one, every option keeps its id, and a new option without id is appended. `blocking` and `highlight` are honoured on `Add`.
- **File references.** One row per symbol. Adding an existing symbol merges into that row; a `details` path missing from `files` is added to `files`.

## overview

`#capability:design-overview` — arguments `sessionId`, `jobId`, `request: { currentState, gaps }` (or `{ "operation": "Read" }`).

When the design carries obligations, the write is refused unless `gaps` anchors every element as `{{O#.k}}` (an obligation with no elements as `{{O#}}`), names no unknown element, and follows every placeholder with at least the minimum number of words before the next one (contracts/design-checks.md). The anchor is a standing invariant: re-send the overview whenever an obligation is added.

Response: `{"status": "Draft", "document": "<path>", "currentState": true, "gaps": true}`, or `{"status": "Rejected", "errors": [ { "rule", "element", "detail" } ]}`.

## design-submit

`#capability:design-submit` — arguments `sessionId`, `jobId`, `request`:

```json
{ "header": { "requirementRef": "requirement_R_lock", "title": "...", "generator": "orchestrator" },
  "intros": { "filesystem": "...", "operations": "..." },
  "add":    { "contracts": [], "apis": [], "files": [], "operations": [] },
  "patch":  { "contracts": [], "apis": [], "files": [], "operations": [] },
  "delete": { "contracts": [1], "apis": [], "files": [], "operations": [] } }
```

- Ids are cardinal (`1, 2, 3`); the runtime prefixes them by table (`CT#`, `API#`, `FS#`, `IM#`). Cross references are cardinal: `dependsOn` → `IM#`, `refObligations` → `O#`, `refElements` `{obligation, element}` → `O#.k`.
- `add` appends rows whose ids are new; `patch` updates existing rows field by field; `delete` removes rows. One call may combine all three, and non-empty `header`/`intros` fields are applied.
- An invalid row is not applied and is listed in `rejected` with its path and reason; valid rows in the same call are applied. Re-send only the rejected rows: re-sending applied rows answers `already exists`.
- An empty request is refused.

Response: `{"applied": {"added", "patched", "deleted"}, "rejected": [], "errors": [], "warnings": [], "coverage": {}, "status": "Draft", "document": "<path>"}`. `errors`, `warnings` and `coverage` are the full mechanical checks.

## approval

`#capability:design-approve` — arguments `sessionId`, `jobId`, `request: { planName, description }`. Called only after the developer approves the design.

- `planName` must match `^[A-Za-z0-9_]{1,100}$`.
- Approval is refused while `#capability:design-checks` reports any error; warnings do not block it.
- On success: `status` becomes `Approved`, `approvedAt` and `planName` are recorded. Response: `Design approved (<YYYY-MM-DD HH:MM:SS>Z). Design document: <path>`.

The approval is permanent. A later write (a modification requested at the terminal hand-off, a design-gap repair during implementation) keeps `Approved`, sets `modifiedAfterApproval: true` and is recorded in `history`; the document shows `Approved, modified after approval`.

## operation-status

`#capability:design-operation-status` — arguments `sessionId`, `jobId`, `request: { ids: ["IM1"], status: "InProgress | Completed" }`.

All-or-nothing: if any id is unknown, no flag changes. `InProgress` is set when the implementation starts; `Completed` only after a passed verification. Response: the JSON array of updated ids.

## iterations

`#capability:design-iteration-open` — arguments `sessionId`, `jobId`, `request: { workspacePath, request }`. `workspacePath` (also accepted as `WorkspacePath`) defaults to the workspace root. Refused while another iteration is open.

Snapshot the workspace: every file `git ls-files -co --exclude-standard` lists (a plain walk that skips `.git`, `node_modules`, `bin`, `obj` and `dist` outside git), with its content hash, excluding the runtime root. A symlink is recorded by the hash of its target path, as git stores it, and never followed, so re-pointing a link is a modification and a link to a directory is not read; an entry that is neither a file nor a symlink (a submodule) is left out. The walk outside git does not descend into symlinked directories. Response: `{"iterationId": "IT1", "createdAt": "..."}`.

`#capability:design-iteration-close` — arguments `sessionId`, `jobId`, `request: { iterationId, verifications: [ { kind, name, outcome } ], blocks: [], notes }`. The request carries no file list: the runtime computes it as the delta between the opening snapshot and the workspace now (`Added`, `Modified`, `Deleted`). Closing a closed iteration is refused and changes nothing. Response: `{"iterationId": "IT1", "closedAt": "..."}`.
