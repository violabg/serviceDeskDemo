# Design checks

Lab-authored contract, derived from the captured `get_design_checks` responses and the rules stated by the DESIGN instructions. The runtime implements it in `runtime/lib/checks.mjs`; without the runtime, apply each rule by hand to `design.json`.

The checks are facts about the artifact: anchors, elements, placeholders, an executable plan, realized decisions. They never judge whether the design realizes R — that is the design verifier's job.

`#capability:design-checks` — arguments `sessionId`, `jobId`. Response:

```json
{ "errors": [ { "rule": "<slug>", "element": "<id>", "detail": "<text>" } ],
  "warnings": [ ... ],
  "coverage": { "obligationsTotal": 0, "obligationsRealized": 0, "elementsTotal": 0, "elementsRealized": 0 } }
```

Findings that differ only in the element they name are one row, whose `element` lists them all (`O1.1, O1.2`) and whose `detail` says `<element>` in their place (Lab-authored: a partial `#capability:design-submit` answered one row per element not realized yet, about 24 KB on 60 obligations, and later turns carry that text). The same applies to the findings of `#capability:design-submit`, `#capability:design-overview` and `#capability:design-approve`.

The design can be presented for approval only when `errors` is empty. Warnings never block approval. The answer is lined JSON, and a long one is served from a stored copy (`contracts/workflow-loop.md`, Stored responses).

## Placeholders

A placeholder is `{{O#.k}}` (an element) or `{{O#}}` (an obligation without elements). Every placeholder must be followed by at least **4 words** before the next placeholder or the end of the text. This minimum is Lab-authored: the captured server states only "closer than a few words".

## Errors

| Rule | Reported when |
| --- | --- |
| `overview-gap-missing-element` | the design has obligations and `overview.gaps` does not anchor one of their elements |
| `overview-gap-unknown-placeholder` | `overview.gaps` names an element that does not exist |
| `overview-gap-placeholders-crowded` | a placeholder in `overview.gaps` is followed by fewer than 4 words |
| `operation-reference-unknown` | an operation declares an obligation or element that does not exist |
| `operation-instruction-missing-reference` | an operation declares an element its instructions never name |
| `operation-instruction-undeclared-reference` | an operation's instructions name an element it does not declare |
| `operation-instruction-placeholders-crowded` | a placeholder in an operation's instructions is followed by fewer than 4 words |
| `operation-without-elements` | a `Code` operation declares no element or obligation |
| `operation-without-failures` | an operation (other than `NotCode`) carries a `Guard`, `Effect` or `StateSemantics` element but states no `negatives` and no `exceptions` |
| `operation-source-without-ref` | an operation sets a `source` other than `Design` without a `sourceRef` |
| `operation-dependency-unknown` | `dependsOn` names an operation that does not exist |
| `operation-dependency-order` | `dependsOn` names the operation itself or one scheduled after it |
| `element-not-realized` | operations exist and no operation carries out an element |
| `obligation-not-realized` | operations exist and no operation carries out an obligation without elements |
| `decision-chosen-count` | a decision does not have exactly one chosen option |
| `decision-realized-unknown` | an operation's `realizes` names a decision that does not exist (a decision deleted after the plan cited it) |
| `decision-not-realized` | operations exist and no operation cites a decision that is not highlighted in `realizes` |
| `file-without-operation` | a filesystem row's path is listed by no operation |
| `build-operation-missing` | operations exist and none is a `Build` operation |
| `build-operation-multiple` | the plan declares more than one `Build` operation; reported on the second |
| `build-operation-order` | a `Code` or `NotCode` operation comes after the `Build` operation, or a `Commands` or `Testing` operation before it |
| `testing-operation-without-type` | a `Testing` operation declares no `testType` |
| `testing-operations` | two `Testing` operations declare the same `testType`; reported on the second |
| `operation-test-type-misplaced` | an operation of another kind declares a `testType` |

The Build and Testing rules are the design errors the served walkthrough states; their slugs are Lab-authored, because no capture shows them.

A highlighted decision (`highlight: true`, or the 3.0.0 `blocking: true`) is exempt from `decision-not-realized`. Before any operation exists, the realization and Build rules do not apply. A partial `#capability:design-submit` is applied whatever these rules report; the design cannot be approved until they pass.

## Warnings

| Rule | Reported when |
| --- | --- |
| `file-reference-without-detail` | a file of a file reference has no `details` entry with both `why` and `purpose` |

## Coverage

An element is realized when an operation lists it in `refElements`. An obligation is realized when all its elements are realized, or, without elements, when an operation lists it in `refObligations`.

## Out-of-band edits

Every design operation refuses with `design-out-of-band-edit` when `design.json` no longer matches the hash of the last runtime write. Revert the manual edit, or review it and run `#capability:design-checks` with `acceptExternalEdit: "true"` to re-seal the file.
