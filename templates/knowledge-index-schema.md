# Knowledge Index Schema

Use this schema for generated agentic systems that need repository knowledge without wasting context. The generated Planner must read the knowledge index before loading knowledge files.

````markdown
# Knowledge Index

## Purpose

Help planning agents choose the smallest useful knowledge set for a task.

## Token Budget Rule

- Read this index before loading knowledge files.
- Do not bulk-load all knowledge files.
- Load only files whose `When to read` triggers match the current task.
- Prefer the smallest set that can constrain requirements, plan scope, validation, and handoff.
- Record selected files and skipped candidates in the planning artifacts.

## Knowledge Entries

| ID | Path | Topic | When to read | Do not read when | Key rules to extract |
| --- | --- | --- | --- | --- | --- |
| K1 | `<path>` | `<topic>` | `<task trigger, domain term, route, risk, or artifact need>` | `<irrelevant scope>` | `<must/do not/prefer/avoid rules>` |

## Selection Workflow

1. Restate the planning task in one sentence.
2. Match task terms, domain area, workflow risk, and expected artifacts against `When to read` triggers.
3. Select only matching knowledge entries.
4. Read selected files and extract a rule inventory.
5. If no entry matches, record `Selected Knowledge: None` and continue with bounded codebase discovery.
6. If a likely entry is stale or conflicts with stronger evidence, record the conflict instead of loading more files blindly.

## Artifact Record

```markdown
## Selected Knowledge

| ID | Path | Why Selected | Rules Extracted | Skipped Related Knowledge |
| --- | --- | --- | --- | --- |
| K1 | `<path>` |  |  |  |
```
````

Adaptation rule: keep the purpose, token budget rule, knowledge entries, selection workflow, and artifact record. Modify fields only to fit real repository knowledge files, domains, and workflow risks.