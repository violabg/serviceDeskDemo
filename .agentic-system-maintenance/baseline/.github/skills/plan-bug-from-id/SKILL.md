---
name: "plan-bug-from-id"
description: "This prompt is used to generate an implementation plan based on a bug work item ID provided by the user."
disable-model-invocation: true
---
## Role activation

This skill runs under the `sd-orchestrator` agent. If this conversation is not running it, stop and tell the user to select `sd-orchestrator` in the Chat view's agent picker, then invoke this skill again.


You need to plan a bug resolution based on the bug work item ID provided by the user.
If the user doesn't provide a bug work item ID, ask for it.

Before starting the plan creation worfklow, follow the following Gates to make sure you have all the necessary information to create a comprehensive and effective plan.

# Bug Information Gathering
Use the available tools to invoke subagent.
Use the following prompt template for the subagent:

```
Activate agent session with id `<sessionId>`.
For the bug <WORK_ITEM_BUG_ID>, gather the information with the approved work item integration tools, which already return Markdown: call `#capability:work-item-retrieval` with the bug id for the title, the description, the URLs of the images and the acceptance criteria, then call `#capability:work-item-comment-retrieval` with the bug id for the comments.
Do not include related work items.

Attach to the session a new artifact with the Markdown returned by the tools, in this order:
- title
- description
- Images
- comments

then tell me the name of the artifact you created, so I can read it and create the plan.
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

After you follow the above rules, continue with the active workflow.
The identified cause is enough to create a comprehensive and effective plan, so you can safely skip interview.
## Bindings

Installed for GitHub Copilot in VS Code. This is how each `#capability:<token>` and `#operation:<op>` in this file runs here.

- `#capability:work-item-comment-retrieval`: Read the issue's comments with `issue_read` (method `get_comments`).
- `#capability:work-item-retrieval`: Read the issue on violabg/serviceDeskDemo with the GitHub MCP server's `issue_read` (method `get`); it returns the title and Markdown body.
