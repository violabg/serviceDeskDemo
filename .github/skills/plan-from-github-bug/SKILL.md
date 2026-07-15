---
name: plan-from-github-bug
description: "Use when: user explicitly invokes /plan-from-github-bug to plan a service desk bug fix from a GitHub issue ID or owner/repo#number. Performs root-cause intake before Demo Planner. User-invoked only; do not auto-load."
argument-hint: "owner/repo#bug-issue-number"
user-invocable: true
disable-model-invocation: true
---

# Plan From GitHub Bug

This skill converts a GitHub bug issue into root-cause-focused planning intake for `Demo Planner`.

## When To Use

Use only when the user explicitly invokes `/plan-from-github-bug`.

Do not use this skill automatically for generic planning requests, feature issues, pasted stories, or offline sample stories.

## Required Input

Require a GitHub issue reference in one of these forms:

- `owner/repo#123`
- `https://github.com/owner/repo/issues/123`

If the reference is missing or ambiguous, ask for `owner/repo#bug-issue-number` and stop until the user answers.

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
7. After selection, create or update a cause analysis artifact named `bug_<owner>_<repo>_<issue>_cause_analysis.md` in the current session artifact location when one exists. If no session artifact location is available, include the artifact content in the response and ask the user where to save it.
8. Continue with `Demo Planner` using the selected-cause intake.

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

## Selected Cause

## Supporting Evidence

## Files/Components Involved

## External Dependencies Involved

## Proposed Fix Direction

## Planner Instructions

- Produce a single-step implementation plan.
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
