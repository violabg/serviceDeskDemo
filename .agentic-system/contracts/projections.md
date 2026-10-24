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

On a job without a design (FAST_IMPLEMENTATION, DOCUMENTATION) the snapshot says the job has no design artifact.

## verification-view

`#capability:design-verification-view` — arguments `sessionId`, `jobId`. The view the design verifier judges: for every obligation, its claim, class, boundaries, origin and required elements, then the design content that addresses it — the operations that carry it out (instructions and failure arms), the chosen answers of the decisions realized in those operations, the contracts and files those operations touch, and the knowledge the design grounds them in.

Only obligation and element labels (`O#`, `O#.k`) are kept. Operation, decision, contract and file ids are left out, so the verifier judges the content presented and never reconstructs the mapping.

## document

`#capability:design-document` — arguments `sessionId`, `jobId`. Render `design.html` and answer:

```text
Design document (<status>): <absolute path>
```

`<status>` is `Draft`, `Approved`, or `Approved, modified after approval`. Parse the path out of the line.

`design.html` is one self-contained file: `runtime/assets/design-review.html` with the design and its check results inlined as JSON, rendered client-side. Sections: Overview, Decisions (blocking first), Implementation plan, Filesystem, Contracts (public APIs and internal contracts), Obligations, File references, History, Checks. The sections form a numbered reading path and are shown one at a time; every design ID (`D3`, `D3.1`, `O1.2`, `IM4`, `FS7`, …) is addressable as `design.html#<ID>`, and any mention of a known ID links to it. It supports light and dark themes, prints every section, and opens from the file system without a server.
