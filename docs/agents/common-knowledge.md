# Common Knowledge

Durable cross-session knowledge for the custom agentic coding system.

This file stores stable logical rules that should persist across sessions. It does not store session evidence, transient plans, or issue-specific decisions.

## Purpose

Use this file for facts that help all agents make consistent decisions across multiple sessions.

Do not use this file for:

- session artifacts
- pending questions for one ticket
- temporary debugging notes
- approved implementation plans

## Shared Operating Facts

- Planning, implementation, testing, and review are separate roles by default.
- Implementation needs explicit user approval plus recorded approval metadata.
- Session artifacts are per session, stored locally under gitignored `sessions/`, exported as zip packages, and attached to issue tickets rather than committed to the repository.
- Older sessions can be restored locally by downloading the issue-ticket zip, extracting it under `sessions/`, and referring to the session by ID in prompts.
- User-facing agents must ask for a session ID, then reuse `sessions/<session-id>/` when present or create it when missing.
- For GitHub-driven workflows, session ID is the GitHub issue ID resolved during intake. Manual session IDs are fallback only for offline work.
- Durable policy belongs in repository docs, not in session artifact bundles.
- Agent and skill behavior must follow the precedence chain defined in `AGENTS.md` and `docs/agents/governance.md`.
- Gate-specific skill allow-lists are mandatory for reproducible runs.
- Approved artifacts are immutable; revisions create new files rather than overwriting approved ones.
- Knowledge files are loaded on demand. Planning and implementation agents should read the knowledge index first, then load only knowledge files whose `When to read` trigger matches the current task.
- When planning depends on visuals, `Demo Vision UI` output is the canonical reusable visual contract. Prefer `SlimUI v1` plus `Planner Notes` over ad hoc image summaries.

## System Evolution Principles

- Preserve behavior intentionally when changing agent workflows.
- Record old-to-new behavior mapping before broad redesign.
- Redesign only where the mapping exposes a real quality, safety, or maintainability gain.
- Express durable behavior in local service desk language and repository-owned docs.

## Repository Knowledge Rules

- Durable repo knowledge belongs in focused markdown files under `docs/agents/knowledge/` when one file per topic is clearer than adding to this shared note.
- Repo knowledge must be based on read evidence from repository files, design docs, session artifacts, or user-confirmed decisions.
- Repo knowledge should teach concepts, ownership, conventions, and examples that future agents can apply without rediscovering the same facts.
- Topic-specific evidence that is still uncertain belongs in the session artifact package until the user approves it as durable knowledge.

## Review and Update Rules

- Add only durable, reusable knowledge.
- Prefer small, precise statements over broad summaries.
- If a rule becomes canonical policy, move or cross-reference it from `docs/agents/governance.md`.
- If a note matters only for one issue or one plan, keep it in the session artifact package instead.
