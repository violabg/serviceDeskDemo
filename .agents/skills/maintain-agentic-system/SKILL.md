---
name: maintain-agentic-system
description: "Use when: upgrading a repository-local Agentic System to a newer Bootstrap contract, evolving it as the repository changes, or auditing its current state."
argument-hint: "Target repo, mode (upgrade, evolve, or audit), and the changed workflow or pain point"
disable-model-invocation: true
---

# Maintain Agentic System

Use this skill to upgrade, evolve, or audit an existing repository-local Agentic System.

## Mission

Move a generated system forward without losing what the repository deliberately changed. Every proposal is a three-way merge against the maintenance baseline Bootstrap wrote, so an upgrade never overwrites a customization by accident and a customization never silently blocks an upgrade.

## Non-Negotiable Principles

- Maintain agent-system files only. Never touch application code, schema, migrations, runtime config, or product tests.
- Never read, enumerate, or modify session-folder contents. The session root is a configured path, not a source of evidence.
- Produce a maintenance plan and wait for explicit approval before editing files. Approval is false by default.
- Compare per region against the baseline. A region that only upstream changed is taken; a region that only the repository changed is kept; a region both changed is a question.
- Never declare a Bootstrap delta missing from changelog text alone. Check the repository files first.
- Do not restate the generated-system checklist. It lives in the sibling Bootstrap skill's audit contract; cite the checks that fail.
- Refresh the baseline, the answers file, and the customization register only after the user approves the changes, never before.
- Do not rewrite a working system to match wording. Propose the smallest change that closes a real gap.

## Contract Files

This file is a router. Load the contract for the gate you are in; do not load them all up front.

| Contract                       | Load when                                                                                 |
| ------------------------------ | ----------------------------------------------------------------------------------------- |
| `contracts/modes-and-scope.md` | Gates 0-2: mode selection, scope boundary, system detection, subagent delegation.         |
| `contracts/merge-model.md`     | Gates 3-5: three-way merge, regions, conflicts, customization register, baseline refresh. |
| `contracts/delta-audit.md`     | Gates 3-6: delta collection and classification, plan shape, final validation.             |

The generated-system contract itself is not duplicated here. Load the sibling `bootstrap-agentic-system/contracts/audit-and-handoff.md` when you need to know what a complete generated system requires.

## Maintenance Gates

Run the gates in order. Each entry names the gate's purpose and the contract that governs it.

- Gate 0, Scope Intake: confirm this is agent-system maintenance and settle the mode. See `contracts/modes-and-scope.md`.
- Gate 1, System Detection: find the existing system and record which parts of the maintenance baseline exist. See `contracts/modes-and-scope.md`.
- Gate 2, Evidence Scan: read the agent-system files, the repository changes that affect them, and the version provenance. See `contracts/modes-and-scope.md`.
- Gate 3, Delta Collection: gather and classify every Bootstrap contract delta from the installed changelog, templates, registry, snapshot, and repository evidence. See `contracts/delta-audit.md`.
- Gate 4, Region Merge: run the three-way merge per region, resolve conflicts with the user, and apply the register rules. See `contracts/merge-model.md`.
- Gate 5, Maintenance Plan And Approved Apply: produce the plan, get approval, write only the approved operations, then refresh the baseline and provenance. See `contracts/delta-audit.md` and `contracts/merge-model.md`.
- Gate 6, Final Validation: verify the operations, the merge decisions, the refreshed baseline, and the generated-system checks. See `contracts/delta-audit.md`.

In `audit` mode, stop after Gate 4 and report. Write nothing.

## Output Shape

Before writes: output the mode, the classified delta list, the per-region merge outcomes, the proposed operations, and the unapproved plan, then ask for explicit approval.

After writes: output changed files, conflict resolutions, validation results, the new applied-through version, the refreshed baseline and answers paths, register rows added, post-maintenance recommendations, and remaining risks.
