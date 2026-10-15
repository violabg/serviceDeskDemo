# Agentic System User Guides

These guides explain how to use the serviceDeskDemo agent roles from each installed client. They are written for people. Agents do not load them as instructions; the role contracts in `docs/agents/canonical/` and the bindings in `docs/agents/bindings/` stay authoritative.

| Client | Guide | Start Planner | Hand off to Implementor |
| --- | --- | --- | --- |
| Claude Code | [claude-code.md](claude-code.md) | `claude --agent demo-planner-claude` (tool limits enforced), or `/demo-planner-fallback` in a new conversation (instructions only) | New terminal session: `claude --agent demo-implementor-claude "Resume implementation for Planning Session <id>"` (tool limits enforced), or new conversation: `/demo-implementor-fallback Resume implementation for Planning Session <id>` (instructions only) |
| GitHub Copilot in VS Code | [copilot.md](copilot.md) | New chat, choose `demo-planner` in the Agent dropdown | New chat, choose `demo-implementor`, send `Resume implementation for Planning Session <id>` |

## Rules that apply in every client

- Each role runs as the main conversation of its own session. Start a new session or chat to change role; do not ask one role to delegate to another.
- After you approve a plan, start Implementor in a new conversation with the Planning Session ID. Do not continue implementation in the planning conversation.
- Planning sessions live in `sessions/<planning-session-id>/` (local and gitignored). Planning from GitHub issue `#12` suggests the session ID `us-12` or `bug-12`.
- Images are inspected by Planner and Direct Implementor themselves; each image gets a Markdown artifact `sessions/<id>/artifacts/<image-name>_visual_evidence.md`. Give a local file path for private issue images.
- `manage-work-item` creates or updates a GitHub issue only when you invoke it by name in the default agent, and only after you approve the exact proposal.

## Status labels

Every start method here is **documented** in the client's official documentation but **not yet exercised** in this repository. Treat these entries as unverified until you have checked each one once, as described at the end of each guide.
