# GitHub Issues Adapter

Repository: `violabg/serviceDeskDemo`. Planning is GitHub-issue-only. The two ID-planning skills are invoked only by `demo-planner`; they never implement code.

- External input: `#[1-9][0-9]*`. Parse the digits as a positive integer for the API. Missing, invalid, ambiguous or unreadable IDs stop the workflow; do not search for a replacement.
- Codex uses the issue-fetch and issue-comments operations listed in the already selected `docs/agents/bindings/codex.md`; Copilot retains its existing `github/issue_read` binding. For Codex, request comments with explicit pagination; if the connected tool schema cannot return all pages, stop and report incomplete evidence.
- Retrieve issue title, body, comments, acceptance criteria, image links and explicit dependencies. Use issue type or labels only if returned by Codex issue fetch; that response coverage is unverified. Preserve fenced code, rich text meaning and attachment URLs when normalizing to Markdown. Missing acceptance criteria are a gap, not invented requirements.
- Use an explicit bug/story type or unambiguous returned labels. If type is missing or conflicting, ask before choosing a type-dependent session ID; never infer type from issue wording.
- Read every issue directly linked by the current issue once, record its repository/ID and retrieval reason, then stop traversal. Do not recurse, search/list issues, follow arbitrary URLs, or fetch unrelated items. A cross-repository issue explicitly linked by the current issue may be retrieved only as dependency evidence through the same exact tool; it never changes the owning repository/session.
- Recommend `sessions/bug-<number>/` or `sessions/us-<number>/` only after type retrieval. Existing explicit user-approved IDs remain valid. Resume only a supplied or already active session ID; never enumerate sessions or choose a folder by similarity.
- Reject traversal, absolute paths and separators in custom session IDs. A custom prefix must be lowercase `[a-z0-9_-]` with a trailing `-`; record the approved prefix and resulting ID in `session-identity.md`.
- Keep identity, tracker/dependency evidence, decisions, memory, logs, plan and handoffs within the owning session. Do not access other sessions. Store general artifacts in its `artifacts/` directory; keep session-memory.md, session-log.md and execution-report.md as distinct state files at the session root.
- Plan approval must be recorded in the plan artifact before `demo-implementor` changes code. `demo-direct-implementor` is a separate explicit user-selected route from validated requirements and never requires a plan document; it retains session and knowledge gates.
- No local Markdown tracker or free-form Planner workflow is enabled by this adapter. Ask remains available for Q&A.

## Explicit Work-Item Creation Skill

- This creation path is separate from planning and role workflows. It is enabled only by explicit invocation of `.agents/skills/create-work-item-from-description/SKILL.md` in the default Copilot or Codex agent, using the active client's skill-specific operation declared in its binding.
- Follow the skill's intake contract: clarify bug versus user story, required fields, scope, reproduction details or acceptance criteria, and target adapter; obtain explicit user approval before creating. Do not create or resume a Planner session and do not produce a plan.
- Confirm the active session exposes an issue-creation operation and can write to the selected repository. Copilot's documented operation is `issue_write(method: create)`. The configured Codex GitHub Apps binding has no write operation; Codex may proceed only if its default session independently exposes and authorizes one. If unavailable or rejected, stop and report the blocker; do not switch to another adapter or use a role's tools as a workaround.
- The issue-write operation does not upload screenshots. If the user requested an image and no separate upload tool is available, ask whether to proceed without the image. Never imply the image was attached unless the upload succeeds.
- Return exactly the work-item type, ID, adapter, source link or local path, and unresolved fields, as required by the skill.
