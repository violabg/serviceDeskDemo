# Generated Agentic System Blueprint

Use this blueprint to make the first generated system resemble a complete repository-local operating system, while still adapting paths, names, gates, and skills to the target repository.

Do not copy this blueprint blindly. Keep only the pieces that prevent likely workflow failures in the target repository, and record omitted high-cost pieces in the file plan.

## First Install Batch

The first coherent batch should normally include:

| File | Required | Purpose |
| --- | --- | --- |
| `AGENTS.md` | Yes, unless an approved platform equivalent replaces it | Stable entrypoint that routes agents to contracts, skills, templates, session rules, glossary, knowledge index, and validation commands. |
| `<agent-dir>/<prefix>-planner.agent.md` | Yes | Planning-only role that clarifies, selects knowledge, drafts the approved implementation plan, and hands off. |
| `<agent-dir>/<prefix>-implementor.agent.md` | Yes | Implementation role that edits only from an approved plan and validates the touched behavior. |
| `<agent-dir>/<prefix>-tester.agent.md` | Yes | Test role for approved test strategy, integration tests, or repo-specific validation. |
| `<agent-dir>/<prefix>-knowledge-builder.agent.md` | Yes | Read-only knowledge role that creates or refines the knowledge index and suggests glossary terms. |
| `<agent-dir>/<prefix>-vision.agent.md` | When selected | Image-to-text role for screenshots, mockups, diagrams, UI snapshots, assets, or QA images. |
| `<agent-dir>/<prefix>-ask.agent.md` | Optional | Q&A-only role for knowledge-grounded answers without implementation authority. |
| `<agent-dir>/<prefix>-contract-auditor.agent.md` | Optional hidden | Read-only generated-file auditor for file-plan and contract adherence. |
| `<manifest-path>` | Yes | Version provenance ledger that records the Bootstrap skill version, Bootstrap contract applied-through version, installed skill changelog source, repo-local snapshot path, and later maintenance history. |
| `<bootstrap-changelog-snapshot-path>` | Yes | Repo-local copy of the installed Bootstrap skill `CHANGELOG.md` used as the maintenance baseline when the original installed skill path is unavailable later. |
| `<knowledge-index-path>` | Yes | Index-first routing file with knowledge entries and `When to read` triggers. |
| `<template-dir>/plan-schema.md` | Yes | Implementation-plan artifact schema copied or adapted from this skill. |
| `<template-dir>/question-schema.md` | Yes | Clarification artifact schema copied or adapted from this skill. |
| `<template-dir>/artifact-gates.md` | Usually | Gate, approval, handoff, and session artifact contract. |
| `<context-glossary-path>` | When glossary-worthy terms are resolved | Repository code/domain vocabulary and source-of-truth boundaries. |

## Optional Later Batches

Use later batches for workflows that are valuable but not required for the first stable install:

| File or Skill | When to Add |
| --- | --- |
| Repository-local `plan-bug-from-id` and `plan-user-story-from-id` skills | The team repeatedly plans from existing work-item IDs. Prefer generating them through `create-work-item-planning-skills`. |
| Repository-local create-bug or create-user-story skills | The team repeatedly creates work items from clarified requirements or QA findings. Prefer `create-work-item-from-description` when available. |
| Business-logic gap detector skill | The team wants an explicit test-first weakness-finding workflow for production logic. |
| Integration-test knowledge checklist skill | The team needs repeatable creation or maintenance of project-specific integration-test knowledge. |
| Review agent | Review has a separate authority boundary, durable artifact, or context boundary not covered by gates. |
| Validation or generation scripts | The target repository already has a script runner and the script produces deterministic checks or files. |

## Default Directory Strategy

Adapt these paths to the target platform and repo conventions:

```text
AGENTS.md
CONTEXT.md                         # only when glossary-worthy repo terms are resolved
.github/agents/                    # or .claude/agents/, .cursor/rules/, docs/agents/, platform equivalent
  <prefix>-planner.agent.md
  <prefix>-implementor.agent.md
  <prefix>-tester.agent.md
  <prefix>-knowledge-builder.agent.md
  <prefix>-vision.agent.md         # when selected
  <prefix>-ask.agent.md            # optional
  <prefix>-contract-auditor.agent.md # optional hidden
.github/skills/                    # or platform equivalent
  <repo-skill>/SKILL.md
docs/agents/
  agentic-system-manifest.md
  skill-changelogs/
    bootstrap-agentic-system.CHANGELOG.md
  knowledge-index.md
  templates/
    plan-schema.md
    question-schema.md
    artifact-gates.md
sessions/                          # or approved external session root
  README.md                        # optional, documents current-session-only rule
```

## Batch Rules

- Create the smallest batch that can run the workflow end to end.
- Keep root instructions short and navigational. Put full authority rules in agent contracts.
- Keep the context glossary focused on repository code/domain vocabulary, not broad docs or agent-system narration.
- Keep the knowledge index separate from the glossary. It routes knowledge loading by `When to read` triggers.
- Start every generated agent from the baseline tool surface in `agent-role-contracts.md`; add only discovered or approved MCP tools that fit the role.
- Copy or adapt templates into the target repository so future agents can cite repo-local paths.
- Add scripts only when they reduce repeated manual work and can be validated deterministically.
- Record every omitted role, skill, or script with a reason in the file plan.

## Generated-System Completeness Check

Before asking for approval or handing off, confirm:

- Root instructions name every generated agent, generated skill location, template directory, session root, glossary path when present, and knowledge-index path.
- Root instructions name every generated agent, generated skill location, template directory, session root, glossary path when present, knowledge-index path, and agentic-system manifest path.
- The agentic-system manifest records the Bootstrap skill version used, the Bootstrap contract version applied through, the installed Bootstrap skill changelog path, the repo-local Bootstrap changelog snapshot path, and the generated system paths Maintainer needs for future changelog-delta audits.
- Every generated agent declares the baseline tool surface from `agent-role-contracts.md` or records an approved reduction.
- Discovered MCP or platform integrations are assigned to the relevant agent or generated skill, or omitted with a reason.
- Planner references the glossary path when present, knowledge-index path, plan-schema path, and question-schema path explicitly.
- Implementor requires approved plan metadata before editing and validates the touched behavior after the first edit.
- Tester cannot modify production code unless the repo explicitly uses a combined implementation/testing role and the user approved that boundary.
- Knowledge Builder can create or refine the knowledge index and propose glossary terms without editing application code.
- Vision exists when visual evidence affects planning, implementation, review, or testing.
- Handoff envelope includes session ID, current gate, approval state, selected knowledge, open questions, blocking risks, and next-agent definition of done.
- Validation commands are named, or unavailable validation is reported with a reason.
