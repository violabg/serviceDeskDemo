---
name: plan-user-story-from-id
description: "Use when: generating an implementation plan from a GitHub user-story issue number provided by the user."
disable-model-invocation: true
---

# Plan User Story From Id

Use this skill when the user wants an implementation plan from an existing GitHub issue that acts as a user story, PRD, feature request, or scoped delivery item.

- The GitHub issue number is the work item ID.
- The same GitHub issue number is the canonical session ID.
- Reuse `sessions/<issue-number>/` when it already exists.
- Create `sessions/<issue-number>/` when it does not exist yet.
- Use Demo Planner for the actual planning workflow after the tracker intake below is complete.

If the user does not provide an issue number, ask for it.

use #tool:agent/runSubagent to delegate work item gathering to a default subagent (leave argument args.agentName empty).

Use the following prompt template for the subagent:

```text
Activate agent session with id `<issue-number>`.

For GitHub issue <WORK_ITEM_ID>, gather the issue title, body, labels, comments, visible sub-issues when present, directly referenced related issues, and any screenshots or image attachments. Use the repository GitHub issue contract and GitHub tools only.

Interpret acceptance criteria from explicit task lists, acceptance-criteria headings, scoped checklists, or direct maintainer comments when they exist. Do not invent acceptance criteria that are not present.

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
- Acceptance Criteria
  [copy only explicit acceptance criteria, checklists, or scoped success conditions from the issue or comments]
- Related Issues
  [list related issues with their numbers, titles when available, and relation type if explicit]

Then tell me that `sessions/<issue-number>/tracker-issue.md` is ready for planning intake.
```

# Planning Intake

After the tracker issue artifact is created, read `AGENTS.md`, `CONTEXT.md`, `docs/agents/knowledge/README.md`, and only the repository knowledge entries whose `When to read` triggers match the story scope.

Always treat `docs/agents/issue-tracker.md`, selected knowledge entries, and existing session artifacts as the source of truth for planning context.

# Story Readiness Checks

Before drafting the implementation plan, make requirement gaps explicit.
Call out missing or weak areas such as:

- ambiguous scope
- missing acceptance criteria
- unclear ownership boundaries
- missing permission model changes
- missing validation expectations
- unresolved visual requirements

If screenshots, mockups, browser captures, or QA images define any part of the story, use Demo Vision and cite `sessions/<issue-number>/visual-evidence/vision-ui.md` instead of reasoning from the raw image.

# Planner Handoff

Once tracker intake is complete, continue with Demo Planner using the same session ID and begin from planning Gate 1 with the issue evidence already loaded.
