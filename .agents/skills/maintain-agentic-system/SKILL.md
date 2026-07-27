---
name: maintain-agentic-system
description: "Use when: reviewing and updating an existing repository-local Agentic System as the repository, workflow, knowledge, or kit principles evolve."
argument-hint: "Target repo, changed workflow or pain point, and preferred agent platform"
disable-model-invocation: true
---

# Maintain Agentic System

Use this skill to maintain an existing repo-local Agentic System against kit principles and the target repository's current workflow.

## Scope Boundary

- Maintain agent-system files only: instructions, agents, skills, prompts, governance docs, knowledge docs, artifact templates, and session workflows.
- Never read, scan, enumerate, or modify session-folder contents as part of maintenance. Treat the session root only as a configured path or rule referenced by agent-system files.
- Do not modify application code, database schema, migrations, runtime config, or product tests.
- Produce a maintenance plan and wait for explicit approval before editing files.
- If no existing Agentic System is found, stop and ask whether to switch to bootstrap behavior.
- Existing systems should have root `AGENTS.md` or an approved platform-equivalent root instruction file. If missing, treat it as a Bootstrap contract gap and propose the smallest root instruction file that routes agents to the existing system.
- Existing systems should have an agentic-system manifest, normally `docs/agents/agentic-system-manifest.md`, that records the Bootstrap skill version used, the Bootstrap contract version applied through, the installed Bootstrap skill changelog path, the repo-local Bootstrap changelog snapshot path, generated system paths, and maintenance history. If missing, treat it as a Bootstrap contract gap and propose the smallest manifest that can be inferred from the existing system.
- Existing systems should record whether visual artifact support is needed. If screenshots, mockups, diagrams, UI snapshots, image assets, or image-based QA evidence affect planning or testing and no Vision agent or visual-intake skill exists, treat that as a Bootstrap contract gap.
- Existing systems with a context glossary should normalize repository terminology. If stable concepts have competing, synonymous, or ambiguous names, treat missing preferred terms, terms to avoid, accepted aliases, or distinctions from similar terms as a Bootstrap contract gap.

## Maintenance Execution Subagents

For non-trivial repositories, use two bounded hidden subagents during maintenance when the agent platform supports subagent delegation:

- System Drift Scout: read-only discovery of existing agent-system files, repository workflow changes, tracker/session model changes, knowledge sources, glossary terms, validation commands, and likely stale contracts.
- Contract Auditor: read-only comparison of the user's maintenance request, current Bootstrap contract requirements, kit principles, the approved maintenance plan, and the changed files.

Run these subagents in parallel when the platform supports parallel delegation. Keep both subagents read-only, give each a narrow input contract and evidence budget, and require compact findings with file paths, inferred facts, unknowns, and risks. Do not let subagents ask the user directly or write files. If subagents are unavailable, perform the same scout and auditor checks inline and report that delegation could not run.

## Bootstrap Contract Alignment

When maintaining a system originally created by `bootstrap-agentic-system`, load the current sibling `bootstrap-agentic-system/SKILL.md` when available and check whether the existing system still matches its required contract. Treat these current Bootstrap requirements as maintenance upgrade candidates:

- agentic-system manifest recording Bootstrap skill version used, Bootstrap contract applied-through version, installed Bootstrap skill changelog path, repo-local Bootstrap changelog snapshot path, generated system paths, and maintenance history,
- changelog-delta audit from the repo-local Bootstrap changelog snapshot and manifest's recorded Bootstrap contract version through the current version in the installed Bootstrap skill `CHANGELOG.md`, with every intervening Bootstrap changelog entry classified as applied, not applicable, deferred, superseded, unknown, or requiring a proposed file operation,
- required Planner, Implementor, Tester, and Knowledge Builder agents,
- Knowledge Builder repository scanning, knowledge-index creation or refinement, context-glossary term suggestions, and bounded questions for missing knowledge areas,
- root `AGENTS.md` or an approved platform-equivalent root instruction file,
- explicit visual-artifact decision, including a Vision agent or visual-intake skill when screenshots, mockups, diagrams, UI snapshots, image assets, or image-based QA evidence affect the workflow,
- context-glossary intake from repository wording and explicit glossary/no-op decisions, with repo code/domain vocabulary primary and agent-system terms secondary,
- context-glossary normalization for synonymous or ambiguous wording, including preferred terms, terms to avoid, accepted aliases when needed, and distinctions from similar terms that must not be conflated,
- Planner references to the context-glossary path when one exists, the knowledge-index path, `templates/plan-schema.md`, and `templates/question-schema.md`,
- index-first knowledge loading and a prohibition on bulk-loading repository knowledge before selection,
- deliberate main Markdown agent contracts plus prompt-scoped partials when the platform uses modular agent files, including always-loaded core guidance, cross-role dependencies, and repo-specific role extensions when needed,
- final contract validation against the approved plan, user requirements, skill requirements, and changed files,
- post-maintenance recommendations to run Knowledge Builder and, when tracker workflows are relevant, to use `create-work-item-planning-skills` and `create-work-item-from-description`.

Do not rewrite a working existing system just to match wording. Propose the smallest upgrade that closes real contract gaps or stale workflow assumptions.

If no manifest or repo-local Bootstrap changelog snapshot exists, do not assume every changelog entry is missing. Infer the likely applied Bootstrap contract from existing files where possible, mark uncertain entries as `unknown`, and propose creating the manifest and initial snapshot as the first maintenance upgrade. When version provenance is unknown, the maintenance plan must say that the changelog-delta audit is best-effort until the manifest and snapshot are approved and written.

Do not treat the manifest or repo-local Bootstrap changelog snapshot as the only evidence. If the repository files already satisfy a later Bootstrap release requirement, record that changelog entry as `applied` even when the local snapshot is missing, stale, or older than the current installed Bootstrap skill changelog.

## Upstream, Schema, And Template Reconciliation

When maintaining a system created or updated by Bootstrap, explicitly reconcile all current Bootstrap source-model changes before proposing edits. This includes changes to Canonical Template Mirrors, schema templates, role-contract templates, artifact-gate templates, generated-system blueprint, Bootstrap changelog entries, and manifest requirements.

Classify each discovered delta as exactly one of:

- `applied`: the existing repository files already satisfy the delta.
- `not applicable`: the delta does not apply to this repository's approved platform, tracker, session, glossary, knowledge, visual, or skill choices.
- `deferred`: the delta applies but the user approved postponing it.
- `superseded`: a later approved repository-local decision or newer Bootstrap contract replaces the delta.
- `unknown`: the current evidence is insufficient; propose a bounded verification step or ask a targeted question.
- `requires update`: the delta applies and the repository does not satisfy it; map it to a proposed file operation.

Schema deltas must be checked against generated Planner contracts and repo-local schema files, not treated as mirror drift alone. Template deltas must be checked through the manifest's source-template records and the current generated runtime files, remembering that generated runtime files should not contain source-only `CANONICAL-TEMPLATE-SLOT` markers. Changelog deltas must be cross-checked against direct repository evidence before declaring them missing.

## Existing-System Detection

An existing Agentic System requires at least one root instruction file plus at least one agent-system component, such as a custom agent, skill, prompt, governance doc, knowledge doc, artifact template, or session workflow.

Look for evidence such as:

- repository instruction files,
- `docs/agents/agentic-system-manifest.md` or an equivalent repo-local agent-system provenance ledger,
- `.github/agents/`, `.github/prompts/`, `.github/instructions/`, `.github/skills/`,
- `.claude/agents/`, `.claude/skills/`, or equivalent platform folders,
- `docs/agents/`, governance docs, knowledge indexes, artifact templates, and at most a session-root README or root instruction reference that documents session rules without inspecting session contents.

## Gates

### Gate 0: Scope Intake

Confirm the request is about maintaining an Agentic System. If the user asks for app feature work or product bug fixes, stop or ask for confirmation.

### Gate 1: System Detection

Detect whether an Agentic System exists. If not found, ask whether to switch to `bootstrap-agentic-system`.

### Gate 2: Repository Change Scan

Inspect workflow evidence that may require system updates: new domains, changed validation commands, new docs, new CI, changed issue/session workflow, new risks, stale knowledge, changed glossary vocabulary, or Bootstrap contract changes.

When checking session workflow, inspect only durable agent-system files that define the session root, session naming rules, or current-session-only restrictions. Do not enumerate session folders or read session artifacts.

Also inspect version provenance evidence: the agentic-system manifest when present, root instruction references to that manifest, the repo-local Bootstrap changelog snapshot when present, the installed Bootstrap skill `CHANGELOG.md` when present, any optional package changelog context, the recorded Bootstrap contract version applied through, and all Bootstrap changelog entries newer than that recorded version.

### Gate 3: Principle Review

Evaluate whether the current system still follows kit principles:

- repo-specific over generic,
- approval gates before risky edits,
- bounded knowledge loading,
- explicit artifacts for plans and handoffs,
- validation tied to real repo commands,
- role boundaries that match authority changes,
- minimal durable files instead of broad narrative sprawl,
- deliberate main agent contracts plus prompt-scoped partials when the platform uses Markdown agent files, including always-loaded core guidance, cross-role dependencies, and repo-specific role extensions when needed,
- mandatory Knowledge Builder coverage,
- root instruction coverage through `AGENTS.md` or an approved platform-equivalent file,
- visual artifact coverage through a Vision agent or visual-intake skill when image evidence affects planning, implementation, review, or testing,
- context glossary kept separate from the knowledge index and focused primarily on repository code/domain vocabulary,
- context glossary normalizes synonymous or ambiguous repository wording when those terms affect future agent work,
- Planner contracts that reference required glossary, knowledge-index, plan-schema, and question-schema paths,
- final contract validation before handoff,
- version provenance through an agentic-system manifest and changelog-delta audit,
- bounded maintenance subagents or inline equivalents for discovery and audit.

### Gate 4: Maintenance Plan

Produce a concise plan that lists files to update, why each update is needed, expected risk, and validation commands. Mark approval as required.

The maintenance plan must explicitly state whether the existing system already satisfies the current Bootstrap contract. If not, list each gap, the smallest proposed file operation, and whether the gap is being fixed now, deferred, or intentionally left unchanged with the user's approval.

The maintenance plan must explicitly confirm that session-folder contents were excluded from discovery and edits. If a requested change appears to require reading a session artifact, stop and ask the user instead of widening maintenance scope.

When modular agent files are used, the maintenance plan must also confirm that no critical always-loaded guidance, cross-role dependency, or repo-specific role instruction was lost during modularization.

The maintenance plan must include a Bootstrap Changelog Delta section. Read the current installed Bootstrap skill `CHANGELOG.md` when available, use the repo-local Bootstrap changelog snapshot and the recorded `Bootstrap Contract Applied Through` version from the manifest as the baseline when available, and list every newer `bootstrap-agentic-system` changelog entry through the current installed version. Package `CHANGELOG.md` may be used as supporting context only when the installed skill-local changelog is unavailable. Classify each entry as `applied`, `not applicable`, `deferred`, `superseded`, `unknown`, or `requires update`. Every `requires update` or `unknown` entry must map to a proposed file operation, a bounded verification step, or an approved deferral.

### Gate 5: Approved Apply

After explicit approval, apply only the approved file changes. Keep edits small and preserve repo-local conventions.

When approved maintenance completes, refresh the repo-local Bootstrap changelog snapshot to the latest installed Bootstrap skill `CHANGELOG.md` when available, update the manifest's `Bootstrap Contract Applied Through` to the latest fully applied Bootstrap version, write `Maintain Skill Version Last Applied` and `Last Maintenance Date`, and append a `Maintenance History` row. If the latest installed Bootstrap skill changelog is unavailable, keep the previous snapshot, record the reason, and update the manifest with the best available inferred baseline.

### Gate 6: Validation

Validate frontmatter, links, basic instruction structure, and any available repo-local checks. Report any validation that could not run.

Before final response, run a final maintenance contract validation. Compare the approved maintenance plan, the user's stated requirements, current Bootstrap contract requirements, kit principles, and changed files. Treat missing required contract elements as blocking validation failures unless the user explicitly approved their omission.

Required final checks:

- Every approved file operation was completed, skipped with an approved reason, or reported as blocked.
- The agentic-system manifest exists or the approved plan records why creating it was deferred; when it exists, it records Bootstrap skill version used, Bootstrap contract applied through, installed Bootstrap skill changelog path, repo-local Bootstrap changelog snapshot path, generated system paths, and maintenance history.
- Every Bootstrap changelog entry newer than the manifest's previous `Bootstrap Contract Applied Through` version was classified using the repo-local Bootstrap changelog snapshot, the current installed Bootstrap skill `CHANGELOG.md`, and direct repository evidence, then either applied, verified as applied, recorded as not applicable or superseded, deferred with approval, or reported as blocked.
- After successful approved maintenance, the repo-local Bootstrap changelog snapshot was refreshed to the latest installed Bootstrap skill `CHANGELOG.md` when available, and the manifest was updated to the new current baseline or to the best available inferred baseline with a reason.
- Root `AGENTS.md` exists, or an approved platform-equivalent root instruction file exists and the approved reason for not creating `AGENTS.md` is recorded.
- Root instructions reference the agentic-system manifest path, or the approved plan records why that reference was deferred.
- Maintainer did not enumerate, read, or modify session-folder contents; any session-related conclusions came from root instructions, agent contracts, manifests, README files, skill files, or other durable agent-system files.
- The visual-artifact decision is reflected in changed files or recorded as an intentional no-op; when selected, the Vision agent or visual-intake skill exists and produces a session artifact for non-vision agents.
- The maintained system has Planner, Implementor, Tester, and Knowledge Builder coverage, or the approved plan records why a missing role was deferred.
- When the platform uses Markdown agent files, the maintained system uses deliberate main agent contracts plus prompt-scoped partials, or the approved plan records why a role remains single-file.
- When modular agent files are used, always-loaded guidance, cross-role dependency modules, and repo-specific role extensions are still reachable by the relevant roles and prompts.
- The Knowledge Builder contract requires repository scanning, knowledge-index creation or refinement, context-glossary term suggestions, and bounded questions for missing knowledge areas.
- The Planner contract references the context-glossary path when one exists, the knowledge-index path, `templates/plan-schema.md`, and `templates/question-schema.md` by explicit path.
- The Planner contract forbids bulk-loading repository knowledge before index selection.
- The context-glossary decision from the maintenance plan is reflected in changed files or recorded as an intentional no-op, and any generated or modified glossary is primarily about repository code/domain vocabulary rather than the Agentic System.
- Any maintained context glossary records preferred terms, terms to avoid, accepted aliases when needed, and distinctions from similar terms when the maintenance plan identified synonymous or ambiguous wording.
- Post-maintenance recommendations include running Knowledge Builder and, when tracker workflows are relevant, `create-work-item-planning-skills` and `create-work-item-from-description`.
- Validation commands from the maintenance plan were run where available, or each skipped command has a reason.

If the Contract Auditor subagent is available, run it after changes with the final file list and require it to report pass/fail for these checks. If not, run the checklist inline.

## Output Requirements

The maintenance plan must include:

1. detected Agentic System components,
2. repository changes that affect the system,
3. version provenance and Bootstrap changelog delta,
4. principle gaps,
5. proposed file operations,
6. approval status,
7. validation plan,
8. Bootstrap contract alignment status,
9. post-maintenance recommendations,
10. rollback notes.

## Final Response Shape

After writing files, report changed files, validation results, Bootstrap contract alignment status, post-maintenance recommendations, and remaining risks.
