---
name: plan-bug-from-id
description: "Use when: generating an implementation plan based on a bug work item ID provided by the user."
disable-model-invocation: true
---

# Plan Bug From Id

Accept work item identifiers that match GitHub issue numbers like 123 or #123.
Tracker access must use the GitHub issue tracker contract in docs/agents/issue-tracker.md. The canonical lookup key is the GitHub issue number, and the session lookup rule is sessions/<issue-number>/ for tracker-backed work.

If the user does not provide a bug work item ID, ask for it before continuing.

Before starting the plan creation workflow, follow the gates needed to gather the necessary information.

# Bug Information Gathering

Use #tool:agent/runSubagent to delegate work item gathering to a default subagent. Leave args.agentName empty.

The subagent must load only the requested issue by ID. Do not load other issues unless the current issue explicitly references them or the user explicitly requests them.

Use the following prompt template for the subagent:

```
Activate agent session with id <sessionId>.
For the bug <WORK_ITEM_BUG_ID>, gather the title, description, comments, acceptance criteria, labels, and related work items. Use the GitHub issue tracker contract in docs/agents/issue-tracker.md.
Only load the requested issue by ID. Do not load other issues unless the current issue explicitly references them or the user explicitly requests them.

Attach to the session a new artifact containing all the information you have gathered in the following format:
- title
- description
  [convert from html to markdown format, and preserve any code blocks formatting in the description]
- Images
  [the url of the images attached to the description of the work item, if any]
- comments
  [convert from html to markdown format, and preserve any code blocks formatting in the comments]

If the requested issue cannot be resolved or the artifact is missing, ask one targeted clarification question and stop instead of silently ending the workflow.

Then tell me the name of the artifact you created so I can read it and create the plan.
```

# Pulling related knowledge

Based on the information you have gathered about the bug, pull all the related knowledge from the knowledge catalog. This includes both MustHave as well PerContext and PerComponent knowledge. Make sure to pull all the relevant information that can help you understand the bug and its context better.

# Narrow to wide cause identification

Analyze the bug information you have gathered.
Procede to a focused codebase recognition to identify the most likely root cause of the bug.
Then, expand the investigation scope to identify all the possible causes and contributing factors to the bug, including but not limited to:

- Code issues
- Configuration issues
- Data issues
- External dependencies (APIs, services, etc.)

If the bug involves both internal issues and external dependencies, clearly report them and explain how they interact to cause the bug.

Expose the most 2/3 probable causes and contributing factors, and gather as much information as possible about them to prepare for the plan creation.

# Expose causes to user

Report the most probable causes and contributing factors to the user. Make sure to deeply explain each cause with supporting evidence and context. Then ask the user which cause they want to address in the plan and wait is selection.
Use this format to report the causes:

```
## Cause 1:
### Explanation:
[detailed explanation of the cause, how it contributes to the bug, and any supporting evidence or context]
### Solutions:
[list of potential solutions or approaches to address this cause, if applicable]
#### Files/Components involved:
[list of files, components, or modules that are involved in this cause]
#### External dependencies involved:
[list of any external APIs, services, or dependencies that are involved in this cause, if applicable]

[Repeat for Cause 2 and Cause 3 if applicable]

Please select which cause you want to address in the plan.
```

# Save the analysis

After the user selects the cause they want to address in the plan, save the analysis of that cause in a session artifact named `bug_<WORK_ITEM_BUG_ID>_cause_analysis`. This artifact should contain all the detailed information about the selected cause, including the explanation, files/components involved, and any external dependencies. This will be used in the next step for the plan creation.
**RULES FOR BUG FIX PLANNING**

- Produce a single step plan. Event if the fix is complex, try to abstract it into a single step that can be executed and tested independently.
- The plan should be focused on the root cause, not on the symptoms. Avoid including implementations that are not directly related to the root cause. The goal is to have a clear and concise plan that addresses the core issue.
- Prefer the modification of existing code over the addition of new code, unless the new code is essential for the fix. This helps to minimize the risk of introducing new bugs and keeps the codebase cleaner.
- If the fix requires changes to external dependencies, clearly describe the reason.

After you follow the above rules, start from `Gate 0` of the planning workflow.
The identified cause is enough to create a comprehensive and effective plan, so you can safely skip interview.
