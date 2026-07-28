# Issue Tracker: GitHub

Issues and PRDs for this repository live as GitHub issues. Use GitHub MCP tools for issue reads and writes.

## Canonical contract

- Canonical lookup key: the GitHub issue number.
- Canonical session rule for tracker-backed work: sessions/<issue-number>/.
- Required fields for planning intake: title, description, comments, labels, acceptance criteria when present, and related work items when present.
- If the user does not provide an issue ID, ask for it before continuing.

## Issue access rules

- Read or write the requested issue by numeric ID only.
- Do not perform broad issue discovery as part of a normal planning or implementation intake.
- Read additional issues only when the current issue explicitly references them or the user explicitly requests them.

## GitHub MCP workflow

- Read an issue by number through GitHub MCP.
- Create, update, comment on, label, and close issues through GitHub MCP.
- Keep the issue number as the canonical identifier for planning sessions and artifact naming.

## Planning intake conventions

When a skill or agent gathers issue context for planning:

1. Resolve the issue by numeric ID.
2. Capture the required fields listed above.
3. Attach the gathered information to a session artifact under sessions/<issue-number>/.
4. Keep the scope narrow: do not load unrelated issues unless they are explicitly referenced by the current issue.

## Notes

- This repository does not use the older gh CLI workflow as the primary contract for agent-system planning.
- If the issue body or comments reference another issue, treat that as an explicit follow-up dependency rather than a default discovery step.