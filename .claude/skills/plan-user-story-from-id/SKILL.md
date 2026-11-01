---
name: "plan-user-story-from-id"
description: "This prompt is used to generate an implementation plan based on a work item ID provided by the user."
disable-model-invocation: true
---
## Role activation

This skill runs under the `orchestrator` role. Follow the line for your client.

- **Claude Code:** If this conversation runs a different role, stop and tell the user to open a new conversation. If the `sd-orchestrator` skill is not loaded in this conversation yet, read `.claude/skills/sd-orchestrator/SKILL.md` and follow it as your complete role contract before you continue. The role contract governs step order, halt points and session persistence; this skill supplies only its intake.
- **GitHub Copilot (VS Code and CLI):** If this conversation already runs the `sd-orchestrator` agent, continue. If it runs a different role of this system (`sd-ask`, `sd-knowledge-builder`), stop and tell the user to open a new conversation. In every other case, do not stop and do not ask the user to select an agent, even when the client has no agent picker: read `.github/agents/sd-orchestrator.agent.md` now and follow its body as your complete role contract before you continue. The role contract governs step order, halt points and session persistence; this skill supplies only its intake.
- **OpenCode:** If this conversation already runs the `sd-orchestrator` agent, continue. If it runs a different role of this system (`sd-ask`, `sd-knowledge-builder`), stop and tell the user to open a new conversation. In every other case, do not stop and do not ask the user to select an agent, even when the client has no agent picker: read `.opencode/agents/sd-orchestrator.md` now and follow its body as your complete role contract before you continue. The role contract governs step order, halt points and session persistence; this skill supplies only its intake.


You need to plan an implementation based the on the work item id provided by the user.
If user don't provide a work item id, ask for it.

Use the available tools to invoke subagent. The subagent sees only the prompt you pass, not this file: append to the template the runtime lines of this file's Bindings section and the line of every `#capability:` token the template names.
Use the following prompt template for the subagent:

```
Activate agent session with id `<sessionId>` with `#capability:session-activate`.
For the work item <WORK_ITEM_ID>, gather the information with the approved work item integration tools, which already return Markdown:
1. call `#capability:work-item-retrieval` with the work item id to get the title, the description, the URLs of the images, the acceptance criteria and the related work items;
2. call `#capability:work-item-comment-retrieval` with the work item id to get the comments;
3. for every id listed in the "Related Work Items" table, call `#capability:work-item-batch-retrieval` to resolve its title.

With `#capability:session-artifact-write`, attach to the session a new artifact with the Markdown returned by the tools, in this order:
- title
- description
- Images
- comments
- acceptance criteria
- related work items (with their id, title, and relation type)

then answer with the name of the artifact you created. The orchestrator that started you reads it and creates the plan.
```

## Bindings

This is how each `#capability:<token>` and `#operation:<op>` in this file runs in your client.

- Runtime operations: run `node agentic-system/bin/agentic-system.mjs <token>` from the repository root, where `<token>` is the name of a runtime `#capability:<token>` (an `#operation:<op>` is never a runtime command); pass arguments as flags (`--sessionId s1`) or as one JSON object: inline when it is short (`--json '{"sessionId":"s1"}'`), on stdin in the same command when it is large (`--json -` with a quoted heredoc, in a POSIX shell), or else with `--json <file>`. The JSON payload is the operation's argument object, defined in `agentic-system/contracts/`: design operations take `{ "sessionId", "jobId", "request": { ... } }`, and fields such as `operation`, `rows` and `ids` go inside `request`; every other operation takes its arguments at the top level. The arguments of each command are listed below, so do not probe them first; run `node agentic-system/bin/agentic-system.mjs <token> --help` only when a call is refused or you need a field's definition. On a design command it prints every field of `request` and of its rows, so read that rather than the contract files. A long answer arrives in parts: when it ends with `[part N of M. The answer continues …]`, request every remaining part it names, all in one turn as parallel tool calls if your client allows it, or else one by one, and read every part before acting on any of it. Run one runtime operation per shell command: never join two calls with `;`, `&&` or a loop, and never pipe an answer through `head`, `tail`, `cut`, `sed` or `dd`. The runtime is required; when it cannot run, follow the procedure its contract under `agentic-system/contracts/` gives and record that the gate ran instruction-only.
- Runtime command arguments:
  - `session-activate`: sessionId
  - `session-artifact-write`: sessionId, artifactFrontMatter, name, artifactName, description, intendedUse, intended_use, use, mimeType, mime_type, origin, content, contentFile
- `#capability:work-item-batch-retrieval`: Read each linked issue on violabg/serviceDeskDemo with `issue_read` (method `get`), one call per issue number; sub-issues with method `get_sub_issues`.
- `#capability:work-item-comment-retrieval`: Read the issue's comments with `issue_read` (method `get_comments`).
- `#capability:work-item-retrieval`: Read the issue on violabg/serviceDeskDemo with the GitHub MCP server's `issue_read` (method `get`); it returns the title and Markdown body.
