---
name: plan-user-story-from-id
description: "Use when: Demo Planner needs to start planning from an existing user-story ID and persist intake evidence in one isolated session."
disable-model-invocation: true
---

# Plan User Story From ID

Planner-only procedure. Only `Demo Planner` may invoke this skill.

## Mission

Resolve a GitHub user-story ID into one isolated planning session, preserve plan-critical story evidence, and then continue the repository's normal planning workflow from the first unsatisfied Planner gate.

## Required Contracts

- Session interface: `templates/work-item-planning-session.md`
- Plan schema: `templates/plan-schema.md`
- Clarification schema: `templates/question-schema.md`
- Context glossary: `CONTEXT.md`
- Knowledge index: `docs/agents/knowledge/README.md`
- Tracker adapter: `docs/agents/issue-tracker.md`

## Required Inputs

- User-story work-item ID

## Session And Adapter Rules

- Use the GitHub Issues adapter defined in `docs/agents/issue-tracker.md`.
- Normalize the source ID with `templates/work-item-planning-session.md` and prefix it as `story-<id>`.
- Create or resume exactly one session at the configured session root from `templates/work-item-planning-session.md`.
- Read and write only the current session folder.
- Never enumerate or summarize sibling session folders.
- Preserve source metadata without copying secrets.

use #tool:agent/runSubagent to delegate work item gathering to a default subagent (leave argument args.agentName empty).
Use the following prompt template for the subagent:

```text
Retrieve GitHub Issues evidence for user story <source-id> using the adapter contract in `docs/agents/issue-tracker.md` and the session rules in `templates/work-item-planning-session.md`.

Return only:
- normalized source ID
- retrieval status and failures
- title
- body converted to Markdown with code blocks preserved
- labels
- comments converted to Markdown
- acceptance criteria evidence
- epic or feature references
- related work item or PR references
- image or attachment references
- relevant discussion evidence
- source URL
- adapter used: GitHub Issues

Do not plan implementation. Do not inspect sibling session folders. Preserve useful source text, but do not copy secrets or unrelated personal data.
```

## Workflow

1. Validate that the supplied ID is non-empty and resolves through the GitHub Issues adapter.
2. Normalize the safe session ID using `templates/work-item-planning-session.md`.
3. Create or resume the current session folder under the configured session root.
4. Save source metadata to `work-item-source.md`.
5. Save issue title, description, comments, acceptance criteria, labels, related issue references, epic or feature references, and image references to `work-item-evidence.md`.
6. Save early decisions and retrieval failures to `work-item-decisions.md`.
7. Create `story-scope-analysis.md` and record:
   - scope summary
   - acceptance criteria inventory
   - dependencies and related work items
   - ambiguities and missing requirements
   - reasons to continue or block for clarification
8. Create `handoff-work-item-to-planner.md` with source type, source ID, safe session ID, session path, adapter, evidence files, decisions files, scope summary, open questions, retrieval failures, and next Planner gate.
9. Continue with Demo Planner at the first normal planning gate not fully satisfied by saved evidence.

## Required Session Artifacts

- `work-item-source.md`
- `work-item-evidence.md`
- `work-item-decisions.md`
- `story-scope-analysis.md`
- `clarification-questions.md` when blocking questions remain
- `implementation-plan.md` when planning reaches the plan draft gate
- `handoff-work-item-to-planner.md`

## Fail Closed Conditions

- Missing or unreadable source ID
- Duplicate or conflicting session target
- Adapter retrieval failure
- Missing acceptance-criteria evidence with no path to bounded clarification

## Output

Return the safe session ID, session path, adapter used, evidence files written, scope summary, open questions, retrieval failures, and the next Demo Planner gate.
