# Maintainer Merge Model

Every file change Maintainer proposes goes through the same three-way merge. There is no separate path for "upgrade edits" and "repository edits": both are the same comparison with different inputs.

## The Three Inputs

- `BASE` is the pristine copy in the baseline directory recorded by the answers file, normally `docs/agents/.baseline/<repository-relative-path>`.
- `THEIRS` is the current template for that file, re-filled with the slot values recorded in `agentic-system.answers.yaml`. For an upgrade, the template comes from the currently installed `bootstrap-agentic-system/templates/`. For a repository-driven change, the template is unchanged and `THEIRS` equals `BASE`.
- `MINE` is the file as it exists in the repository right now.

Re-filling `THEIRS` is a substitution, not a redesign. Use the recorded slot values verbatim. If the new template introduces a slot the answers file does not have, that slot is a decision, not a merge: ask for it and record the answer before merging the file.

## Regions

Compare per region, not per file. A region is one Markdown section identified by its heading path, plus frontmatter as its own region. Two files agree on a region when the normalized text of that section matches after line-ending and trailing-whitespace normalization.

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
- Propose reconstructing the baseline as the first approved operation: write the current files into the baseline directory, and record in the customization register every region the user confirms was a deliberate deviation.

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

- refresh the baseline copy of every changed file, so the next run compares against what was actually agreed,
- update the answers file for any slot value that changed and for any file added or removed,
- add or update the register rows for every deliberate deviation,
- update `Bootstrap Contract Applied Through` to the latest fully applied Bootstrap version, and record `Maintain Skill Version Last Applied` and `Last Maintenance Date`,
- refresh the repo-local Bootstrap changelog snapshot when the installed changelog was available, or record why it was not,
- append a maintenance history row naming the mode, the applied deltas, and the deferred ones.

Refreshing the baseline before the user approves the changes destroys the only evidence of what was customized. Refresh it last.
