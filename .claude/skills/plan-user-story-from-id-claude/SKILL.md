---
name: "plan-user-story-from-id-claude"
description: "This prompt is used to generate an implementation plan based on a work item ID provided by the user."
disable-model-invocation: true
---
## Role activation

This skill runs under the `orchestrator` role. If this conversation runs a different role, stop and tell the user to open a new conversation. If the `sd-orchestrator-claude` skill is not loaded in this conversation yet, read `.claude/skills/sd-orchestrator-claude/SKILL.md` and follow it as your complete role contract before you continue. The role contract governs step order, halt points and session persistence; this skill supplies only its intake.


You need to plan an implementation based the on the work item id provided by the user.
If user don't provide a work item id, ask for it.

Use the available tools to invoke subagent.
Use the following prompt template for the subagent:

```
Activate agent session with id `<sessionId>`.
For the work item <WORK_ITEM_ID>, gather the information with the approved work item integration tools, which already return Markdown:
1. call `#capability:work-item-retrieval` with the work item id to get the title, the description, the URLs of the images, the acceptance criteria and the related work items;
2. call `#capability:work-item-comment-retrieval` with the work item id to get the comments;
3. for every id listed in the "Related Work Items" table, call `#capability:work-item-batch-retrieval` to resolve its title.

Attach to the session a new artifact with the Markdown returned by the tools, in this order:
- title
- description
- Images
- comments
- acceptance criteria
- related work items (with their id, title, and relation type)

then tell me the name of the artifact you created, so I can read it and create the plan.
```

## Bindings

Installed for Claude Code. This is how each `#capability:<token>` in this file runs here.

- `#capability:work-item-batch-retrieval`: Read each linked issue on violabg/serviceDeskDemo with `issue_read` (method `get`), one call per issue number; sub-issues with method `get_sub_issues`.
- `#capability:work-item-comment-retrieval`: Read the issue's comments with `issue_read` (method `get_comments`).
- `#capability:work-item-retrieval`: Read the issue on violabg/serviceDeskDemo with the GitHub MCP server's `issue_read` (method `get`); it returns the title and Markdown body.
