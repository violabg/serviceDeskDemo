# Design model

Lab-authored contract, derived from the captured design tools, the reference design artifact and the 3.0.1 design artifact and instructions (the implementation loop's serve and close have no tool capture). The runtime implements it in `runtime/lib/design.mjs` and `runtime/lib/design-store.mjs`. The runtime validates requests against `runtime/assets/design-requests.schema.json`; no command serves it, because upstream removed that tool. The argument descriptions of an operation are its section here, which `<token> --help` prints.

A DESIGN job produces one design; a FAST_IMPLEMENTATION job keeps its obligations, open points and knowledge references in a job design of its own, with no approval gate. A design lives in `sessions/<sessionId>/designs/<designId>/`:

| File | What it is |
| --- | --- |
| `design.json` | the structured design (this contract) |
| `design.integrity.json` | the hash of the last runtime write; a mismatch means `design.json` was edited outside the runtime |
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
  "fileReferences": [ { "id": "FR1", "symbol": "Type.Member", "files": ["path"], "scope": "Production | Test",
                        "details": [ { "path": "path", "why": "...", "purpose": "..." } ] } ],
  "knowledgeReferences": [ { "kid": 1, "fId": 4, "range": { "s": 3, "e": 9 }, "filePath": "core/changelog.md",
                             "scope": "Production | Test" } ],
  "overview": { "currentState": "...", "gaps": "... {{O1.1}} ..." },
  "decisions": [ { "id": "D1", "topic": "...", "question": "...", "source": "Requirements", "context": "...",
                   "why": "...", "how": "...", "highlight": false,
                   "options": [ { "id": "D1.1", "text": "...", "chosen": true } ] } ],
  "path": { "title": "...", "generator": "orchestrator", "requirementRef": null,
            "contracts": [ { "id": "CT1", "...": "..." } ], "apis": [ { "id": "API1" } ],
            "filesystem": { "files": [ { "id": "FS1", "path": "...", "status": "Added" } ] },
            "operations": [ { "id": "IM1", "kind": "Code | NotCode | Commands | Testing | Build",
                              "testType": "Unit | Integration | E2E | Harness (Testing only)",
                              "instructions": "{{O1.1}} ...", "dependsOn": ["IM0"],
                              "files": [], "refObligations": ["O1"], "refElements": ["O1.1"], "knowledgeReferences": [1],
                              "realizes": ["D1"],
                              "branches": [], "negatives": [], "exceptions": [],
                              "implementationStatus": "null | InProgress | Implemented | Completed" } ] },
  "servedOperation": null,
  "iterations": [ { "id": "IT1", "request": "...", "workspacePath": "...", "createdAt": "...", "closedAt": null,
                    "status": "Open | Closed", "files": [ { "path": "...", "change": "Added", "detail": null } ],
                    "verifications": [], "blocks": [], "notes": "" } ],
  "history": [ { "at": "...", "action": "...", "summary": "..." } ]
}
```

Element `kind` is exactly one of `Direction | Conjunct | Quantifier | Guard | Effect | StateSemantics | Exception`; `Definition` is not a value.

**Identity.** The runtime assigns every id from `counters`, in order, and never renumbers, reuses or reorders one. The k-th element of an obligation is `O#.k`. Persisted references are prefixed (`IM1`, `O1.2`); `#capability:design-submit` takes cardinal numbers and converts them.

**Validation.** A payload with an unknown property is refused and nothing is applied. Every design operation takes `sessionId`, `jobId` and `request`; a request field sent beside them (for example `operation` at the top level) is refused as misplaced, naming the field, and nothing is applied. Error paths are absolute: `/request/operation`, `/request/rows/0/<field>`. The misplaced-field refusal and the absolute paths are Lab-authored: the captured server leaves them unspecified.

## row-writes

`#capability:design-obligations`, `#capability:design-open-points`, `#capability:design-file-references`, `#capability:design-decisions` — arguments `sessionId`, `jobId`, `request`:

```json
{ "operation": "Add | Read | Update | Delete", "rows": [ ... ], "ids": [ "O1" ] }
```

| Operation | Effect | Response |
| --- | --- | --- |
| `Add` | rows carry no id; the runtime assigns the next id | `{"added": ["O1", "O2"]}` |
| `Read` | `ids` selects rows; empty `ids` reads all | a JSON array of the rows, each with its `id` (the 3.0.2 capture), one row per line |
| `Update` | each row names its `id`; only the fields sent change | `{"updated": ["O1"]}` |
| `Delete` | removes the rows named by `ids` | `{"deleted": ["O1"]}` |

`#capability:design-obligations` with `Read` also takes a top-level `outline: true` beside `request` (Lab-authored): the answer is one line per obligation, `O1: O1.1 Effect, O1.2 Guard`, or `O2: (no elements)`, which gives the anchors of the overview and the operations without reading every row. It holds no text, so a step that needs the obligations themselves still reads them. It is refused on any other operation and on any other table.

Table rules:

- **Obligations.** `origin` defaults to `Requirement`. On `Update`, an element with `id` is patched in place, an element without `id` is appended with the next element number, and an element with `removed: true` is deleted; a removed element number is never reused.
- **Decisions.** Options get `D#.1`, `D#.2`, ... in the order sent. Exactly one option is chosen: on `Update`, the option sent with `chosen: true` becomes the only chosen one, every option keeps its id, and a new option without id is appended. `highlight` is honoured on `Add`. A decision carries no link to its operations: an operation cites it in `realizes`, and `realizedIn` is refused as an unknown property. `blocking`, its 3.0.0 name, is still accepted (the captured `design_decisions` sends it) and reads as `highlight` everywhere: the checks, the projections and the document.
- **File references.** One row per symbol. Adding an existing symbol merges into that row; a `details` path missing from `files` is added to `files`. `scope` is `Production` (what governs the production code, the default for a row added without one) or `Test` (the test infrastructure: the test class to imitate, the base, helpers, builders, fakes); an update that sends no scope keeps the stored one.

## knowledge-references

`#capability:design-knowledge-references` — arguments `sessionId`, `jobId`, `request`:

```json
{ "operation": "Add | Read | Update | Delete",
  "references": [ { "kid": 1, "fId": 4, "range": { "s": 3, "e": 9 }, "scope": "Production | Test" } ] }
```

A knowledge reference is one prescription of a knowledge document the design applies: the document's file id `fId` in the current catalogue and the inclusive line range `s`–`e` of the lines that carry it, as the knowledge read numbers them (contracts/knowledge-catalog.md, read). The caller assigns the `kid`, a distinct positive integer. For `Add` and `Update`, `references` carries the rows; for `Read` and `Delete`, it carries the kids (empty = all).

Every write answers the captured shape:

```json
{"added":0,"updated":0,"deleted":0,"unlinkedOperations":[],"errors":[]}
```

| Operation | Effect |
| --- | --- |
| `Add` | registers each row; an empty `references` registers nothing and is still a valid call (a read with no applicable prescription) |
| `Read` | the kids select the references; empty reads all. Answers `{"references": [ ... ], "errors": []}`, each with its resolved `text` and `resolutionNote` |
| `Update` | each row names its `kid`; only the fields sent change, the stored scope included |
| `Delete` | removes the kids; empty removes all. An operation that declared a removed kid loses it and is listed in `unlinkedOperations` |

- A row that cannot be applied is reported in `errors` as `<operation>: kid <n> ...` and the other rows of the call still apply: a duplicate `kid` on `Add`, an unknown `kid` on `Update`, `Delete` or `Read`, a `fId` not in the current index (`has an unresolvable file id`), or a range outside the document (`has an unresolvable range: The requested range 282-287 is outside the knowledge file, which has 286 line(s).`, as captured).
- The runtime stores the document path beside the `fId` (`filePath`, relative to the knowledge root), so the text still resolves after a rebuild renumbers the file ids. The text is never stored: it is resolved from the document when an operation is served, when the references are read and when the document is rendered. A document that no longer exists, or a range past its end, resolves to no text and a `resolutionNote` that says why.
- `scope` defaults to `Production` on `Add`.

The request, the write response and the range error follow the 3.0.1 capture. Lab-authored: the `Read` answer, the wording of the other errors, what `unlinkedOperations` lists (the capture shows it only empty), `filePath` relative to the knowledge root and the resolution at read time.

## overview

`#capability:design-overview` — arguments `sessionId`, `jobId`, `request: { currentState, gaps }` (or `{ "operation": "Read" }`).

When the design carries obligations, the write is refused unless `gaps` anchors every element as `{{O#.k}}` (an obligation with no elements as `{{O#}}`), names no unknown element, and follows every placeholder with at least the minimum number of words before the next one (contracts/design-checks.md). The anchor is a standing invariant: re-send the overview whenever an obligation is added.

Response: `{"status": "Draft", "currentState": true, "gaps": true}`, or `{"status": "Rejected", "errors": [ { "rule", "element", "detail" } ]}`.

## design-submit

A row or a request property the schema does not know is refused with the captured `the JSON property '<name>' could not be mapped`; the Lab-authored rest of that sentence names the properties allowed there, so one retry is enough.

`#capability:design-submit` — arguments `sessionId`, `jobId`, `request`:

```json
{ "header": { "title": "...", "generator": "orchestrator" },
  "add":    { "contracts": [], "apis": [], "files": [], "operations": [] },
  "patch":  { "contracts": [], "apis": [], "files": [], "operations": [] },
  "delete": { "contracts": [1], "apis": [], "files": [], "operations": [] } }
```

An operation row:

```json
{ "id": 1, "operation": "...", "kind": "Code", "testType": "Unit", "instructions": "{{O1.1}} ...", "dependsOn": [1],
  "files": ["src/..."], "refObligations": [1], "refElements": [ { "obligation": 1, "element": 1 } ],
  "knowledgeReferences": [1], "realizes": ["D1"], "source": "Knowledge", "sourceRef": "...",
  "branches": [ { "question": "...", "yes": { "label": "...", "note": "..." }, "no": { "label": "...", "note": "..." }, "why": "..." } ],
  "negatives": [ { "cause": "...", "behavior": "...", "impact": "High" } ],
  "exceptions": [ { "trigger": "...", "recovery": "..." } ] }
```

- `kind`: `Code` writes production source (wiring included); `NotCode` acts on non-source files or writes no output; `Commands` starts long-running commands (generators, migrations); `Testing` writes and runs testing code; `Build` runs the build, the compiler-error checks, the linter and the static verifications.
- `testType` (`Unit`, `Integration`, `E2E`, `Harness`) is declared by a `Testing` operation and by no other.
- Ids are cardinal (`1, 2, 3`); the runtime prefixes them by table (`CT#`, `API#`, `FS#`, `IM#`). Cross references are cardinal: `dependsOn` → `IM#`, `refObligations` → `O#`, `refElements` `{obligation, element}` → `O#.k`. `realizes` carries the `D#` ids of the decisions the operation realizes.
- `add` appends rows whose ids are new; `patch` updates existing rows field by field; `delete` removes rows. One call may combine all three, and non-empty `header` fields are applied.
- **Partial calls.** A call may carry only a subset of the rows, and several calls may run in parallel, each with a disjoint interval of cardinal ids. A partial call is accepted: the rows apply, and the response reports what the design still lacks. The completeness gate is the approval (`#capability:design-approve`).
- An invalid row is not applied and is listed in `rejected` with its path and reason; valid rows in the same call are applied. Re-send only the rejected rows: re-sending applied rows answers `already exists`.
- An operation's `knowledgeReferences` lists the kids it needs (cardinal integers, stored as sent). A row naming a kid that no knowledge reference registers is rejected with the unknown kids; register the reference first.
- A row whose `realizes` names a decision that does not exist is rejected in the same way. A decision added after the plan is linked by `patch`ing the operation that realizes it.
- An empty request is refused.
- `header.requirementRef`, the 3.0.0 reference of the requirement lock, is still accepted and stored; 3.0.1 sends none, because the obligations are the requirement.

Lab-authored, because the instruction states the parallel calls and leaves their mechanics open: design calls take a lock shared between runtime processes (`<runtime root>/.design-lock`, broken after 120 seconds when a process died holding it), so parallel calls run one after the other and none loses rows. The rows of one call keep the order they were sent in and go before the first stored row with a higher id, so disjoint ranges build the same plan whichever call arrives first. Stored rows are never reordered.

Response: `{"status": "Draft", "applied": {"added", "patched", "deleted"}, "rejected": [], "errors": [], "warnings": [], "coverage": {}}`. `errors`, `warnings` and `coverage` are the full mechanical checks. The fields are the captured ones, written as lined JSON; a result longer than the part limit is served from a stored copy, so the write runs once and no finding is dropped (`contracts/workflow-loop.md`, Stored responses).

No design write returns the document path: the rendered document is located only with `#capability:design-document` (see contracts/projections.md).

## approval

`#capability:design-approve` — arguments `sessionId`, `jobId`, `request: { planName, description }`. Called only after the developer approves the design.

- `planName` must match `^[A-Za-z0-9_]{1,100}$`.
- Approval is refused while `#capability:design-checks` reports any error; warnings do not block it.
- On success: `status` becomes `Approved`, `approvedAt` and `planName` are recorded. Response: `Design approved (<YYYY-MM-DD HH:MM:SS>Z).`

The approval is permanent. A later write (a modification requested at the terminal hand-off, a design-gap repair during implementation) keeps `Approved`, sets `modifiedAfterApproval: true` and is recorded in `history`; the document shows `Approved, modified after approval`. Implementation progress — an operation status, a served or closed operation, an iteration — is recorded in `history` but is not a modification and never sets `modifiedAfterApproval` (Lab-authored).

## operation-status

`#capability:design-operation-status` — arguments `sessionId`, `jobId`, `request: { ids: ["IM1"], status: "InProgress | Completed" }`.

All-or-nothing: if any id is unknown, no flag changes. `Completed` is set only after a passed verification of the work unit. Response: the JSON array of updated ids.

The flag of an operation moves `null` (not started) → `InProgress` (served by `#capability:design-implementation-operation`) → `Implemented` (closed by `#capability:design-implementation-operation-close`, not verified yet) → `Completed` (verified). `Implemented` is set only by the close.

## iterations

`#capability:design-iteration-open` — arguments `sessionId`, `jobId`, `request: { workspacePath, request }`. `workspacePath` (also accepted as `WorkspacePath`) defaults to the workspace root. Refused while another iteration is open.

Snapshot the workspace: every file `git ls-files -co --exclude-standard` lists (a plain walk that skips `.git`, `node_modules`, `bin`, `obj` and `dist` outside git), with its content hash, excluding the runtime root. A symlink is recorded by the hash of its target path, as git stores it, and never followed, so re-pointing a link is a modification and a link to a directory is not read; an entry that is neither a file nor a symlink (a submodule) is left out. The walk outside git does not descend into symlinked directories. Response: `{"iterationId": "IT1", "createdAt": "..."}`.

`#capability:design-iteration-close` — arguments `sessionId`, `jobId`, `request: { iterationId, verifications: [ { kind, name, outcome } ], blocks: [], notes }`. The request carries no file list: the runtime computes it as the delta between the opening snapshot and the workspace now (`Added`, `Modified`, `Deleted`). Closing a closed iteration is refused and changes nothing. Response: `{"iterationId": "IT1", "closedAt": "..."}`.

## implementation-loop

The DESIGN Implementation step realizes the approved plan one operation at a time. A FAST_IMPLEMENTATION job design has no operation, so the loop answers `complete` there. The orchestrator never receives the operations: the implementor asks the runtime for them.

**Weight classes.** Every operation has a weight class, computed from its `kind`: `Code` and `NotCode` are `authoring`; `Commands` is `commands`; `Testing` is `testing`; `Build` is `build`. The weight is metadata only: the plan is served in the order the agent declared it, the runtime never reorders it, and `dependsOn` is the only precedence constraint: an operation is servable only when every operation it `dependsOn` is `Implemented` or `Completed`. `authoring` and `build` operations form the automatic batch; `commands` and `testing` operations need the developer's explicit authorisation. The kinds, the batch and the four classes come from the 3.0.1 run-3 instructions and review document. Lab-authored: an unknown kind, such as one stored in a design written before these kinds, is treated as `commands`.

`#capability:design-implementation-operation` — arguments `sessionId`, `jobId`, optional `operationId` (`IM#`) and `part`. Answers one of:

- **The operation to implement now**, in markdown: `# Operation IM# — <title>`, its kind (with its `testType`), weight class and authorisation, `dependsOn`, files, the elements it implements and the decisions it realizes, its instructions with the `{{O#.k}}` placeholders, its failure arms, and under `## Knowledge references` the resolved text of every kid it declares (with the document path, the range and the scope). Serving sets the flag to `InProgress` and records the operation as the served one. A long operation arrives in parts (`contracts/workflow-loop.md`, Parts) that start at a heading; reading a later part never advances the plan.
- **`batch-complete: ...`** — without `operationId`, no automatic operation is servable but operations remain open; with `operationId`, the authorised operation is already `Implemented` or `Completed`, so the delegation's work is done. A closed operation is never reopened.
- **`complete: ...`** — every operation is `Implemented` or `Completed`.

Without `operationId` the runtime serves the first servable automatic operation in plan order. With `operationId` it serves that operation on the developer's authorisation, whatever its class, and refuses it when it does not exist or depends on an operation that is not done. While an operation is served and not closed, every call answers that same operation again (and refuses a different `operationId`): one operation at a time. The answer never lists, counts or names the operations that follow.

`#capability:design-implementation-operation-close` — arguments `sessionId`, `jobId`. Closes the served operation: its flag becomes `Implemented` and the next operation becomes reachable. Refused when no operation is served, and when a part of the served operation was never served, since the operation's whole text is its specification. Response: `IM# closed as Implemented. ...`.

Lab-authored: upstream has no capture of either tool. The answer formats, the terminator texts, the served-operation record, the re-serve of an unclosed operation and the refusals are chosen here; the batch membership, the terminators `batch-complete` and `complete`, the expansion of the knowledge references and the masked future come from the 3.0.1 Implementation instruction.
