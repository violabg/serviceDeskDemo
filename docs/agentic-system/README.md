# serviceDeskDemo agentic system

This repository runs an orchestrator-based agentic system. You choose one of three workflows, and a local runtime serves it one instruction at a time:

- `DESIGN`: a structured design you review and approve in a review document, then implementation and verification.
- `FAST_IMPLEMENTATION`: a quick path for simple or mechanical changes.
- `DOCUMENTATION`: a guide written from a template, then reviewed.

The orchestrator never writes production code. It hands the code and the verifications to delegates, each working in its own context, and acts on their verdicts.

## Where things live

| What | Where |
| --- | --- |
| Runtime, workflows, contracts | `agentic-system/` |
| Sessions (memory, log, artifacts, designs) | `agentic-system-sessions/` |
| Project knowledge | `knowledge/` |
| Vocabulary | `CONTEXT.md` |
| Personal documentation templates | `~/.agentic-system/documentation/templates/` |

The runtime needs Node.js. Never edit files under the sessions folder by hand: designs and jobs change only through the runtime.

## Guides per client

- [Claude Code](claude-code.md)
- [GitHub Copilot (VS Code and CLI)](github-copilot-vscode.md)
- [OpenCode](opencode.md)

## Keeping it current

The installation is recorded in the maintenance folder. To change a decision or move to a newer kit, run the `maintain-orchestrator-system` skill in a plain session, not inside one of the roles. To audit how a session went (token use, adherence to the flow, gaps in the runtime, the knowledge or the issue), run `improve-orchestrator-system` there with the session id.
