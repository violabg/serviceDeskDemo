# Design projections

Lab-authored contract, derived from the captured `get_design_snapshot`, `get_design_document` and the design verifier's definition. The runtime implements it in `runtime/lib/projections.mjs` and `runtime/lib/render.mjs`, and rewrites every projection on every design write, so no reader ever sees a stale view.

## snapshot

`#capability:design-snapshot` — arguments `sessionId`, `jobId`. A compact markdown projection of the whole design, one item per line, ids preserved:

```text
# Design snapshot — <designId>
status: Draft | plan: ... | approved: ... | title: ... | requirement: requirement_R_lock

## Overview            - current codebase: ... / - gaps: ...
## Obligations         - O1 | requirement | <behavior> | class: ... | boundaries: ... | source: ... | elements: O1.1 (guard) ...; O1.2 (effect) ...
## Open points         - OP1 | <question> | why: ...
## File references     - FR1 | symbol: Type.Member | files: <path> (why: ... | purpose: ...)
## Contracts           - CT1 | interface | module: ... | file: ... | promises: ... | signature: ... | premortem: ... | confidence: ... | evidence: ...
## Public APIs         - API1 | POST /path | purpose: ... | auth: ... | request: ... | responses: ...
## Filesystem          - FS1 | added | <path> | module: ... | reason: ... | change: ... | impact: ...
## Operations          - IM1 | code | <operation> | status: ... | dependsOn: ... | files: ... | implements: ... | instructions: ... | branch/negative/exception arms
## Decisions           - D1 | requirements | blocking: false | highlight: false | topic: ... | question: ... | context: ... | why: ... | how: ... | realizedIn: ... | options: D1.1 (chosen): ... || D1.2: ...
## History             - IT1 | closed | request: ... | created: ... | closed: ... | files: added <path>; modified <path> | verifications: ... | blocks: ... | notes: ...
## Coverage            - obligations 3/3 | elements 7/7
```

On a job without a design (FAST_IMPLEMENTATION, DOCUMENTATION) the snapshot says the job has no design artifact. A long snapshot is served in parts (optional argument `part`, `contracts/workflow-loop.md`, Parts) that start at a section heading or an item, so a row is never split.

## verification-view

`#capability:design-verification-view` — arguments `sessionId`, `jobId`, optional `part`. The view the design verifier judges, in four sections:

```text
# Design verification view
## Knowledge grounding    - file_id <n>: <path> (MustHave, read during the design, named by the design)
                          Read every document above before judging: call knowledge-read ... (CLI: --fileIds <ids>) ...
## O1                     - claim / class / boundaries / origin / required elements: O1.1 (guard) ...
                          - mechanisms: in "<operation name>" (<kind>): {{O1.1}} <the text up to the next placeholder>
                          - knowledge grounding: ...
# Operations
## "<operation name>" (<kind>)   - failure arms / contracts (promises | signature) / files (path (status): change)
# Decisions
- <question> → <chosen answer> | realized in: "<operation name>", ...
```

Under each obligation, an operation contributes only the text its own placeholders introduce: from `{{O#.k}}` (or `{{O#}}`) to the next placeholder. Instructions that name none of the obligation's anchors are shown whole. What an operation shares across obligations — failure arms, contracts, files — and the chosen answers of the decisions realized in those operations are printed once, joined by the operation name. The view therefore grows with the design, not with how many obligations one operation carries (Lab-authored: upstream has no capture of the shape).

`## Knowledge grounding` lists the knowledge the whole design grounds in, so the verifier reads it: every `MustHave` document, every document `#capability:knowledge-read` served in the design's session (`contracts/knowledge-catalog.md`), and every document whose file name (without `.md`, at least six characters) appears anywhere in the design. Each line says which of the three applies; with none, it says `- none`. A list that is not empty ends with the call that reads it: `Read every document above before judging: call knowledge-read with these file ids (CLI: --fileIds <ids>) and follow its parts.` (Lab-authored: verifiers that were only given the list grepped the files or skipped them.) The per-obligation `knowledge grounding` line still names what an operation or contract cites. Lab-authored: before, the verifier read only cited knowledge, and a design that applied a rule without citing it was never checked against it.

Only obligation and element labels (`O#`, `O#.k`) are kept. Operation, decision, contract and file ids are left out, so the verifier judges the content presented and never reconstructs the mapping.

A long view is served in parts (`contracts/workflow-loop.md`, Parts) that start at a section, an obligation or an operation, so none of them is ever split. The stored `verification-view.md` is always whole.

## document

`#capability:design-document` — arguments `sessionId`, `jobId`. Render `design.html` and answer:

```text
Design document (<status>): <absolute path>
```

`<status>` is `Draft`, `Approved`, or `Approved, modified after approval`. Parse the path out of the line.

`design.html` is one self-contained file: `runtime/assets/design-review.html` with the design and its check results inlined as JSON, rendered client-side. Sections: Overview, Decisions (blocking first), Implementation plan, Filesystem, Contracts (public APIs and internal contracts), Obligations, File references, History, Checks. The sections form a numbered reading path and are shown one at a time; every design ID (`D3`, `D3.1`, `O1.2`, `IM4`, `FS7`, …) is addressable as `design.html#<ID>`, and any mention of a known ID links to it. It supports light and dark themes, prints every section, and opens from the file system without a server.
