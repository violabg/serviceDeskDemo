# Design checks

Lab-authored contract, derived from the captured `get_design_checks` responses and the rules stated by the DESIGN instructions. The runtime implements it in `runtime/lib/checks.mjs`; without the runtime, apply each rule by hand to `design.json`.

The checks are facts about the artifact: anchors, elements, placeholders, an executable plan, realized decisions. They never judge whether the design realizes R — that is the design verifier's job.

`#capability:design-checks` — arguments `sessionId`, `jobId`. Response:

```json
{ "errors": [ { "rule": "<slug>", "element": "<id>", "detail": "<text>" } ],
  "warnings": [ ... ],
  "coverage": { "obligationsTotal": 0, "obligationsRealized": 0, "elementsTotal": 0, "elementsRealized": 0 } }
```

The design can be presented for approval only when `errors` is empty. Warnings never block approval.

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
| `operation-without-elements` | a `Code` or `Wiring` operation declares no element or obligation |
| `operation-without-failures` | an operation (other than `Changelog`/`Documentation`) carries a `Guard`, `Effect` or `StateSemantics` element but states no `negatives` and no `exceptions` |
| `operation-source-without-ref` | an operation sets a `source` other than `Design` without a `sourceRef` |
| `operation-dependency-unknown` | `dependsOn` names an operation that does not exist |
| `operation-dependency-order` | `dependsOn` names the operation itself or one scheduled after it |
| `element-not-realized` | operations exist and no operation carries out an element |
| `obligation-not-realized` | operations exist and no operation carries out an obligation without elements |
| `decision-chosen-count` | a decision does not have exactly one chosen option |
| `decision-realized-unknown` | `realizedIn` names an id that does not exist |
| `decision-not-realized` | operations exist and a decision that is not highlighted has no `IM#` in `realizedIn` |
| `file-without-operation` | a filesystem row's path is listed by no operation |
| `unit-test-operations` | the plan declares more than one `UnitTest` operation (the served walkthrough: "more than one `UnitTest` operation is a design error"); reported on the second |

A highlighted decision (`highlight: true`, or the 3.0.0 `blocking: true`) is exempt from `decision-not-realized`. Before any operation exists, the realization rules do not apply.

## Warnings

| Rule | Reported when |
| --- | --- |
| `file-reference-without-detail` | a file of a file reference has no `details` entry with both `why` and `purpose` |

## Coverage

An element is realized when an operation lists it in `refElements`. An obligation is realized when all its elements are realized, or, without elements, when an operation lists it in `refObligations`.

## Out-of-band edits

Every design operation refuses with `design-out-of-band-edit` when `design.json` no longer matches the hash of the last runtime write. Revert the manual edit, or review it and run `#capability:design-checks` with `acceptExternalEdit: "true"` to re-seal the file.
