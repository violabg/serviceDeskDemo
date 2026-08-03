# Maintainer Modes And Scope

## Modes

One entrypoint, three modes. Ask which mode applies when the request does not make it obvious, and state the chosen mode in the maintenance plan.

| Mode | Trigger | What moves | What stays fixed |
| --- | --- | --- | --- |
| `upgrade` | A newer `bootstrap-agentic-system` is installed than the manifest's applied-through version | `THEIRS` is re-rendered from the new templates | Repository decisions in the answers file |
| `evolve` | The repository changed: new domains, new validation commands, changed tracker or session workflow, stale knowledge, a role boundary that no longer matches authority | `MINE` and the answers file | The installed Bootstrap contract version |
| `audit` | The user wants to know where the system stands without changing it | nothing | everything |

`audit` is read-only. It produces the same findings as the other modes and stops before proposing writes. Never write files in `audit` mode, including baseline and manifest updates.

`upgrade` and `evolve` can run in the same session when both triggers are present, but the plan must separate the two sets of operations so the user can approve one and defer the other.

## Scope Boundary

- Maintain agent-system files only: instructions, agents, skills, prompts, governance docs, knowledge docs, artifact templates, and session workflows.
- Never read, scan, enumerate, or modify session-folder contents. Treat the session root only as a configured path referenced by agent-system files.
- Do not modify application code, database schema, migrations, runtime config, or product tests.
- Produce a maintenance plan and wait for explicit approval before editing files.
- If no existing Agentic System is found, stop and ask whether to switch to `bootstrap-agentic-system`.

If a requested change appears to require reading a session artifact, stop and ask instead of widening scope.

## Existing-System Detection

An existing Agentic System requires at least one root instruction file plus at least one agent-system component: a custom agent, skill, prompt, governance doc, knowledge doc, artifact template, or session workflow.

Look for:

- repository instruction files, including modular `*.instructions.md` files with `applyTo` scopes,
- `docs/agents/agentic-system-manifest.md` or an equivalent provenance ledger,
- `docs/agents/agentic-system.answers.yaml` and `docs/agents/.baseline/`,
- `.github/agents/`, `.github/prompts/`, `.github/instructions/`, `.github/skills/`,
- `.claude/agents/`, `.claude/skills/`, or equivalent platform folders,
- governance docs, knowledge indexes, artifact templates, and at most a session-root README that documents session rules without exposing session contents.

The manifest, the answers file, and the baseline directory are the maintenance baseline. Record which of the three are present in the plan, because their absence degrades the merge. See `contracts/merge-model.md`.

## Bootstrap Contract Gaps

A system generated before a given Bootstrap release will be missing things that release requires. Those are contract gaps, not repository problems.

Load the current sibling `bootstrap-agentic-system/contracts/audit-and-handoff.md` and use its Phase G checklist as the definition of a complete generated system. Do not restate that checklist here or in the maintenance plan: cite the checks that fail.

When the sibling Bootstrap skill is not installed, say so in the plan, fall back to the repo-local Bootstrap changelog snapshot and the manifest, and mark every check that could not be evaluated as `unknown` rather than as passing.

Do not rewrite a working system to match wording. Propose the smallest change that closes a real gap.

## Maintenance Subagents

For non-trivial repositories, use two bounded read-only subagents when the platform supports delegation, and run them in parallel when it supports parallel delegation:

- System Drift Scout: discovery of existing agent-system files, repository workflow changes, tracker and session model changes, knowledge sources, glossary terms, validation commands, and the state of the maintenance baseline.
- Contract Auditor: comparison of the request, the current Bootstrap contract, the approved maintenance plan, and the changed files.

Give each a narrow input contract and evidence budget. Require compact findings with file paths, inferred facts, unknowns, and risks. Neither may ask the user directly or write files. If subagents are unavailable, run the same checks inline and say that delegation could not run.
