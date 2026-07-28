---
name: plan-user-story-from-id
description: "Use when: generating an implementation plan based on a user story work item ID provided by the user."
disable-model-invocation: true
---

# Plan User Story From Id

Accept work item identifiers that match GitHub issue numbers like 123 or #123.
Tracker access must use the GitHub issue tracker contract in docs/agents/issue-tracker.md. The canonical lookup key is the GitHub issue number, and the session lookup rule is sessions/<issue-number>/ for tracker-backed work.

If the user does not provide an ID, ask for it before continuing.

Use #tool:agent/runSubagent to delegate work item gathering to a default subagent. Leave args.agentName empty.

The subagent must load only the requested issue by ID. Do not load other issues unless the current issue explicitly references them or the user explicitly requests them.

Use the following prompt template for the subagent:

```
Activate agent session with id <sessionId>.
For the work item <WORK_ITEM_ID>, gather the title, description, comments, acceptance criteria, labels, and related work items. Use the GitHub issue tracker contract in docs/agents/issue-tracker.md.
Only load the requested issue by ID. Do not load other issues unless the current issue explicitly references them or the user explicitly requests them.

Attach to the session a new artifact containing all the information you have gathered in the following format:
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

If the requested issue cannot be resolved or the artifact is missing, ask one targeted clarification question and stop instead of silently ending the workflow.

Then tell me the name of the artifact you created so I can read it and create the plan.
```
