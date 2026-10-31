# Design projections

Lab-authored contract, derived from the captured `get_design_snapshot`, `get_design_document`, the design verifier's definition and the 3.0.1 implementation step (`get_design_implementation_context`, captured; `design_implementation_operation`, which has no capture). The runtime implements it in `runtime/lib/projections.mjs` and `runtime/lib/render.mjs`, and rewrites every projection on every design write, so no reader ever sees a stale view.

## snapshot

`#capability:design-snapshot` — arguments `sessionId`, `jobId`. A compact markdown projection of the whole design, one item per line, ids preserved:

```text
# Design snapshot — <designId>
status: Draft | plan: ... | approved: ... | title: ... | requirement: <3.0.0 requirementRef, when one was sent>

## Overview            - current codebase: ... / - gaps: ...
## Obligations         - O1 | requirement | <behavior> | class: ... | boundaries: ... | source: ... | elements: O1.1 (guard) ...; O1.2 (effect) ...
## Open points         - OP1 | <question> | why: ...
## File references     - FR1 | scope: production | symbol: Type.Member | files: <path> (why: ... | purpose: ...)
## Knowledge references - kid 1 | fId 4 | <knowledge path> | lines 3–9 | scope: test
## Contracts           - CT1 | interface | module: ... | file: ... | promises: ... | signature: ... | premortem: ... | confidence: ... | evidence: ...
## Public APIs         - API1 | POST /path | purpose: ... | auth: ... | request: ... | responses: ...
## Filesystem          - FS1 | added | <path> | module: ... | reason: ... | change: ... | impact: ...
## Operations          - IM1 | code | weight: authoring | <operation> | status: ... | dependsOn: ... | files: ... | implements: ... | knowledge: kid 1, kid 2 | realizes: D1 | instructions: ... | branch/negative/exception arms  (a Testing operation adds "| test type: Unit" after its kind)
## Decisions           - D1 | requirements | highlight: false | topic: ... | question: ... | context: ... | why: ... | how: ... | realized by: IM1 | options: D1.1 (chosen): ... || D1.2: ...
## History             - IT1 | closed | request: ... | created: ... | closed: ... | files: added <path>; modified <path> | verifications: ... | blocks: ... | notes: ...
## Coverage            - obligations 3/3 | elements 7/7
```

On a FAST_IMPLEMENTATION job the snapshot projects its job design (obligations, open points, knowledge references). On a DOCUMENTATION job, which has no design, the snapshot says the job has no design artifact. A long snapshot is served in parts (optional argument `part`, `contracts/workflow-loop.md`, Parts) that start at a section heading or an item.

`weight` is the operation's weight class and `status` its implementation flag (contracts/design-model.md, implementation-loop). A decision stored with the 3.0.0 `blocking` flag shows it as `highlight`.

## implementation-context

`#capability:design-implementation-context` — arguments `sessionId`, `jobId`, optional `part`. The implementor's projection of the design, in the captured shape:

```text
# DESIGN SNAPSHOT — <design title, or (untitled)>
## File references for the code
- FR1 | symbol: ... | files: <path>, <path>                (or "- (none)")
  - file: <path> | why: ... | purpose: ...

## File references for the tests
- (none)

## Contracts
- CT1 | interface | module: ... | file: ... | promises: ... | signature: ...

## Public APIs
- API1 | POST /path | purpose: ... | auth: ... | request: ... | responses: ...

## Filesystem
- FS1 | modified | <path> | module: ... | reason: ... | change: ... | impact: ...

## Decisions
- D1 | codebase | highlight: true | topic: ...
```

The file references are split by scope (`Production` rows for the code, `Test` rows for the tests); every section is printed, empty or not, with a blank line before each heading. A decision is projected with its id, source, highlight and topic only: the implementor needs to know which decision a piece of code realizes, not to re-read its options. It deliberately carries no operation, no obligation and no knowledge reference: operations are served one at a time by `#capability:design-implementation-operation`, each with the text of its own knowledge references. A long context is served in parts that start at a section heading or an item.

The heading, the section order and the rows follow the 3.0.1 run-3 capture, taken against a populated design. Its contract also lists the overview, obligations and open points among the sections, but its response has none of them; the response is followed. Its note says the heading is `(untitled)` whatever the design title is, but the captured design has no title, so the note is unverified and the runtime keeps printing the title. Lab-authored: the `## Public APIs` row, which the capture shows only empty.

## verification-view

`#capability:design-verification-view` — arguments `sessionId`, `jobId`, optional `part` and `revision`. The view the design verifier judges:

```text
# Design verification view
## Knowledge grounding    - file_id <n>: <path> (MustHave, read during the design, named by the design)
                          Read every document above before judging: call knowledge-read ... (CLI: --fileIds <ids> --sessionId <id>) ...
## O1                     - claim / class / boundaries / origin / required elements: O1.1 (guard) ...
                          - mechanisms: in "<operation name>" (<kind>): {{O1.1}} <the text up to the next placeholder>
                          - knowledge grounding: ...
# Operations
## "<operation name>" (<kind>)   - plan position / test type / depends on / source / knowledge
                                 - failure arms / contracts (promises | signature | type) / files (path (status): change)
                                 - an operation that addresses no obligation also says so and shows its instructions
# Contracts in no operation      (only when there are some)
# Files in no operation          (only when there are some)
# Public APIs                    (only when there are some)
# Decisions
- <question> → <chosen answer> | realized in: "<operation name>", ... | source: ... | highlight: true|false
```

Under each obligation, an operation contributes only the text its own placeholders introduce: from `{{O#.k}}` (or `{{O#}}`) to the next placeholder. Instructions that name none of the obligation's anchors are shown whole. What an operation shares across obligations — failure arms, contracts, files — and the chosen answers of the decisions realized in those operations are printed once, joined by the operation name. The view therefore grows with the design, not with how many obligations one operation carries (Lab-authored: upstream has no capture of the shape).

The verifier's conformance comparison reads every section and every planned element, so the view presents all of them whether or not they address an obligation: every operation in plan order with its attributes, every contract, public API and file, and every decision with its source and highlight. A sequencing or representation prescription can only be judged against these.

`## Knowledge grounding` lists the knowledge the whole design grounds in, so the verifier reads it: every `MustHave` document, every document `#capability:knowledge-read` served to the design's author in the design's session, never a verifier's own read (`contracts/knowledge-catalog.md`), and every document whose file name (without `.md`, at least six characters) appears anywhere in the design. Each line says which of the three applies; with none, it says `- none`. A list that is not empty ends with the call that reads it: `Read every document above before judging: call knowledge-read with these file ids (CLI: --fileIds <ids>) and follow its parts.` (Lab-authored: verifiers that were only given the list grepped the files or skipped them.) The per-obligation `knowledge grounding` line still names what an operation or contract cites. Lab-authored: before, the verifier read only cited knowledge, and a design that applied a rule without citing it was never checked against it.

Only obligation and element labels (`O#`, `O#.k`) are kept. Operation, decision, contract and file ids are left out, so the verifier judges the content presented and never reconstructs the mapping.

A long view is served in parts (`contracts/workflow-loop.md`, Parts) that start at a section, an obligation or an operation. The stored `verification-view.md` is always whole.

## document

`#capability:design-document` — arguments `sessionId`, `jobId`. Render `design.html` and answer:

```text
Design document (<status>): <absolute path>
```

`<status>` is `Draft`, `Approved`, or `Approved, modified after approval`. Parse the path out of the line.

`design.html` is one self-contained file: `runtime/assets/design-review.html` with the design and its check results inlined as JSON, rendered client-side. Sections: Overview, Decisions (highlighted first), Implementation plan (each operation with its kind, test type, weight, status, knowledge references and the decisions it realizes), Filesystem, Contracts (public APIs and internal contracts), Obligations, File references (with their scope), Knowledge references (each kid with its scope, file id, range and the text resolved from the knowledge document at render time, or why it cannot be resolved), History, Checks. The sections form a numbered reading path and are shown one at a time; every design ID (`D3`, `D3.1`, `O1.2`, `IM4`, `FS7`, …) is addressable as `design.html#<ID>`, and any mention of a known ID links to it. It supports light and dark themes, prints every section, and opens from the file system without a server.
