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
- Do not modify application code, database schema, migrations, runtime config, or product tests.
- Produce a maintenance plan and wait for explicit approval before editing files.
- If no existing Agentic System is found, stop and ask whether to switch to bootstrap behavior.

## Maintenance Execution Subagents

For non-trivial repositories, use two bounded hidden subagents during maintenance when the agent platform supports subagent delegation:

- System Drift Scout: read-only discovery of existing agent-system files, repository workflow changes, tracker/session model changes, knowledge sources, glossary terms, validation commands, and likely stale contracts.
- Contract Auditor: read-only comparison of the user's maintenance request, current Bootstrap contract requirements, kit principles, the approved maintenance plan, and the changed files.

Run these subagents in parallel when the platform supports parallel delegation. Keep both subagents read-only, give each a narrow input contract and evidence budget, and require compact findings with file paths, inferred facts, unknowns, and risks. Do not let subagents ask the user directly or write files. If subagents are unavailable, perform the same scout and auditor checks inline and report that delegation could not run.

## Bootstrap Contract Alignment

When maintaining a system originally created by `bootstrap-agentic-system`, load the current sibling `bootstrap-agentic-system/SKILL.md` when available and check whether the existing system still matches its required contract. Treat these current Bootstrap requirements as maintenance upgrade candidates:

- required Planner, Implementor, Tester, and Knowledge Builder agents,
- Knowledge Builder repository scanning, knowledge-index creation or refinement, context-glossary term suggestions, and bounded questions for missing knowledge areas,
- context-glossary intake from repository wording and explicit glossary/no-op decisions,
- Planner references to the context-glossary path when one exists, the knowledge-index path, `templates/plan-schema.md`, and `templates/question-schema.md`,
- index-first knowledge loading and a prohibition on bulk-loading repository knowledge before selection,
- final contract validation against the approved plan, user requirements, skill requirements, and changed files,
- post-maintenance recommendations to run Knowledge Builder and, when tracker workflows are relevant, to use `create-work-item-planning-skills` and `create-work-item-from-description`.

Do not rewrite a working existing system just to match wording. Propose the smallest upgrade that closes real contract gaps or stale workflow assumptions.

## Existing-System Detection

An existing Agentic System requires at least one root instruction file plus at least one agent-system component, such as a custom agent, skill, prompt, governance doc, knowledge doc, artifact template, or session workflow.

Look for evidence such as:

- repository instruction files,
- `.github/agents/`, `.github/prompts/`, `.github/instructions/`, `.github/skills/`,
- `.claude/agents/`, `.claude/skills/`, or equivalent platform folders,
- `docs/agents/`, `sessions/`, governance docs, knowledge indexes, and artifact templates.

## Gates

### Gate 0: Scope Intake

Confirm the request is about maintaining an Agentic System. If the user asks for app feature work or product bug fixes, stop or ask for confirmation.

### Gate 1: System Detection

Detect whether an Agentic System exists. If not found, ask whether to switch to `bootstrap-agentic-system`.

### Gate 2: Repository Change Scan

Inspect workflow evidence that may require system updates: new domains, changed validation commands, new docs, new CI, changed issue/session workflow, new risks, stale knowledge, changed glossary vocabulary, or Bootstrap contract changes.

### Gate 3: Principle Review

Evaluate whether the current system still follows kit principles:

- repo-specific over generic,
- approval gates before risky edits,
- bounded knowledge loading,
- explicit artifacts for plans and handoffs,
- validation tied to real repo commands,
- role boundaries that match authority changes,
- minimal durable files instead of broad narrative sprawl,
- mandatory Knowledge Builder coverage,
- context glossary kept separate from the knowledge index,
- Planner contracts that reference required glossary, knowledge-index, plan-schema, and question-schema paths,
- final contract validation before handoff,
- bounded maintenance subagents or inline equivalents for discovery and audit.

### Gate 4: Maintenance Plan

Produce a concise plan that lists files to update, why each update is needed, expected risk, and validation commands. Mark approval as required.

The maintenance plan must explicitly state whether the existing system already satisfies the current Bootstrap contract. If not, list each gap, the smallest proposed file operation, and whether the gap is being fixed now, deferred, or intentionally left unchanged with the user's approval.

### Gate 5: Approved Apply

After explicit approval, apply only the approved file changes. Keep edits small and preserve repo-local conventions.

### Gate 6: Validation

Validate frontmatter, links, basic instruction structure, and any available repo-local checks. Report any validation that could not run.

Before final response, run a final maintenance contract validation. Compare the approved maintenance plan, the user's stated requirements, current Bootstrap contract requirements, kit principles, and changed files. Treat missing required contract elements as blocking validation failures unless the user explicitly approved their omission.

Required final checks:

- Every approved file operation was completed, skipped with an approved reason, or reported as blocked.
- The maintained system has Planner, Implementor, Tester, and Knowledge Builder coverage, or the approved plan records why a missing role was deferred.
- The Knowledge Builder contract requires repository scanning, knowledge-index creation or refinement, context-glossary term suggestions, and bounded questions for missing knowledge areas.
- The Planner contract references the context-glossary path when one exists, the knowledge-index path, `templates/plan-schema.md`, and `templates/question-schema.md` by explicit path.
- The Planner contract forbids bulk-loading repository knowledge before index selection.
- The context-glossary decision from the maintenance plan is reflected in changed files or recorded as an intentional no-op.
- Post-maintenance recommendations include running Knowledge Builder and, when tracker workflows are relevant, `create-work-item-planning-skills` and `create-work-item-from-description`.
- Validation commands from the maintenance plan were run where available, or each skipped command has a reason.

If the Contract Auditor subagent is available, run it after changes with the final file list and require it to report pass/fail for these checks. If not, run the checklist inline.

## Output Requirements

The maintenance plan must include:

1. detected Agentic System components,
2. repository changes that affect the system,
3. principle gaps,
4. proposed file operations,
5. approval status,
6. validation plan,
7. Bootstrap contract alignment status,
8. post-maintenance recommendations,
9. rollback notes.

## Final Response Shape

After writing files, report changed files, validation results, Bootstrap contract alignment status, post-maintenance recommendations, and remaining risks.
