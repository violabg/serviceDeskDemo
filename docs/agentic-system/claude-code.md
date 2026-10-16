# Using the Agent Roles in Claude Code

Applies to Claude Code 2.1.300 (CLI and VS Code extension). Status of every start method: documented, not exercised in this repository.

## Start a role

Every role starts through a skill that you type in a new conversation: a new `claude` session in the terminal, or a new conversation in the VS Code extension chat. The same skills work on both. There are no Claude Code agents for these roles, so `claude --agent` is no longer used.

| Role | Start it with | Use it for |
| --- | --- | --- |
| Planner | `/plan-user-story-from-id <issue-id>` or `/plan-bug-from-id <issue-id>` | Plan from a GitHub issue; clarification and implementation plan |
| Implementor | `/demo-implementor-claude` | Execute an approved plan |
| Direct Implementor | `/demo-direct-implementor-claude` | Implement validated requirements without a plan; never writes tests |
| Integration Tester | `/demo-integration-tester-claude` | Plan and run integration tests |
| Knowledge Builder | `/demo-knowledge-builder-claude` | Add or refresh repository knowledge |
| Ask | `/demo-ask-claude` | Read-only questions about the code |

You can add the first message after the skill name. Planner always starts from an issue ID: planning without a GitHub issue is not offered in Claude Code. Use one role per conversation: a role skill does not start in a conversation that already runs a role. To keep working with that role, send your request without the command; to change role, open a new conversation. Do not set `agent` in `.claude/settings.json`; that would run every session under one role.

**Tool limits are instructions only.** Each role's limits come from its row in the binding's tool table and from the role contract, but Claude Code does not block the tools: Ask is told not to edit or run commands, and Planner and Knowledge Builder are told not to run shell commands. Limits inside a granted tool, such as Planner writing only session artifacts, are instructions too. Claude cannot start these roles on its own: every role and planning skill sets `disable-model-invocation: true`.

**Tool access.** Every role runs in a normal Claude Code session. Observed on Claude Code 2.1.300 in the VS Code extension: the session has `Read`, `Edit`, `Write`, `Bash`, `Agent` (subagents) and `AskUserQuestion`, and loads `WebFetch` and the project MCP tools (`github`, `neon`, `next-devtools`) on demand. It has no `Glob` or `Grep` search tools, so roles search the repository with read-only `grep` and `find` commands instead; for Planner, Knowledge Builder and Ask that is the only shell use allowed. A terminal session has not been observed yet.

## Common flows

- **Plan a user story or bug.** Open a new conversation and run `/plan-user-story-from-id 12` or `/plan-bug-from-id 12`. The skill loads the Planner role, then plans. Planner asks all blocking questions together and collects the answers with the question tool, at most four per prompt.
- **Hand off to implementation.** When you approve the plan, Planner prints the next step. Start Implementor with fresh context in a new conversation:

  ```text
  /demo-implementor-claude Resume implementation for Planning Session <planning-session-id>
  ```

- **Implement without a plan.** Run `/demo-direct-implementor-claude` and describe the change.
- **Ask a question.** Run `/demo-ask-claude`; it never edits files.
- **Build knowledge.** Run `/demo-knowledge-builder-claude`; it writes only under `knowledge/` and its index.
- **Create or update an issue.** In a normal session with no role running, run `/manage-work-item`. It writes only after you approve the exact proposal.
- **Maintain the agent system.** Run `/maintain-agentic-system` only in a normal session with no role running.

## Images

Planner and Direct Implementor pass each local image to a general-purpose subagent on the `haiku` model, which you approved for image inspection. If that is not possible, they read the image themselves. Each image becomes `sessions/<id>/artifacts/<image-name>_visual_evidence.md`. For private GitHub issue images, save the image locally and give its path.

## Sessions and artifacts

Session files live in `sessions/<planning-session-id>/`: `session-memory.md`, `session-log.md`, the implementation plan, `execution-report.md` and `artifacts/`. Resume a session by giving its ID; agents never browse other sessions.

## Setup and recovery

- GitHub issue access uses the `github` server in `.mcp.json`, authenticated from the `GITHUB_TOKEN` environment variable. Neon uses its own login. Approve the project MCP servers when Claude Code asks.
- If a role reports that a tool is missing, check `/mcp` and restart the session. Roles stop the dependent step rather than switching tools.
- The diagnostics step in Implementor and Integration Tester is blocked by an inherited template gap; they use the typecheck and lint commands instead.

## Verify once

1. In the VS Code extension chat, open a new conversation, type `/` and confirm the five `demo-<role>-claude` skills and the two planning skills are listed.
2. Run `/plan-user-story-from-id <id>` and confirm it loads the binding and the Planner contract, can ask you a question with the question tool, and that its Gate 5 repository search runs with read-only `grep` and `find`.
3. In that same conversation, run `/demo-ask-claude` and confirm it loads nothing and tells you a role is already running.
4. Run the Implementor handoff with a test session ID in a new conversation and confirm it resumes from that session.
5. Give Planner a local screenshot and confirm a `_visual_evidence.md` artifact appears, naming the haiku subagent as inspector.
6. In a terminal, start `claude`, run `/demo-ask-claude` with a question, and confirm the session has the tools listed above (no `Glob` or `Grep`) and that Ask does not edit files.
