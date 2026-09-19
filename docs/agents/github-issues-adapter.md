# GitHub Issues Adapter

Repository: `violabg/serviceDeskDemo`. Planning is GitHub-issue-only. The two ID-planning skills are invoked only by `demo-planner`; they never implement code.

- External input: `#[1-9][0-9]*`. Parse the digits as a positive integer for the API. Missing, invalid, ambiguous or unreadable IDs stop the workflow; do not search for a replacement.
- Exact tools: Codex `mcp__github__issue_read`; Copilot `github/issue_read`. Allowed methods: `get`, `get_comments`, `get_labels`. Pass owner `violabg`, repo `serviceDeskDemo`, the exact issue_number, and explicit pagination for all comments.
- Retrieve the issue title, body, type/labels, comments, acceptance criteria, image links and explicit dependencies. Preserve fenced code, rich text meaning and attachment URLs when normalizing to Markdown. Missing acceptance criteria are a gap, not invented requirements.
- Use an explicit bug/story type or unambiguous labels. If type is missing or conflicting, ask before choosing a type-dependent session ID.
- Read every issue directly linked by the current issue once, record its repository/ID and retrieval reason, then stop traversal. Do not recurse, search/list issues, follow arbitrary URLs, or fetch unrelated items. A cross-repository issue explicitly linked by the current issue may be retrieved only as dependency evidence through the same exact tool; it never changes the owning repository/session.
- Recommend `sessions/bug-<number>/` or `sessions/us-<number>/` only after type retrieval. Existing explicit user-approved IDs remain valid. Resume only a supplied or already active session ID; never enumerate sessions or choose a folder by similarity.
- Reject traversal, absolute paths and separators in custom session IDs. A custom prefix must be lowercase `[a-z0-9_-]` with a trailing `-`; record the approved prefix and resulting ID in `session-identity.md`.
- Keep identity, tracker/dependency evidence, decisions, memory, logs, plan and handoffs within the owning session. Do not access other sessions. Store general artifacts in its `artifacts/` directory; keep session-memory.md, session-log.md and execution-report.md as distinct state files at the session root.
- Plan approval must be recorded in the plan artifact before `demo-implementor` changes code. `demo-direct-implementor` is a separate explicit user-selected route from validated requirements and never requires a plan document; it retains session and knowledge gates.
- No local Markdown tracker, free-form Planner workflow, issue search or tracker-write tool is enabled by this adapter. Ask remains available for Q&A.
