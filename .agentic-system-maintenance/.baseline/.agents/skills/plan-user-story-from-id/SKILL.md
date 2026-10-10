---
name: plan-user-story-from-id
description: "Use when: generating an implementation plan based on a user story work item ID provided by the user."
disable-model-invocation: true
---

# Plan User Story From Id


## Work-Item Planning Contract

Require one External Issue ID matching `#[1-9][0-9]* in violabg/serviceDeskDemo; strip # only for the numeric API parameter and default session suffix`. External Issue ID identifies tracker ticket; it is never Planning Session ID.
Use `GitHub Issues via docs/agents/github-issues-adapter.md; invoked only by demo-planner for these planning skills` with only exact retrieval tools approved in `the active client's selected binding, which lists the exact issue-fetch and issue-comments operations; retrieve comments with explicit pagination and stop if all pages cannot be retrieved; use issue type or labels only when returned by those operations, ask if type is missing or conflicting, and never search, list, or write tracker data`. When no approved external adapter exists, use local Markdown contract `NOT APPLICABLE: GitHub Issues only; stop if GitHub retrieval is unavailable; no local or free-form fallback is approved`.

After retrieval identifies issue type, recommend Planning Session ID `bug-<external-issue-id>` for bugs or `us-<external-issue-id>` for user stories. User may approve a different prefix. Normalize approved custom prefix to lowercase filesystem-safe characters `[a-z0-9_-]`, require a trailing `-`, and record prefix plus resulting Planning Session ID in current session identity artifact.
Create or resume only `sessions/<Planning Session ID>`. Store evidence, dependency evidence, decisions, gate evidence, and final plan only in current Planning Session ID folder. Resume directly from the known Planning Session ID; never scan or enumerate session folders.

Treat acceptance criteria, explicit dependencies, ambiguities, and missing requirements as plan evidence.
Run normal Planner gates after evidence is stored. Ask one evidence-backed blocking clarification at a time only when required evidence leaves a material planning decision unresolved. When no blocking clarification remains, complete all mandatory gates, artifacts, and implementation plan uninterrupted, then ask only for plan review or approval. Never present incomplete artifacts as approval-ready plan.

You need to plan an implamentation based the on the work item id provided by the user.
If user don't provide an work item id, ask for it.

When invoked as demo-planner, use the default evidence delegation procedure in the environment binding already selected through docs/agents/integration-bindings.md. Pass the current issue, approved GitHub read operation, exact owning session ID and this evidence task. Delegate questions return to the parent. When delegation is unavailable or unverified, perform the same bounded task inline under the user-approved 2026-10-08 fallback, preserving issue scope, artifact output and session isolation. If approved tracker access is missing, stop and report it; never broaden access.
Use the following evidence task:

```text
Activate agent session with id `<sessionId>`.
For the work item <WORK_ITEM_ID>, retrieve the title, description, comments, acceptance criteria, image references, and relevant discussion evidence from the current issue only. Read every issue explicitly referenced or linked by the current issue through the approved tracker adapter, and record each issue plus its retrieval reason as dependency evidence. Do not decide whether a referenced issue is relevant before retrieving it. Do not recursively follow references, list, search, preload, or retrieve unrelated issues. Fail closed for missing, duplicate, unreadable, or invalid IDs.

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
- related work items (with their id, title, relation type, and retrieval reason) only when the current issue explicitly references or links to them

then tell me the name of the artifact you created, so I can read it and create the plan.
```
