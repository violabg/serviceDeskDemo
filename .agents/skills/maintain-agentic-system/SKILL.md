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

Inspect workflow evidence that may require system updates: new domains, changed validation commands, new docs, new CI, changed issue/session workflow, new risks, or stale knowledge.

### Gate 3: Principle Review

Evaluate whether the current system still follows kit principles:

- repo-specific over generic,
- approval gates before risky edits,
- bounded knowledge loading,
- explicit artifacts for plans and handoffs,
- validation tied to real repo commands,
- role boundaries that match authority changes,
- minimal durable files instead of broad narrative sprawl.

### Gate 4: Maintenance Plan

Produce a concise plan that lists files to update, why each update is needed, expected risk, and validation commands. Mark approval as required.

### Gate 5: Approved Apply

After explicit approval, apply only the approved file changes. Keep edits small and preserve repo-local conventions.

### Gate 6: Validation

Validate frontmatter, links, basic instruction structure, and any available repo-local checks. Report any validation that could not run.

## Output Requirements

The maintenance plan must include:

1. detected Agentic System components,
2. repository changes that affect the system,
3. principle gaps,
4. proposed file operations,
5. approval status,
6. validation plan,
7. rollback notes.
