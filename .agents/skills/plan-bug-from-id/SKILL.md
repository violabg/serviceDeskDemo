---
name: plan-bug-from-id
description: "Use when: Demo Planner needs to start planning from an existing bug ID and persist intake evidence in one isolated session."
disable-model-invocation: true
---

# Plan Bug From ID

Planner-only procedure. Only `Demo Planner` may invoke this skill.

## Mission

Resolve a GitHub bug ID into one isolated planning session, preserve source evidence, run a narrow-to-wide probable-cause gate, and then continue the repository's normal planning workflow from the first unsatisfied Planner gate.

## Required Contracts

- Session interface: `templates/work-item-planning-session.md`
- Plan schema: `templates/plan-schema.md`
- Clarification schema: `templates/question-schema.md`
- Context glossary: `CONTEXT.md`
- Knowledge index: `docs/agents/knowledge/README.md`
- Tracker adapter: `docs/agents/issue-tracker.md`

## Required Inputs

- Bug work-item ID

## Session And Adapter Rules

- Use the GitHub Issues adapter defined in `docs/agents/issue-tracker.md`.
- Normalize the source ID with `templates/work-item-planning-session.md` and prefix it as `bug-<id>`.
- Create or resume exactly one session at the configured session root from `templates/work-item-planning-session.md`.
- Read and write only the current session folder.
- Never enumerate or summarize sibling session folders.
- Preserve source metadata without copying secrets.

# Bug Information Gathering

use #tool:agent/runSubagent to delegate work item gathering to a built-in agent subagent.
Use the following prompt template for the subagent:

```text
Retrieve GitHub Issues evidence for bug <source-id> using the adapter contract in `docs/agents/issue-tracker.md` and the session rules in `templates/work-item-planning-session.md`.

Return only:
- normalized source ID
- retrieval status and failures
- title
- body converted to Markdown with code blocks preserved
- labels
- comments converted to Markdown
- acceptance criteria evidence
- related issue or PR references
- image or attachment references
- relevant discussion evidence
- source URL
- adapter used: GitHub Issues

Do not plan fixes. Do not inspect sibling session folders. Preserve useful source text, but do not copy secrets or unrelated personal data.
```

## Workflow

1. Validate that the supplied ID is non-empty and resolves through the GitHub Issues adapter.
2. Normalize the safe session ID using `templates/work-item-planning-session.md`.
3. Create or resume the current session folder under the configured session root.
4. Save source metadata to `work-item-source.md`.
5. Save issue title, description, comments, acceptance criteria, labels, image references, and related issue references to `work-item-evidence.md`.
6. Save early decisions and retrieval failures to `work-item-decisions.md`.
7. Create `bug-cause-analysis.md` and identify the top two or three probable causes from narrow to wide:
   - most likely local root cause
   - plausible contributing factors in code, configuration, data, or external dependencies
8. Present the top causes with evidence and wait for the user to select the cause to plan for.
9. Record the selected cause and rejected alternatives in `bug-cause-analysis.md` and `work-item-decisions.md`.
10. Create `handoff-work-item-to-planner.md` with source type, source ID, safe session ID, session path, adapter, evidence files, decisions files, selected cause summary, open questions, retrieval failures, and next Planner gate.
11. Continue with Demo Planner at the first normal planning gate not fully satisfied by saved evidence.

## Required Session Artifacts

- `work-item-source.md`
- `work-item-evidence.md`
- `work-item-decisions.md`
- `bug-cause-analysis.md`
- `clarification-questions.md` when blocking questions remain
- `implementation-plan.md` when planning reaches the plan draft gate
- `handoff-work-item-to-planner.md`

## Fail Closed Conditions

- Missing or unreadable source ID
- Duplicate or conflicting session target
- Adapter retrieval failure
- No user-selected probable cause after cause analysis is presented

## Output

Return the safe session ID, session path, adapter used, evidence files written, selected cause summary, open questions, retrieval failures, and the next Demo Planner gate.
