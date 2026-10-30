# {{REPO_NAME}} agentic system

This repository runs an orchestrator-based agentic system. You choose one of three workflows, and a local runtime serves it one instruction at a time:

- `DESIGN`: a structured design you review and approve in a review document, then implementation and verification.
- `FAST_IMPLEMENTATION`: a quick path for simple or mechanical changes.
- `DOCUMENTATION`: a guide written from a template, then reviewed.

The orchestrator never writes production code. It hands the code and the verifications to delegates, each working in its own context, and acts on their verdicts.

## Where things live

| What | Where |
| --- | --- |
| Runtime, workflows, contracts | `{{RUNTIME_ROOT}}/` |
| Sessions (memory, log, artifacts, designs) | `{{SESSIONS_ROOT}}/` |
| Project knowledge | `{{KNOWLEDGE_ROOT}}/` |
| Vocabulary | `{{CONTEXT_GLOSSARY_PATH}}` |
| Personal documentation templates | `{{USER_RUNTIME_ROOT}}/documentation/templates/` |

The runtime needs Node.js. Never edit files under the sessions folder by hand: designs and jobs change only through the runtime.

## Guides per client

{{CLIENT_LIST}}

## Keeping it current

The installation is recorded in the maintenance folder. To change a decision or move to a newer kit, run the `maintain-orchestrator-system` skill in a plain session, not inside one of the roles.
