---
name: plan-user-story-from-id
description: "Use when: generating an implementation plan based on a user story work item ID provided by the user."
disable-model-invocation: true
---

# Plan User Story From Id

<!-- CANONICAL-TEMPLATE-SLOT: MAINTENANCE_ROOT START replaces=none -->
## Repository Context Boundary
- Exclude `{{MAINTENANCE_ROOT}}` and installed Bootstrap/Maintainer bodies, resources, and aliases before ordinary search, discovery, knowledge loading, or delegation. They are accessible only during initial Bootstrap or explicitly requested agent-system maintenance.
- Keep generated project knowledge under top-level `knowledge/`; report provenance maintenance needed after runtime system edits instead of accessing the maintenance area.
<!-- CANONICAL-TEMPLATE-SLOT: MAINTENANCE_ROOT END -->
<!-- CANONICAL-TEMPLATE-SLOT: WORK_ITEM_PLANNING_CONTRACT START replaces=sha256:742b897d07a5392c lines=23 -->
## Work-Item Planning Contract

Require one External Issue ID matching `{{WORK_ITEM_ID_FORMAT}}`. External Issue ID identifies tracker ticket; it is never Planning Session ID.
Use `{{TRACKER_ADAPTER}}` with only exact retrieval tools approved in `{{WORK_ITEM_RETRIEVAL}}`. When no approved external adapter exists, use local Markdown contract `{{LOCAL_MARKDOWN_TRACKER_CONTRACT}}`.

After retrieval identifies issue type, recommend Planning Session ID `bug-<external-issue-id>` for bugs or `us-<external-issue-id>` for user stories. User may approve a different prefix. Normalize approved custom prefix to lowercase filesystem-safe characters `[a-z0-9_-]`, require a trailing `-`, and record prefix plus resulting Planning Session ID in current session identity artifact.
Create or resume only `{{SESSION_ROOT}}/<Planning Session ID>`. Store evidence, dependency evidence, decisions, gate evidence, and final plan only in current Planning Session ID folder. Resume directly from the known Planning Session ID; never scan or enumerate session folders.

Treat acceptance criteria, explicit dependencies, ambiguities, and missing requirements as plan evidence.
Run normal Planner gates after evidence is stored. Ask one evidence-backed blocking clarification at a time only when required evidence leaves a material planning decision unresolved. When no blocking clarification remains, complete all mandatory gates, artifacts, and implementation plan uninterrupted, then ask only for plan review or approval. Never present incomplete artifacts as approval-ready plan.

You need to plan an implementation based the on the work item id provided by the user.
If user don't provide an work item id, ask for it.

{{WORK_ITEM_GATHERING}}
Use the following evidence task:

```text
Activate agent session with id `<sessionId>`.
For the work item <WORK_ITEM_ID>, gather the information from the current issue only through the approved work item integration tools in `{{WORK_ITEM_RETRIEVAL}}`, which already return Markdown:
1. call `#capability:work-item-retrieval` with the work item id to get the title, the description, the URLs of the images, the acceptance criteria and the related work items;
2. call `#capability:work-item-comment-retrieval` with the work item id to get the comments;
3. for every id listed in the "Related Work Items" table, call `#capability:work-item-batch-retrieval` to resolve its title.

Read every issue the current issue explicitly references or links to through the approved tracker adapter, and record each issue plus its retrieval reason as separate dependency evidence. Do not decide whether a referenced issue is relevant before retrieving it. Do not recursively follow references, list, search, preload, or retrieve unrelated issues. Fail closed for missing, duplicate, unreadable, or invalid IDs.

Attach to the session a new artifact with the Markdown returned by the tools, in this order:
- title
- description
- Images
- comments
- acceptance criteria
- related work items (with their id, title, and relation type)

then tell me the name of the artifact you created, so I can read it and create the plan.
```
<!-- CANONICAL-TEMPLATE-SLOT: WORK_ITEM_PLANNING_CONTRACT END -->
