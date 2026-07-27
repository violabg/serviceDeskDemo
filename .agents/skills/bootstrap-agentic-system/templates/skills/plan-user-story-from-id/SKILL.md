---
name: plan-user-story-from-id
description: "Use when: generating an implementation plan based on a user story work item ID provided by the user."
disable-model-invocation: true
---

# Plan User Story From Id

<!-- CANONICAL-TEMPLATE-SLOT: WORK_ITEM_ID_FORMAT START -->
Accept work item identifiers that match `{{WORK_ITEM_ID_FORMAT}}`.
<!-- CANONICAL-TEMPLATE-SLOT: WORK_ITEM_ID_FORMAT END -->
<!-- CANONICAL-TEMPLATE-SLOT: LOCAL_MARKDOWN_TRACKER_CONTRACT START -->
When no external tracker is configured, use the local Markdown tracker contract `{{LOCAL_MARKDOWN_TRACKER_CONTRACT}}`.
<!-- CANONICAL-TEMPLATE-SLOT: LOCAL_MARKDOWN_TRACKER_CONTRACT END -->
<!-- CANONICAL-TEMPLATE-SLOT: TRACKER_ADAPTER START -->
Tracker access must use `{{TRACKER_ADAPTER}}` when an external work item integration is configured.
<!-- CANONICAL-TEMPLATE-SLOT: TRACKER_ADAPTER END -->
<!-- CANONICAL-TEMPLATE-SLOT: APPROVED_MCP_TOOLS START -->
Custom agent tool access set: {{APPROVED_MCP_TOOLS}}
<!-- CANONICAL-TEMPLATE-SLOT: APPROVED_MCP_TOOLS END -->

You need to plan an implamentation based the on the work item id provided by the user.
If user don't provide an work item id, ask for it.

<!-- CANONICAL-TEMPLATE-SLOT: WORK_ITEM_RETRIEVAL START -->
use #tool:agent/runSubagent to delegate work item gathering to a default subagent (leave argument args.agentName empty).
<!-- CANONICAL-TEMPLATE-SLOT: WORK_ITEM_RETRIEVAL END -->
Use the following prompt template for the subagent:

```
<!-- CANONICAL-TEMPLATE-SLOT: SESSION_ACTIVATION START -->
Activate agent session with id `<sessionId>`.
<!-- CANONICAL-TEMPLATE-SLOT: SESSION_ACTIVATION END -->
For the work item <WORK_ITEM_ID>, you need to get the title, description, comments, acceptance criteria, epics, and features. You can use the work item integration tools to get this information.
Related work items are important for the plan creation success, so make sure to get them all.

<!-- CANONICAL-TEMPLATE-SLOT: SESSION_ARTIFACT_STORAGE START -->
Attach to the session a new artifact contains all the information you have gathered in the following format:
- title
- description
  [convert from html to markdown format, and preserve any code blocks formatting in the description]
- Images
  [the url of the images attached to the description of the work item, if any]
- comments
  [convert from html to markdown format, and preserve any code blocks formatting in the comments]
- acceptance criteria
  [convert from html to markdown format, and preserve any code blocks formatting in the acceptance criteria]
- related work items (with their id, title, and relation type)

then tell me the name of the artifact you created, so I can read it and create the plan.
<!-- CANONICAL-TEMPLATE-SLOT: SESSION_ARTIFACT_STORAGE END -->
```
