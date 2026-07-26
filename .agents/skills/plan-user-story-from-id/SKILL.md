---
name: plan-user-story-from-id
description: "Planner-only skill for creating or resuming an isolated planning session from an existing user-story work-item ID."
argument-hint: "User-story work-item ID, optional adapter name, optional local Markdown path"
disable-model-invocation: true
---

# Plan User Story From ID

Use this skill only from `ServiceDesk Planner`. No other agent or general-purpose workflow may invoke it.

## Mission

Create or resume one isolated planning session from a user-story work-item ID, preserve story evidence, record scope-critical dependencies and ambiguities, then continue the normal Planner workflow.

## Inputs

- User-story work-item ID. Required.
- Optional adapter: GitHub Issue Adapter, Local Markdown Adapter, or configured external adapter.
- Optional local Markdown path when no tracker is configured.

## Shared Session Interface

- Read `templates/work-item-planning-session.md` before retrieval or analysis.
- Use session root `sessions/`.
- Normalize the source ID using the safe session ID rule from `templates/work-item-planning-session.md`.
- Prefix normalized IDs with `story-`.
- Create or resume exactly one folder: `sessions/<safe-session-id>/`.
- Read and write only the current session folder.
- Never enumerate, inspect, summarize, or compare sibling session folders.
- Never overwrite a different session.
- Record session folder path and adapter in the final handoff.

## Adapter Rules

- Prefer the GitHub Issue Adapter when this repository uses GitHub Issues and `gh` is available.
- GitHub retrieval shape: `gh issue view <id> --comments`; also fetch labels or linked evidence when useful.
- Use the Local Markdown Adapter when no tracker is configured or the user supplies a local work-item file.
- Use a configured external adapter only when the user or repository has configured one.
- Surface adapter failures in `work-item-source.md` and final handoff.
- Do not copy secrets, credentials, tokens, or unrelated personal data from tracker content.
- Preserve code blocks and convert rich tracker content to Markdown when possible.

## Required Evidence

Save gathered evidence under `sessions/<safe-session-id>/` before planning:

- `work-item-source.md`: source type, ID, safe session ID, session path, adapter, source URL or local path, retrieval timestamp, retrieval method, retrieval status.
- `work-item-evidence.md`: title, description, comments, acceptance criteria, epics, features, related work items, image references, labels, relevant discussion.
- `story-scope-analysis.md`: acceptance criteria coverage, dependencies, ambiguities, missing requirements, related work-item impact, open questions, and plan-readiness notes.
- `work-item-decisions.md`: retrieval choices, assumptions, skipped fields, and user decisions.

Mark missing fields explicitly. Do not invent absent acceptance criteria, dependency links, epic context, feature boundaries, or UI behavior.

## Story Planning Gates

### Gate 0: Source ID Intake

- Trigger: Planner invokes skill.
- Pass Condition: user-story source ID exists and can become a non-empty safe session ID.
- Fail Condition: ID is missing or normalization cannot produce allowed characters.
- Approver Or Waiver: user.
- Artifact Record: `work-item-source.md`.
- Rollback: stop and ask Planner for a valid user-story ID.

### Gate 1: Session Isolation

- Trigger: source ID passes.
- Pass Condition: exactly one `sessions/<safe-session-id>/` exists or is created.
- Fail Condition: skill reads or writes outside the current session folder.
- Approver Or Waiver: none for cross-session reads.
- Artifact Record: `work-item-source.md`.
- Rollback: discard cross-session evidence and restart with current folder only.

### Gate 2: User-Story Evidence Retrieval

- Trigger: session folder is active.
- Pass Condition: adapter records title, description, comments, acceptance criteria, epics, features, related work items, image references, and relevant discussion when present.
- Fail Condition: adapter fails silently or evidence is not saved before analysis.
- Approver Or Waiver: user for unavailable tracker.
- Artifact Record: `work-item-evidence.md`.
- Rollback: record retrieval failure and ask Planner whether to use Local Markdown Adapter.

### Gate 3: Acceptance Criteria And Dependency Analysis

- Trigger: evidence is saved.
- Pass Condition: `story-scope-analysis.md` treats acceptance criteria and related work items as plan-critical evidence and records missing requirements, dependencies, ambiguities, and open questions.
- Fail Condition: planning proceeds while acceptance criteria or related work-item ambiguity can materially change scope.
- Approver Or Waiver: user.
- Artifact Record: `story-scope-analysis.md` and `clarification-questions.md` when needed.
- Rollback: stop for Planner clarification using `templates/question-schema.md`.

### Gate 4: Planner Workflow Resume

- Trigger: story scope analysis is saved.
- Pass Condition: Planner resumes normal workflow at the first gate not satisfied by saved evidence, using `CONTEXT.md`, `docs/agents/knowledge/README.md`, `templates/question-schema.md`, and `templates/plan-schema.md`.
- Fail Condition: skill skips Planner interviews or clarification without evidence satisfying the same questions.
- Approver Or Waiver: user.
- Artifact Record: `handoff-work-item-to-planner.md`.
- Rollback: return to Planner Gate 5: Clarification.

## Plan Constraints

- Acceptance criteria and related work items are plan-critical evidence.
- Preserve ambiguities, missing requirements, dependencies, and open questions in the session artifact.
- Keep unrelated implementation work out of the plan.
- Use `CONTEXT.md` for repository vocabulary.
- Use `templates/plan-schema.md` when `implementation-plan.md` is produced.
- Use `templates/question-schema.md` when blocking clarification questions remain.

## Final Handoff

Write `handoff-work-item-to-planner.md` using `templates/artifact-gates.md` envelope plus:

- Source Type: user-story
- Source ID:
- Safe Session ID:
- Session Path:
- Adapter:
- Evidence Files:
- Decisions Files:
- Scope Summary:
- Open Questions:
- Retrieval Failures:
- Next Planner Gate:
