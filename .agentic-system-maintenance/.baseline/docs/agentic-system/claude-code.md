# Using the Agent Roles in Claude Code

Applies to Claude Code 2.1.296 (CLI and VS Code extension). Status of every start method: documented, not exercised in this repository.

## Start a role

Each role has two start routes. Use either one in any client:

- **Terminal:** run the command from the repository root. Each role's tool list is enforced.
- **Fallback skill:** open a new conversation (for example a new tab in the VS Code extension chat) and type the skill. It loads the same role contract, but its tool limits are instructions only.

| Role | Terminal command | Fallback skill | Use it for |
| --- | --- | --- | --- |
| Planner | `claude --agent demo-planner-claude` | `/demo-planner-fallback` | Plan from a GitHub issue; clarification and implementation plan |
| Implementor | `claude --agent demo-implementor-claude` | `/demo-implementor-fallback` | Execute an approved plan |
| Direct Implementor | `claude --agent demo-direct-implementor-claude` | `/demo-direct-implementor-fallback` | Implement validated requirements without a plan; never writes tests |
| Integration Tester | `claude --agent demo-integration-tester-claude` | `/demo-integration-tester-fallback` | Plan and run integration tests |
| Knowledge Builder | `claude --agent demo-knowledge-builder-claude` | `/demo-knowledge-builder-fallback` | Add or refresh repository knowledge |
| Ask | `claude --agent demo-ask-claude` | `/demo-ask-fallback` | Read-only questions about the code |

You can add the first message in quotes after the command, or after the skill name. Use one role per conversation: there is no documented way to switch role inside a session, so start a new one. Do not set `agent` in `.claude/settings.json`; that would run every session under one role.

**Enforced vs instructions only.** With the terminal command, each role's `tools` list is enforced by Claude Code: Ask cannot edit or run commands, and Planner and Knowledge Builder cannot run shell commands. With a fallback skill, the same limits are written as instructions in the skill and the role contract, but Claude Code does not block the tools. Limits inside a granted tool, such as Planner writing only session artifacts, are instructions only in both routes. Claude cannot start these roles on its own: the subagents are denied in `.claude/settings.json` and the fallback skills set `disable-model-invocation: true`.

## Common flows

- **Plan a user story or bug.** Start Planner by either route, then run `/plan-user-story-from-id 12` or `/plan-bug-from-id 12`. These skills only run under Planner; in any other conversation they stop and tell you to start Planner. Planner asks all blocking questions together and collects the answers with the question tool, at most four per prompt.
- **Hand off to implementation.** When you approve the plan, Planner prints the next step. Start Implementor with fresh context, either in a new terminal session:

  ```bash
  claude --agent demo-implementor-claude "Resume implementation for Planning Session <planning-session-id>"
  ```

  or in a new conversation:

  ```text
  /demo-implementor-fallback Resume implementation for Planning Session <planning-session-id>
  ```

- **Implement without a plan.** Start Direct Implementor and describe the change.
- **Ask a question.** Start Ask; it never edits files.
- **Build knowledge.** Start Knowledge Builder; it writes only under `knowledge/` and its index.
- **Create or update an issue.** In a normal `claude` session, run `/manage-work-item`. It writes only after you approve the exact proposal.

## Images

Planner and Direct Implementor pass each local image to a general-purpose subagent on the `haiku` model, which you approved for image inspection. If that is not possible, they read the image themselves. Each image becomes `sessions/<id>/artifacts/<image-name>_visual_evidence.md`. For private GitHub issue images, save the image locally and give its path.

## Sessions and artifacts

Session files live in `sessions/<planning-session-id>/`: `session-memory.md`, `session-log.md`, the implementation plan, `execution-report.md` and `artifacts/`. Resume a session by giving its ID; agents never browse other sessions.

## Setup and recovery

- GitHub issue access uses the `github` server in `.mcp.json`, authenticated from the `GITHUB_TOKEN` environment variable. Neon uses its own login. Approve the project MCP servers when Claude Code asks.
- If a role reports that a tool is missing, check `/mcp` and restart the session. Roles stop the dependent step rather than switching tools.
- The diagnostics step in Implementor and Integration Tester is blocked by an inherited template gap; they use the typecheck and lint commands instead.

## Verify once

1. `claude --agent demo-planner-claude`: confirm the role loads and can ask you a question with the question tool.
2. In that session, run `/plan-user-story-from-id <id>` and confirm it reaches its first gate.
3. Run the Implementor handoff command with a test session ID and confirm it resumes from that session.
4. Give Planner a local screenshot and confirm a `_visual_evidence.md` artifact appears, naming the haiku subagent as inspector.
5. In the VS Code extension chat, open a new conversation, type `/` and confirm the six `demo-<role>-fallback` skills are listed. Run `/demo-ask-fallback` with a question and confirm it reads the binding and the Ask contract before answering, and does not edit files.
6. In another new conversation, run `/demo-planner-fallback`, then `/plan-user-story-from-id <id>`, and confirm the planning skill accepts the fallback-started Planner.
