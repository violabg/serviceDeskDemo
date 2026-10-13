---
name: plan-user-story-from-id
description: "Use when: generating an implementation plan based on a user story work item ID provided by the user."
disable-model-invocation: true
---

# Plan User Story From Id

## Required Role
This skill runs only under the Planner role, as the main conversation. Run it only when this conversation is already working as the Planner role (`demo-planner`; the active environment binding (`docs/agents/bindings/<environment>.md`, for the environment the root router resolved) names its native registration and start step). Otherwise stop and tell the user that exact Planner start step from the binding. Both selected environments select the main-session role natively; the binding records whether the Planner tool limits are runtime-enforced.
## Repository Context Boundary
- Exclude `.agentic-system-maintenance/` and installed Bootstrap/Maintainer bodies, resources, and aliases before ordinary search, discovery, knowledge loading, or delegation. They are accessible only during initial Bootstrap or explicitly requested agent-system maintenance.
- Keep generated project knowledge under top-level `knowledge/`; report provenance maintenance needed after runtime system edits instead of accessing the maintenance area.
## Work-Item Planning Contract

Require one External Issue ID matching `#[1-9][0-9]* in violabg/serviceDeskDemo; strip # only for the numeric API parameter and default session suffix`. External Issue ID identifies tracker ticket; it is never Planning Session ID.
Use `GitHub Issues via docs/agents/github-issues-adapter.md; invoked only by demo-planner for these planning skills` with only exact retrieval tools approved in `the GitHub MCP `issue_read` operation (methods `get`, `get_comments` and `get_labels`) for exact issue IDs in `violabg/serviceDeskDemo`, called by the qualified tool name in the active environment binding (`docs/agents/bindings/<environment>.md`, for the environment the root router resolved); retrieve comments with explicit pagination and stop if all pages cannot be retrieved; use issue type or labels only when returned, ask if type is missing or conflicting, follow `docs/agents/github-issues-adapter.md`, and never search, list, or write tracker data`. When no approved external adapter exists, use local Markdown contract `NOT APPLICABLE: GitHub Issues only; stop if GitHub retrieval is unavailable; no local or free-form fallback is approved`.

After retrieval identifies issue type, recommend Planning Session ID `bug-<external-issue-id>` for bugs or `us-<external-issue-id>` for user stories. User may approve a different prefix. Normalize approved custom prefix to lowercase filesystem-safe characters `[a-z0-9_-]`, require a trailing `-`, and record prefix plus resulting Planning Session ID in current session identity artifact.
Create or resume only `sessions/<Planning Session ID>`. Store evidence, dependency evidence, decisions, gate evidence, and final plan only in current Planning Session ID folder. Resume directly from the known Planning Session ID; never scan or enumerate session folders.

Treat acceptance criteria, explicit dependencies, ambiguities, and missing requirements as plan evidence.
Run normal Planner gates after evidence is stored. Ask all evidence-backed blocking clarifications together in one message only when required evidence leaves a material planning decision unresolved. When no blocking clarification remains, complete all mandatory gates, artifacts, and implementation plan uninterrupted, then ask only for plan review or approval. Never present incomplete artifacts as approval-ready plan.

You need to plan an implementation based the on the work item id provided by the user.
If user don't provide an work item id, ask for it.

When invoked as demo-planner, use the default evidence delegation procedure in the environment binding already selected through docs/agents/integration-bindings.md. Pass the current issue, approved GitHub read operation, exact owning session ID and this evidence task. Delegate questions return to the parent. When delegation is unavailable or unverified, perform the same bounded task inline under the user-approved 2026-10-08 fallback, preserving issue scope, artifact output and session isolation. If approved tracker access is missing, stop and report it; never broaden access.
Use the following evidence task:

```text
Activate agent session with id `<sessionId>`.
For the work item <WORK_ITEM_ID>, gather the information from the current issue only through the approved work item integration tools in `the GitHub MCP `issue_read` operation (methods `get`, `get_comments` and `get_labels`) for exact issue IDs in `violabg/serviceDeskDemo`, called by the qualified tool name in the active environment binding (`docs/agents/bindings/<environment>.md`, for the environment the root router resolved); retrieve comments with explicit pagination and stop if all pages cannot be retrieved; use issue type or labels only when returned, ask if type is missing or conflicting, follow `docs/agents/github-issues-adapter.md`, and never search, list, or write tracker data`, which already return Markdown:
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
