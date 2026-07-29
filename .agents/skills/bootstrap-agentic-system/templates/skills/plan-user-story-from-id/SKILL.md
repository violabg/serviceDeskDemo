---
name: plan-user-story-from-id
description: "Use when: generating an implementation plan based on a user story work item ID provided by the user."
disable-model-invocation: true
---

# Plan User Story From Id

<!-- CANONICAL-TEMPLATE-SLOT: WORK_ITEM_PLANNING_CONTRACT START replaces=none -->
## Work-Item Planning Contract

Require one External Issue ID matching `{{WORK_ITEM_ID_FORMAT}}`. External Issue ID identifies tracker ticket; it is never Planning Session ID.
Use `{{TRACKER_ADAPTER}}` with only exact retrieval tools approved in `{{WORK_ITEM_RETRIEVAL}}`. When no approved external adapter exists, use local Markdown contract `{{LOCAL_MARKDOWN_TRACKER_CONTRACT}}`.

Use #tool:agent/runSubagent to retrieve current issue only. Convert rich text and attachments to Markdown while preserving code blocks. Retrieve title, description, comments, acceptance criteria, image references, and relevant discussion evidence.
Read another issue only when current issue explicitly references it and reference is relevant to planning. Record that issue and retrieval reason as dependency evidence. Do not recursively follow references, list, search, preload, or retrieve unrelated issues.
Fail closed for missing, duplicate, unreadable, or invalid IDs.

After retrieval identifies issue type, recommend Planning Session ID `bug-<external-issue-id>` for bugs or `us-<external-issue-id>` for user stories. User may approve a different prefix. Normalize approved custom prefix to lowercase filesystem-safe characters `[a-z0-9_-]`, require a trailing `-`, and record prefix plus resulting Planning Session ID in current session identity artifact.
Create or resume only `{{SESSION_ROOT}}/<Planning Session ID>`. Store evidence, dependency evidence, decisions, gate evidence, and final plan only in current Planning Session ID folder. Resume directly from the known Planning Session ID; never scan or enumerate session folders.

Treat acceptance criteria, explicit dependencies, ambiguities, and missing requirements as plan evidence.
Run normal Planner gates after evidence is stored. Ask one evidence-backed blocking clarification at a time only when required evidence leaves a material planning decision unresolved. When no blocking clarification remains, complete all mandatory gates, artifacts, and implementation plan uninterrupted, then ask only for plan review or approval. Never present incomplete artifacts as approval-ready plan.
<!-- CANONICAL-TEMPLATE-SLOT: WORK_ITEM_PLANNING_CONTRACT END -->
You need to plan an implamentation based the on the work item id provided by the user.
If user don't provide an work item id, ask for it.

use #tool:agent/runSubagent to delegate work item gathering to a default subagent (leave argument args.agentName empty).
Use the following prompt template for the subagent:

```
Activate agent session with id `<sessionId>`.
For the work item <WORK_ITEM_ID>, you need to get the title, description, comments, acceptance criteria, epics, and features. You can use the work item integration tools to get this information.
Related work items are important for the plan creation success, so make sure to get them all.

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
```
