---
name: plan-from-github-bug
description: "Use when: user explicitly invokes /plan-from-github-bug to plan a service desk bug fix from a GitHub issue ID or owner/repo#number. Performs root-cause intake before Demo Planner. User-invoked only; do not auto-load."
argument-hint: "owner/repo#bug-issue-number"
user-invocable: true
disable-model-invocation: true
---

# Plan From GitHub Bug

This skill converts a GitHub bug issue into root-cause-focused planning intake for `Demo Planner`.

Follow `docs/agents/governance.md` as the durable workflow policy source.

## When To Use

Use only when the user explicitly invokes `/plan-from-github-bug`.

Do not use this skill automatically for generic planning requests, feature issues, pasted stories, or offline sample stories.

## Required Input

Require a GitHub issue reference in one of these forms:

- `owner/repo#123`
- `https://github.com/owner/repo/issues/123`

If the reference is missing or ambiguous, ask for `owner/repo#bug-issue-number` and stop until the user answers.

Also require a session ID strategy.

For this GitHub-driven workflow, use the GitHub issue ID resolved during intake as the session ID.

## Workflow

1. Parse the owner, repository, and issue number.
2. Invoke `Demo GitHub Issue Intake` to retrieve the bug issue details.
3. Normalize the returned issue data, preserving Markdown, code blocks, image URLs, labels, assignees, milestone, comments, and related items when available.
4. Pull relevant Service Desk IT domain and project knowledge before analyzing causes.
5. Perform narrow-to-wide cause identification:
   - Start from the most likely local code path suggested by the bug report.
   - Expand to other possible code, configuration, data, and external dependency causes.
   - Explain interactions when internal behavior and external dependencies combine to cause the bug.
6. Present the top 2-3 probable causes with evidence and wait for the user to select one.
7. After selection, continue with `Demo Planner` using the selected-cause intake. The planner must use the GitHub issue ID as the session ID, then reuse `sessions/<session-id>/` when present or create it when missing before requirements analysis.
8. Store the selected cause analysis as `bug_<owner>_<repo>_<issue>_cause_analysis.md` inside the session artifact package after the session exists.
9. If the issue body or comments contain requirement-relevant images, preserve their URLs so `Demo Planner` can convert them through `Demo Vision UI` before requirements analysis.

## Cause Selection Format

```markdown
## Cause 1

### Explanation

### Evidence

### Solutions

### Files/Components Involved

### External Dependencies Involved
```

Repeat for Cause 2 and Cause 3 when applicable, then ask:

```text
Please select which cause you want to address in the plan.
```

## Selected Cause Artifact Format

```markdown
# Bug Cause Analysis

## Source

- Repository: owner/repo
- Issue: #123
- URL: https://github.com/owner/repo/issues/123

## Session ID

123

## Selected Cause

## Supporting Evidence

## Files/Components Involved

## External Dependencies Involved

## Proposed Fix Direction

## Planner Instructions

- Produce a single-step implementation plan.
- Use the GitHub issue ID as the session ID.
- Reuse `sessions/<session-id>/` when it already exists.
- Create `sessions/<session-id>/` when it does not exist.
- Store this selected cause analysis in the session artifact package after session creation.
- Convert requirement-relevant images into `Demo Vision UI` artifacts before requirements analysis.
- Focus on the selected root cause, not symptoms.
- Prefer modifying existing code over adding new code unless new code is essential.
- Clearly describe external dependency changes when required.
- Skip non-blocking interview because selected cause is sufficient for planning.
- Preserve Demo Planner approval gates.
```

## Constraints

- Do not implement application code.
- Do not create a `.github/prompts` prompt for this workflow.
- Do not skip cause selection.
- Do not skip `Demo Planner` approval gates.
- Keep GitHub retrieval optional; offline pasted-bug planning remains valid.
- Keep this skill in intake and cause-analysis scope only; do not drift into implementation or testing.
- Do not replace the GitHub issue ID with a different session ID in GitHub-driven workflows.
