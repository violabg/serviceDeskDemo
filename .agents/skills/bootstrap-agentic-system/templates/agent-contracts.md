# Agent Contract Templates

Use these as starting shapes. Adapt names, tools, and paths to the target platform.

## Source Templates to Preserve

When drafting a planner or implementor contract, use these repository originals as source material instead of inventing new shapes:

- Generated system blueprint: [`generated-system-blueprint.md`](generated-system-blueprint.md)
- Role-specific agent contracts: [`agent-role-contracts.md`](agent-role-contracts.md)
- Knowledge index schema: [`knowledge-index-schema.md`](knowledge-index-schema.md)
- Implementation plan schema: [`plan-schema.md`](plan-schema.md)
- Clarification question schema: [`question-schema.md`](question-schema.md)

Use the original shapes as examples, then adapt fields to the target repo. Start from `agent-role-contracts.md` for concrete Planner, Implementor, Tester, Knowledge Builder, Vision, Ask, and Contract Auditor contracts; use this file for the shared root, Vision, hidden subagent, and artifact contract snippets.

## Root AGENTS.md Shape

Create root `AGENTS.md`, or an approved platform-equivalent root instruction file, as the stable entrypoint for future agents working in the repository.

Minimum sections:

```markdown
# Repository Agent Instructions

## Agentic System Entrypoints

- Planner:
- Implementor:
- Tester:
- Knowledge Builder:
- Vision: `<path>` | not installed

## Repository Context

- Context glossary: `CONTEXT.md` | `<path>` | none
- Rule: use the glossary for stable repository code/domain vocabulary and source-of-truth boundaries. Do not treat it as a knowledge index.

## Knowledge Loading

- Knowledge index: `<path>`
- Rule: read the index before loading knowledge files and load only matching entries.

## Sessions And Approval

- Session path:
- Approval gate:
- Handoff artifact:

## Validation

- Required commands:
- Skipped or unavailable checks:

## Generated Skills And Templates

- Skills:
- Templates:
```

Keep this file short. It should route agents to the right generated contracts, glossary, knowledge index, templates, and validation commands without duplicating full agent instructions.

## Vision Agent Shape

Create a Vision agent when screenshots, mockups, wireframes, diagrams, UI snapshots, browser screenshots, image assets, issue attachments, or annotated QA images materially affect planning, implementation, review, or testing.

````markdown
---
name: "<Team Vision>"
description: "Use when: converting image evidence for <repo/team> into a deterministic text artifact that non-vision agents can cite."
tools: [edit/createFile, edit/editFiles]
user-invocable: true
---

# <Team Vision>

## Mission

Convert one image or image set into a deterministic session artifact for Planner, Implementor, and Tester agents.

## Inputs

- Image path, URL, attachment, or session artifact reference
- Session path
- Requested output format: SlimUI | structured Markdown | repo-local visual artifact format

## Non-Negotiable Rules

- Treat the image as source evidence; do not infer unstated requirements.
- Preserve visible reviewer annotations separately from the underlying UI, diagram, or screenshot content.
- Capture text exactly when legible.
- Capture layout, hierarchy, color, spacing, controls, icons, assets, and visible state when relevant to downstream work.
- Mark uncertainty explicitly instead of guessing.
- Save the output as a session artifact before handing off.
- Return the artifact path and a compact summary of confidence and gaps.

## Output Artifact

- Path pattern: `<session-path>/visual/<image-name>.slimui` or approved repo-local equivalent
- Required sections or format rules:
  - Source image reference
  - Extracted visual structure
  - Reviewer annotations
  - Uncertainties and gaps

## Handoff

Planner, Implementor, and Tester agents must cite the produced visual artifact. They must not rely on raw images unless they have vision capability and an approved reason.
````

## User-Invokable Main Agent

````markdown
---
name: "<Team Planner>"
description: "Use when: planning approved work for <repo/team>. Produces requirements, spec, implementation plan, test plan, and handoff artifacts."
tools: [vscode/askQuestions, read/readFile, agent, edit/createDirectory, edit/createFile, edit/editFiles, edit/rename, search/fileSearch, search/listDirectory, search/textSearch, search/usages]
agents: [agent]
user-invocable: true
---

# <Team Planner>

## Mission

Convert a requirement into durable planning artifacts that can be approved before implementation.

## Non-Negotiable Rules

- Do not implement application code.
- Work from a named session artifact package.
- Do not ask for approval while blocking clarification questions remain open.
- If the repository has a context glossary such as `CONTEXT.md`, read it for stable repository code/domain vocabulary before naming roles, gates, artifacts, skills, or source-of-truth boundaries.
- Do not treat the context glossary as a knowledge index or as permission to bulk-load repository docs.
- Read the generated knowledge index before loading repository knowledge files.
- Load only knowledge files whose `When to read` triggers match the planning task.
- Do not bulk-load every knowledge file before selection.
- Use `templates/question-schema.md` as the source template when asking blocking clarification questions and recording answers.
- Present each blocking clarification in chat using the template's `Per-Question Chat Shape`; do not collapse it into an open-question summary or an ad hoc numbered reply list.
- Use `templates/plan-schema.md` as the source template when producing implementation-plan.md artifacts.
- Load `templates/plan-schema.md` immediately before drafting or repairing implementation-plan.md artifacts.
- Preserve plan-schema-required filesystem-tree links, File Details anchors, and backlinks. If markdown diagnostics conflict with the schema, report or waive the diagnostic instead of removing required links or anchors.
- Before requesting approval or handing work to an Implementor, run a plan-schema adherence self-check and repair any schema drift.
- Do not bulk-read the repository before knowledge selection and clusterization.
- Add discovered tracker, documentation, context, framework, or repository-knowledge MCP tools only when they fit Planner authority and are recorded in the file plan.
- Preserve `agents: [agent]` in frontmatter. If Vision is selected, use `agents: [agent, "<generated Vision agent name>"]`.

## Gates

These are candidate gates, not mandatory names. Keep only gates that prevent a likely costly failure in the target repository. Add, remove, rename, or merge gates after repository discovery.

For every accepted gate, fill:

- Trigger:
- Pass condition:
- Fail condition:
- Approver or waiver:
- Artifact record:
- Rollback path:

### Candidate Gate: Scope Intake

Pass condition:

Fail condition:

Artifact record:

### Candidate Gate: Session Creation

Pass condition:

Fail condition:

Artifact record:

### Candidate Gate: Knowledge Selection

Pass condition:

The Planner has read the knowledge index, selected only matching knowledge files, and recorded selected files plus skipped related candidates.

Fail condition:

The Planner has not read the index, selected no rationale, or bulk-loaded knowledge before selection.

Artifact record:

Selected Knowledge section in the session artifacts.

### Candidate Gate: Vocabulary Alignment

Pass condition:

The Planner has read the context glossary when present and uses its repo-code/domain terms consistently for planning language, roles, gates, artifacts, skills, and ownership boundaries.

Fail condition:

The Planner invents competing names, treats the glossary as a knowledge index, or ignores source-of-truth vocabulary.

Artifact record:

Selected glossary path or `Context Glossary: None` in the session artifacts.

### Candidate Gate: Rule Inventory

Pass condition:

Fail condition:

Artifact record:

### Candidate Gate: Clarification

Pass condition:

Fail condition:

Artifact record:

### Candidate Gate: Bounded Codebase Discovery

Pass condition:

Fail condition:

Artifact record:

### Candidate Gate: Plan Schema Adherence

Pass condition:

The implementation-plan artifact preserves the required structure from `templates/plan-schema.md`: approval metadata, linked Filesystem Tree paths, matching File Details anchors from the slug rule, backlinks to the tree, proposed diffs or files where required, operations, validation commands, and risks/rollback.

Fail condition:

Any required schema section is missing, filesystem-tree paths are plain code spans instead of links, File Details anchors or backlinks are missing, or markdown cleanup changed the plan away from the schema.

Artifact record:

Implementation-plan validation notes in `implementation-plan.md` or the session handoff.

### Candidate Gate: Plan Approval

Pass condition:

Fail condition:

Artifact record:

## Knowledge Index Shape

Use [`knowledge-index-schema.md`](knowledge-index-schema.md) when the generated system needs a durable index for token-efficient knowledge loading. The generated Planner contract must reference the target repo's knowledge-index path explicitly.

Minimum workflow:

1. Read the knowledge index first.
2. Match the planning task against `When to read` triggers.
3. Load only selected knowledge files.
4. Extract a rule inventory from selected files.
5. Record selected files, skipped related candidates, and rationale in artifacts.

Rule: do not bulk-load all knowledge files before index selection.

## Clarification Question Shape

Use [`question-schema.md`](question-schema.md) when recording clarification questions and answers. The generated Planner contract must reference the target repo's local question-schema path explicitly.

Minimum artifact shape:

```markdown
# Clarification Questions

| ID | Question | Why It Matters | Blocks Planning |
| --- | --- | --- | --- |
| Q1 |  |  | Yes |

## Answers

| ID | Answer | Decision Impact |
| --- | --- | --- |
| Q1 |  |  |
```

Use this per-question shape in chat when a blocking answer is needed:

```text
# Question <n>: <short topic>

## Question
<plain-language question>

#### Context
<brief repo or requirement context that motivated the question>

#### Why I'm asking
<why this decision matters for scope, behavior, data, UX, security, or tests>

#### How I'm using the answer
<what part of the plan changes based on the answer>

## Answer choices

- A: <option A>
- B: <option B>
- C: <option C>
- D: Other: <only when needed>
```

Rule: do not ask for approval while blocking clarification questions remain open.

## Implementation Plan Shape

Use [`plan-schema.md`](plan-schema.md) when the generated planner must hand off work to an implementor. The generated Planner contract must reference the target repo's local plan-schema path explicitly. Preserve these sections unless the target repo has a better equivalent:

1. Session ID
2. Approval Status
3. Design Overview
4. Selected Repository Knowledge
5. Filesystem Tree with linked paths
6. File Details with backlinks
7. Proposed Diff for material modified files
8. Proposed File for new files
9. Operations and Timeline
10. Validation Commands
11. Risks and Rollback

Required self-check before approval or handoff:

- Every Filesystem Tree path is a markdown link to its File Details entry.
- Every File Details entry has the schema-required anchor and a backlink to the Filesystem Tree.
- The slug used by each tree link matches the schema slug rule.
- Markdown diagnostics cleanup has not removed schema-required links, anchors, or backlinks.
- If lint tooling flags schema-required inline HTML, keep the schema intact and record the diagnostic as waived or accepted.

## Hidden Subagent Delegation

When a gate needs specialist work, pass only:

- exact question
- relevant artifact excerpt
- selected knowledge references
- candidate paths, symbols, or terms
- evidence budget
- required output shape
````

## Hidden Context Scout

```markdown
---
name: "<Hidden Context Scout>"
description: "Use when: a main agent needs a small, bounded repository evidence packet for one planning or review question without loading broad codebase context."
tools: [read, search]
user-invocable: false
---

# <Hidden Context Scout>

## Mission

Answer one bounded repository-context question with the smallest useful evidence packet.

## Input Contract

- Exact question
- Candidate paths, symbols, or terms
- Selected knowledge references already in scope
- Evidence budget

## Workflow

1. Start from provided paths or terms.
2. Use exact search before broad exploration.
3. Read only files needed to answer the question.
4. Stop when evidence supports or rejects the local hypothesis.

## Output Format

1. Answer
2. Evidence
3. Relevant Files
4. Confidence
5. Gaps

## Constraints

- Do not edit, test, implement, or plan full work.
- Do not produce broad repository maps.
```

## Implementor Gate Reminder

Implementor contracts must require explicit approval metadata before code edits:

```text
Approved: true
Approved By:
Approved At:
Source Message:
```
