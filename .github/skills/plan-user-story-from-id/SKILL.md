---
name: plan-user-story-from-id
description: "Use when: generating an implementation plan based on a user story work item ID provided by the user."
disable-model-invocation: true
---

# Plan User Story From Id

Accept work item identifiers that match `GitHub issue numbers like 123 or #123`.
Tracker access must use `GitHub issue tracker contract in docs/agents/issue-tracker.md; issue root is the repository issue list; canonical lookup key is the GitHub issue number; session lookup rule is sessions/<issue-number>/ for tracker-backed work; required fields are title, description, comments, labels, acceptance criteria when present, and related work items when present; if the user does not provide an ID, ask for one before continuing` when an external work item integration is configured.
Custom agent tool access set: none

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
