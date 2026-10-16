# Using the Agent Roles in GitHub Copilot (VS Code)

Applies to GitHub Copilot in VS Code (stable 1.138.0 observed). Status of every start method: documented, not exercised in this repository.

## Start a role

Open the Chat view and choose the role in the **Agent** dropdown, then send your request. Start a new chat to change role.

| Role | Agent dropdown entry | Use it for |
| --- | --- | --- |
| Planner | `demo-planner` | Plan from a GitHub issue; clarification and implementation plan |
| Implementor | `demo-implementor` | Execute an approved plan |
| Direct Implementor | `demo-direct-implementor` | Implement validated requirements without a plan; never writes tests |
| Integration Tester | `demo-integration-tester` | Plan and run integration tests |
| Knowledge Builder | `demo-knowledge-builder` | Add or refresh repository knowledge |
| Ask | `demo-ask` | Read-only questions about the code |

VS Code also lists Claude Code role skills ending in `-claude` (for example `/demo-implementor-claude`). Never run those in Copilot; they stop outside Claude Code. Start roles from the Agent dropdown.

**Enforced vs instructions only.** Each agent's `tools` frontmatter limits its tool picker. Limits inside a granted tool, such as Planner writing only session artifacts, are instructions only.

## Common flows

- **Plan a user story or bug.** Choose `demo-planner`, then run `/plan-user-story-from-id 12` or `/plan-bug-from-id 12`. These skills only run under Planner. Planner asks all blocking questions together and collects the answers with the question tool.
- **Hand off to implementation.** When you approve the plan, Planner prints the next step:
  1. Open a new chat (**New Chat**).
  2. Choose `demo-implementor` in the Agent dropdown.
  3. Send `Resume implementation for Planning Session <planning-session-id>`.

  Do not use agent handoff buttons: they carry the planning conversation into the next agent.
- **Implement without a plan.** Choose `demo-direct-implementor` and describe the change.
- **Ask a question.** Choose `demo-ask`; it never edits files.
- **Build knowledge.** Choose `demo-knowledge-builder`; it writes only under `knowledge/` and its index.
- **Create or update an issue.** In the default agent, invoke `manage-work-item` by name. It writes only after you approve the exact proposal.

## Images

Planner and Direct Implementor read each local image themselves, using an image-capable chat model, and write `sessions/<id>/artifacts/<image-name>_visual_evidence.md`. For private GitHub issue images, save the image locally and give its path.

## Sessions and artifacts

Session files live in `sessions/<planning-session-id>/`: `session-memory.md`, `session-log.md`, the implementation plan, `execution-report.md` and `artifacts/`. Resume a session by giving its ID; agents never browse other sessions.

## Setup and recovery

- MCP servers come from `.vscode/mcp.json` (`github`, Neon, Next.js devtools). Check each agent's tool picker before relying on a tool.
- If a role reports that a tool is missing, reload the window and check the tool picker. Roles stop the dependent step rather than switching tools.
- The diagnostics step in Implementor and Integration Tester is blocked by an inherited template gap; they use the typecheck and lint commands instead.

## Verify once

1. Choose `demo-planner` and confirm it loads and can ask you a question.
2. Run `/plan-user-story-from-id <id>` in that chat and confirm it reaches its first gate.
3. Follow the Implementor handoff steps with a test session ID and confirm it resumes from that session.
4. Give Planner a local screenshot and confirm a `_visual_evidence.md` artifact appears.
