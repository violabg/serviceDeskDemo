# Work-Item Planning Session Contract

This template defines the shared session interface for `plan-bug-from-id` and `plan-user-story-from-id`.

## Authority

- These skills are Planner-only procedures.
- Only `Demo Planner` may invoke them.
- Work-item creation is separate and must not create or resume a planning session.
- Planner must continue through normal planning gates after evidence is saved.

## Session Root

- Session root is configured during bootstrap and must be treated as a fixed adapter input by the planning skills.
- Current repository default session root: `sessions/`
- Session path pattern: `<session-root>/<safe-session-id>/`
- Do not scan the session root broadly. The repository may contain committed exemplar sessions, but each skill may read and write only the current session folder.
- Each skill may read and write only the current session folder.
- Never enumerate, inspect, or summarize sibling session folders.

## Safe Session ID Rule

Normalize source IDs into stable filesystem-safe session IDs:

1. Trim surrounding whitespace.
2. Remove leading `#` for GitHub issue numbers.
3. Replace every run of characters outside `A-Za-z0-9_-` with `-`.
4. Trim leading and trailing `-`.
5. Prefix with source type: `bug-<id>` or `story-<id>`.
6. If the result is empty after normalization, stop and ask for a usable source ID.

Allowed characters after normalization: letters, numbers, `_`, and `-` only.

## Adapter Selection

Use the first configured adapter that can retrieve the source:

| Adapter                | When To Use                                                              | Retrieval                                                |
| ---------------------- | ------------------------------------------------------------------------ | -------------------------------------------------------- |
| GitHub Issue Adapter   | Repository tracker is GitHub Issues and `gh` is available                | `gh issue view <id> --comments` plus labels when useful  |
| Local Markdown Adapter | No tracker is configured or the user provides a local record             | Read only the named Markdown work-item file              |
| External Adapter       | Jira, Linear, Azure DevOps, or another tracker is configured by the user | Use the configured read-only adapter and record its name |

Adapter failures must be surfaced in the session and final handoff. Do not fall through to a different source without recording the failure and selected adapter.

## Required Session Artifacts

Each skill must create or update only these files under the current session folder:

- `work-item-source.md`
- `work-item-evidence.md`
- `work-item-decisions.md`
- `implementation-plan.md` when planning reaches the plan draft gate
- `clarification-questions.md` when blocking questions remain
- `handoff-work-item-to-planner.md`

Bug planning additionally uses:

- `bug-cause-analysis.md`

User-story planning additionally uses:

- `story-scope-analysis.md`

Visual evidence references may be handed to `Demo Vision`, which writes under:

- `visual/<image-name>.md`

## Source Metadata

`work-item-source.md` must record:

- Source Type: bug | user-story
- Source ID:
- Safe Session ID:
- Session Path:
- Adapter:
- Source URL or Local Path:
- Retrieved At:
- Retrieval Command or Adapter Method:
- Retrieval Status:

Preserve source metadata without copying secrets, credentials, tokens, private URLs that expose credentials, or unrelated personal data.

## Evidence Rules

- Preserve code blocks when converting tracker content to Markdown.
- Preserve title, description, comments, acceptance criteria, labels, related work items, image references, and relevant discussion evidence when available.
- Mark missing fields explicitly.
- Keep unrelated implementation work out of evidence and plan artifacts.
- Skip Planner interviews only when saved evidence fully satisfies the same questions.

## Final Handoff

The final skill handoff must include:

- Source Type:
- Source ID:
- Safe Session ID:
- Session Path:
- Adapter:
- Evidence Files:
- Decisions Files:
- Selected Cause or Scope Summary:
- Open Questions:
- Retrieval Failures:
- Next Planner Gate:
- Resume rule: after handoff, `Demo Planner` resumes at the first normal planning gate not fully satisfied by saved evidence.

This contract ends with the final handoff requirements above.
