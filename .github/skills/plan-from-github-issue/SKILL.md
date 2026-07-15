---
name: plan-from-github-issue
description: "Use when: user explicitly invokes /plan-from-github-issue to create a service desk planning intake from a GitHub issue ID or owner/repo#number. User-invoked only; do not auto-load."
argument-hint: "owner/repo#issue-number"
user-invocable: true
disable-model-invocation: true
---

# Plan From GitHub Issue

This skill converts a GitHub issue into normalized planning intake for `Demo Planner`.

## When To Use

Use only when the user explicitly invokes `/plan-from-github-issue`.

Do not use this skill automatically for generic planning requests, pasted stories, or offline sample stories.

## Required Input

Require a GitHub issue reference in one of these forms:

- `owner/repo#123`
- `https://github.com/owner/repo/issues/123`

If the reference is missing or ambiguous, ask for `owner/repo#issue-number` and stop until the user answers.

## Workflow

1. Parse the owner, repository, and issue number.
2. Invoke `Demo GitHub Issue Intake` to retrieve the issue details.
3. Normalize the returned issue data into the planning intake format below.
4. Preserve Markdown, code blocks, image URLs, labels, assignees, milestone, comments, and related items when available.
5. If retrieval is incomplete, list explicit gaps and ask only for missing information that can change planning scope.
6. Continue with `Demo Planner` using the normalized intake content.

## Planning Intake Format

```markdown
# GitHub Issue Planning Intake

## Source

- Repository: owner/repo
- Issue: #123
- URL: https://github.com/owner/repo/issues/123

## Title

## Description

## Images

## Comments

## Acceptance Criteria

## Labels And Metadata

## Related Items

## Retrieval Gaps

## Planner Instructions

- Treat this as a plannable Service Desk IT requirement.
- Run the standard Demo Planner gates.
- Ask focused clarification questions only when missing details can change scope, behavior, data, UX, security, or test coverage.
```

## Constraints

- Do not implement application code.
- Do not create a `.github/prompts` prompt for this workflow.
- Do not skip `Demo Planner` approval gates.
- Keep GitHub retrieval optional; offline sample or pasted-story planning remains valid.
