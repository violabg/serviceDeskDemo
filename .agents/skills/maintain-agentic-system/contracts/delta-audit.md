# Maintainer Delta Audit And Validation

## Delta Sources

An upgrade delta is anything that changed between the Bootstrap contract the repository was built from and the one currently installed. Collect deltas from all of these, in this order of authority:

1. the currently installed `bootstrap-agentic-system/CHANGELOG.md`, from the manifest's `Bootstrap Contract Applied Through` version to the current version,
2. the currently installed `bootstrap-agentic-system/templates/` and `registry/`, compared against the baseline copies,
3. the repo-local Bootstrap changelog snapshot, as the recorded baseline when the manifest is incomplete,
4. direct repository evidence.

The package `CHANGELOG.md` is supporting context only, and only when the installed skill-local changelog is unavailable.

Never declare a delta missing from changelog text alone. A repository can satisfy a later release without any record of it. Check the files first.

## Classification

Classify every delta as exactly one of:

- `applied`: the repository files already satisfy it.
- `not applicable`: it does not apply to this repository's approved platform, tracker, session, glossary, knowledge, visual, or skill choices.
- `deferred`: it applies and the user approved postponing it.
- `superseded`: a later approved repository decision or a newer Bootstrap contract replaces it.
- `unknown`: the evidence is insufficient. Propose a bounded verification step or ask one targeted question.
- `requires update`: it applies and the repository does not satisfy it.

Every `requires update` maps to a proposed file operation. Every `unknown` maps to a verification step or a question. Nothing is left unclassified.

A delta that lands on a region with a customization register row is resolved by the register rules, not by the classification alone. See `contracts/merge-model.md`.

## Missing Provenance

When no manifest or snapshot exists, do not assume every entry is missing. Infer the likely applied contract from the existing files, mark the uncertain entries `unknown`, and propose creating the manifest, answers file, and baseline as the first operation. The plan must say the delta audit is best-effort until that provenance is written.

## Maintenance Plan

The plan must contain:

1. mode and why,
2. detected components and which parts of the maintenance baseline exist,
3. repository changes that affect the system,
4. version provenance and the classified Bootstrap delta list,
5. per-region merge outcomes, including every conflict and how it was resolved,
6. proposed file operations with reason and risk,
7. customization register rows to add or update,
8. approval status, false by default,
9. validation commands,
10. rollback notes.

The plan must state that session-folder contents were excluded from discovery and edits.

## Final Validation

After the approved changes are written, validate:

- Every approved operation was completed, skipped with an approved reason, or reported as blocked.
- The generated system satisfies the Phase G checklist in the sibling `bootstrap-agentic-system/contracts/audit-and-handoff.md`, or each failing check is recorded as deferred with approval or as blocked. Do not restate that checklist; cite it.
- Every delta collected in this run carries a final classification, and no `requires update` entry is left without an operation or an approved deferral.
- Every region where `MINE` and `THEIRS` both changed was resolved by an explicit user decision, not by a default.
- The baseline copy of every changed file was refreshed after approval, and no baseline copy was refreshed for a file the user did not approve.
- The answers file matches the files that now exist: one entry per generated file, no entry for a file that was removed, and updated values for any slot that changed.
- Every deliberate deviation confirmed in this run has a customization register row with a survives-upgrade policy.
- The manifest records the new applied-through version, the maintain skill version, the maintenance date, and a maintenance history row.
- Maintainer did not enumerate, read, or modify session-folder contents.
- Validation commands from the plan were run where available, or each skipped command has a recorded reason.

Treat a failing check as blocking unless the user explicitly approved the omission.

Run the Contract Auditor subagent against the final file list when available; otherwise run these checks inline and say that delegation could not run.

## Post-Maintenance Recommendations

Always recommend running the Knowledge Builder agent after structural changes. When tracker workflows are relevant, recommend `create-work-item-from-description`. When the repository needs its own repeatable procedures, recommend authoring them as repo-local skills rather than growing the agent contracts.
