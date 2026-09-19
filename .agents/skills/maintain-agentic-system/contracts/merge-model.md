# Maintainer Merge Model

Every file change Maintainer proposes goes through the same three-way merge. There is no separate path for "upgrade edits" and "repository edits": both are the same comparison with different inputs.

## The Three Inputs

- `BASE` is the pristine copy in the baseline directory recorded by the answers file, normally `docs/agents/.baseline/<repository-relative-path>`.
- `THEIRS` is the current template for that file, re-filled with the slot values recorded in `agentic-system.answers.yaml`. For an upgrade, the template comes from the currently installed `bootstrap-agentic-system/templates/`. For a repository-driven change without revised slot or adapter decisions, the template is unchanged and `THEIRS` equals `BASE`. For approved binding or native-format changes, reconstruct `THEIRS` from that same source and the new recorded decisions, keeping the old baseline for the comparison.
- `MINE` is the file as it exists in the repository right now.

Re-filling `THEIRS` is a substitution, not a redesign. Use the recorded slot values verbatim. When a slot value is a map keyed by generated repository-relative path, select the entry for the file being merged; a missing entry is an unresolved decision, not permission to reuse another role's tools. If the new template introduces a slot the answers file does not have, that slot is a decision, not a merge: ask for it and record the answer before merging the file.

For canonical copies, reproduce `THEIRS` with the hashed source and approved substitution recipe under the Bootstrap compatibility contract. A native adapter is a separate generated file: reconstruct its recorded configuration and loading recipe using the applicable platform evidence. Do not treat native serialization as permission to change instruction content.

Legacy non-slot overrides must stay visible as preservation conflicts. Register policies protect them against silent loss but cannot make them canonical-compliant or authorize copying them into a new pristine canonical baseline. Platform adaptation never creates new non-slot overrides.

## Regions

Compare per region, not per file. For Markdown, a region is one section identified by its heading path, plus frontmatter as its own region. For native configuration, use stable parsed key paths and compare decoded embedded instructions exactly. When a format cannot be parsed reliably, compare the entire adapter as one region; never normalize away workflow text. Canonical copies and decoded embedded instructions allow only line-ending normalization; all other bytes must match their approved fill. Other Markdown regions may additionally normalize trailing whitespace.

A heading that exists in `MINE` and not in `BASE` is an added region. A heading in `BASE` and not in `MINE` is a removed region. Both are customizations, not merge conflicts.

## Resolution Rules

| `MINE` vs `BASE` | `THEIRS` vs `BASE` | Action |
| --- | --- | --- |
| unchanged | unchanged | nothing to do |
| unchanged | changed | take `THEIRS` without asking |
| changed | unchanged | keep `MINE` without asking |
| changed | changed | conflict: ask once for this region, then record the decision |

Never silently overwrite a changed region. Never silently keep a stale region that the user did not deliberately change.

A conflict question must show the region path, what upstream changed and why from the Bootstrap changelog entry, what the repository changed, and the register row if one exists. Offer take-theirs, keep-mine, or a stated merge of both.

## When The Baseline Is Missing

A system bootstrapped before the baseline existed, or one whose baseline was deleted, has no `BASE`. Do not guess.

- Say in the maintenance plan that the merge is degraded to a two-way comparison and that every difference is therefore ambiguous.
- Treat every region where `MINE` differs from `THEIRS` as a conflict question rather than assuming a customization or a stale file.
- Propose recovering known source templates and decisions first. Keep an explicit legacy snapshot of current files as comparison evidence and record confirmed deviations; do not call that snapshot a pristine canonical baseline until preservation verification passes.

The same degradation applies when the answers file is missing: `THEIRS` cannot be re-filled reliably, so slot values must be re-derived from the existing files and confirmed with the user before any merge.

## Customization Register

The register lives in the manifest and is the memory that lets the next upgrade skip questions this one already answered. Each row records: id, target file and region, kind (`added-section`, `modified-rule`, `removed-rule`, `new-agent`, `new-skill`, `slot-override`), reason, upstream relation (`independent`, `overrides-canonical`, `extends-canonical`), survives-upgrade policy (`always`, `re-evaluate`, `drop-when-superseded`), and last verified version.

Register rows change the merge:

- A region with an `always` row is never overwritten by `THEIRS`. Report the upstream change as informational.
- A region with a `drop-when-superseded` row takes `THEIRS` without asking once the upstream change covers the reason the row records.
- A region with a `re-evaluate` row always produces a question, even when only one side changed.
- A region marked `overrides-canonical` never takes `THEIRS` silently, regardless of the other rules.

Any region the user changes during this maintenance run gets a new or updated row before the run ends. A customization with no row is a customization that the next upgrade will have to re-litigate.

## After Approved Changes

Once the approved operations are written:

- after preservation and compatibility checks, refresh baseline copies for approved compliant changes; leave unresolved legacy overrides visibly noncompliant instead of absorbing them as canonical source,
- refresh selected-environment evidence, source hashes, adapters, and the preservation plan together; retain each blocked or unverified status,
- update the answers file for any slot value that changed and for any file added or removed,
- add or update the register rows for every deliberate deviation,
- update `Bootstrap Contract Applied Through` to the latest fully applied Bootstrap version, and record `Maintain Skill Version Last Applied` and `Last Maintenance Date`,
- refresh the repo-local Bootstrap changelog snapshot when the installed changelog was available, or record why it was not,
- append a maintenance history row naming the mode, the applied deltas, and the deferred ones.

Refreshing the baseline before approval and verification destroys the only evidence of what was customized. Refresh it last.
