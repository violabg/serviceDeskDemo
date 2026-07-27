---
name: plan-bug-from-id
description: "Use when: generating an implementation plan from a GitHub bug issue number provided by the user."
disable-model-invocation: true
---

# Plan Bug From Id

Use this skill when the user wants a bug-fix implementation plan from an existing GitHub issue.

- The GitHub issue number is the bug ID.
- The same GitHub issue number is the canonical session ID.
- Reuse `sessions/<issue-number>/` when it already exists.
- Create `sessions/<issue-number>/` when it does not exist yet.
- Use Demo Planner for the actual planning workflow after the bug-specific intake below is complete.

If the user does not provide a bug issue number, ask for it.

Before starting plan creation, follow the gates below so the planner receives tracker facts, bug evidence, and a narrowed root-cause candidate.

# Bug Information Gathering

use #tool:agent/runSubagent to delegate work item gathering to a built-in agent subagent.

Use the following prompt template for the subagent:

```text
Activate agent session with id `<issue-number>`.

For GitHub issue <BUG_ISSUE_NUMBER>, gather the issue title, body, labels, comments, linked sub-issues if visible, directly referenced related issues, and any screenshots or image attachments mentioned in the issue or comments. Use the repository GitHub issue contract and GitHub tools only.

Create or update `sessions/<issue-number>/tracker-issue.md` with the following structure:
- Issue Number
- Title
- Labels
- Description
  [convert GitHub markdown or HTML fragments into clean markdown while preserving code blocks]
- Images
  [list direct image URLs or attachment references when present]
- Comments
  [preserve author context when available and keep code blocks intact]
- Related Issues
  [list only issues directly referenced by number or explicit linkage]

Then tell me that `sessions/<issue-number>/tracker-issue.md` is ready for planning intake.
```

# Pulling Related Knowledge

After the tracker issue artifact is created, read `AGENTS.md`, `CONTEXT.md`, `docs/agents/knowledge/README.md`, and only the repository knowledge entries whose `When to read` triggers match the bug scope.

Always treat `docs/agents/issue-tracker.md`, selected knowledge entries, and existing session artifacts as the source of truth for planning context.

# Narrow to Wide Cause Identification

Analyze the gathered bug evidence.

Proceed with focused codebase recognition to identify the most likely root cause first.
Then widen only enough to identify the strongest contributing factors, including when relevant:

- code issues
- configuration issues
- data issues
- external services or dependencies
- missing permissions, redirects, or session-state assumptions

Expose at most 3 probable causes.
For each cause, gather the minimum evidence needed to justify planning against it.

# Expose Causes To User

Report the most probable causes and contributing factors to the user with this format:

```markdown
## Cause 1:

### Explanation:

[detailed explanation of the cause, how it contributes to the bug, and the supporting evidence]

### Solutions:

[potential solutions or approaches]

#### Components involved:

[symbols, routes, actions, services, or concepts involved]

#### External dependencies involved:

[external APIs, services, dependencies, or `None`]

[Repeat for Cause 2 and Cause 3 if applicable]

Please select which cause you want to address in the plan.
```

# Save The Analysis

After the user selects the cause, save the selected-cause analysis to `sessions/<issue-number>/bug_<issue-number>_cause_analysis.md`.

That artifact must contain:

- selected cause title
- detailed explanation
- supporting evidence summary
- components involved
- external dependencies involved
- known risks or unknowns that still affect planning

# Rules For Bug Fix Planning

- Produce a single-step implementation plan even when the fix is internally complex.
- Focus on the root cause instead of symptom-only mitigation.
- Prefer modification of existing code over new code unless new code is essential.
- If external dependencies contribute to the bug, describe why they matter and where the plan boundary stops.
- When screenshots or QA images are part of the bug evidence, use Demo Vision and cite `sessions/<issue-number>/visual-evidence/vision-ui.md` instead of planning from the raw image.

# Planner Handoff

Once the tracker artifact and selected-cause artifact exist, continue with Demo Planner using the same session ID and begin from planning Gate 1 with the bug evidence already loaded.
