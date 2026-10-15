# Maintainer Delta Audit And Validation

## Delta Sources

An upgrade delta is anything that changed between the Bootstrap contract the repository was built from and the one currently installed. Collect deltas from all of these, in this order of authority:

1. the currently installed `bootstrap-agentic-system/CHANGELOG.md`, from the manifest's `Bootstrap Contract Applied Through` version to the current version,
2. the currently installed `bootstrap-agentic-system/templates/` and `registry/`, compared against the baseline copies,
3. the repo-local Bootstrap changelog snapshot, as the recorded baseline when the manifest is incomplete,
4. direct repository evidence, including recorded versus current selected-environment versions, official compatibility sources, native configuration, and effective tool access.

Classify the cause of each delta as canonical-contract, platform-compatibility, or repository-customization. Record affected environment IDs; unselected platforms create no work. Use the sibling Bootstrap compatibility contract for research and preservation checks.

Apply that contract's runtime environment audit to the existing files and loaded dependencies, including substitutions unchanged since generation. A matching baseline hash does not establish a valid binding. Map each demonstrated violation and any justified skill consolidation to a proposed operation; keep correct files and required discovery copies unchanged.

The package `CHANGELOG.md` is supporting context only, and only when the installed skill-local changelog is unavailable.

Never declare a delta missing from changelog text alone. A repository can satisfy a later release without any record of it. Check the files first.

## Classification

Classify every delta as exactly one of:

- `applied`: the repository files already satisfy it.
- `not applicable`: it does not apply to this repository's approved environments, tracker, session, glossary, knowledge, visual, or skill choices.
- `deferred`: it applies and the user approved postponing it.
- `superseded`: a later approved repository decision or a newer Bootstrap contract replaces it.
- `unknown`: the evidence is insufficient. Propose a bounded verification step or ask one targeted question.
- `requires update`: it applies and the repository does not satisfy it.

Every `requires update` maps to a proposed file operation. Every `unknown` maps to a verification step or a question. Nothing is left unclassified.

A delta that lands on a region with a customization register row is resolved by the register rules, not by the classification alone. See `contracts/merge-model.md`.

## Retired Components

A generated file whose source the installed Bootstrap contract no longer ships is a `requires update` delta, not a customization. The current case is the retired Vision role: a generated `<prefix>-vision` agent, its native registration, the `VISION_AGENT_NAME`, `VISION_MODEL`, and `VISION_INVOCATION` slot values, `VISUAL_ARTIFACT_FORMAT` and `VISUAL_ARTIFACT_STORAGE`, and any Planner or Direct Implementor delegation to it.

- Propose removing the retired agent, its adapters, its baseline copy, and its answers entries, and removing the delegate from Planner and Direct Implementor metadata. Delete nothing before plan approval.
- Re-resolve image handling as the `IMAGE_INSPECTION` slot for each environment, through the sibling Bootstrap decision rules. Keep existing visual artifacts in session folders untouched; they are session content.
- Treat a repository edit inside a retired file as a merge conflict to show the user, never as a reason to keep the retired role silently.

When the installed contract adds role entrypoints, the Planner handoff step, or client guides, resolve them for the recorded environments like any other `requires update` delta. Whenever a selected environment, a user-invokable role, an entrypoint, or a handoff step changes, regenerate the affected client guides in the same approved plan and keep their links in root instructions current.

A repository may already carry role-entry adapters next to native role selection, recorded as a customization. Check them against the installed dual-route rules. When they conform, propose moving the customization register row into the answers file's role-entrypoint record. When an adapter falls short, for example it restates the role's rules or does not refuse to start inside a running role, classify it `requires update` and show the gap. Do not remove the row or the adapters without approval.

A selected client whose current version differs from the recorded one is a platform-compatibility delta even when no file changed: re-check each route's tool list per surface under the sibling compatibility contract. An existing dual route without a recorded tool list per route is `unknown` and maps to that verification step. A route whose tools no longer cover an operation its role is bound to is `requires update`, with a route-specific binding or a block on that route as the proposed resolution.

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
10. rollback notes,
11. environment changes, shared-file consumers, preservation results, and compatibility status/evidence for each affected workflow.

The plan must state that session-folder contents were excluded from discovery and edits.

## Final Validation

After the approved changes are written, validate:

- Every approved operation was completed, skipped with an approved reason, or reported as blocked.
- The generated system satisfies the Phase G checklist in the sibling `bootstrap-agentic-system/contracts/audit-and-handoff.md`, or each failing check is recorded as deferred with approval or as blocked. Do not restate that checklist; cite it.
- Every delta collected in this run carries a final classification, and no `requires update` entry is left without an operation or an approved deferral.
- Every region where `MINE` and `THEIRS` both changed was resolved by an explicit user decision, not by a default.
- The baseline copy of every changed file was refreshed after approval, and no baseline copy was refreshed for a file the user did not approve.
- The shared context-boundary and compatibility checks cover migrated paths, excluded discovery roots, actual index entries, and documented integration authentication; unresolved results remain visible in the delta classification.
- The answers file matches the files that now exist: one entry per generated file, no entry for a file that was removed, and updated values for any slot that changed.
- Every deliberate deviation confirmed in this run has a customization register row with a survives-upgrade policy.
- The manifest records the new applied-through version, the maintain skill version, the maintenance date, and a maintenance history row.
- Maintainer did not enumerate, read, or modify session-folder contents.
- Validation commands from the plan were run where available, or each skipped command has a recorded reason.

An approved deferral must remain visibly deferred or unverified. It cannot certify a canonical preservation failure or an unavailable required capability as compatible.

Run the Contract Auditor subagent against the final file list when available; otherwise run these checks inline and say that delegation could not run.

## Post-Maintenance Recommendations

Always recommend running the Knowledge Builder agent after structural changes. When tracker workflows are relevant, recommend the generated `manage-work-item`, or generating it when it is absent. A target that still routes to or installs the retired standalone `create-work-item-from-description` skill records that delta as `requires update`: propose generating `manage-work-item` from the current mirror with approved `WORK_ITEM_WRITE` tools and replacing the old root-instruction route; remove the old skill only with explicit approval. When the repository needs its own repeatable procedures, recommend authoring them as repo-local skills rather than growing the agent contracts.
