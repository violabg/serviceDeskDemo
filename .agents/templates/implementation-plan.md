# Implementation Plan Supplement

Use `templates/plan-schema.md` as the canonical source when producing `implementation-plan.md`.

This file exists only for repo-specific additions that are not owned by the shared schema.

## Repo-Specific Additions

Apply these additions on top of `templates/plan-schema.md`:

- In `Session ID`, also record `Created At`.
- In `Approval Status`, also record `Approval Ready` and `Source Message`.
- After `Selected Repository Knowledge`, include an `Applicable Rule Inventory` table:

| Rule ID | Source | Rule | Why It Applies |
| --- | --- | --- | --- |

- Before the Filesystem Tree or immediately after knowledge sections, include a `Codebase Clusters` table:

| Cluster | Candidate Paths | Planning Question | Why It Is In Scope |
| --- | --- | --- | --- |

- After file planning details, include a `Knowledge Alignment Review` table:

| Rule ID | Planned File or Section | Satisfied By | Notes |
| --- | --- | --- | --- |

- Include a `Coverage Scenarios` table for focused validation planning:

| Scenario | Validation Surface | Planned Check |
| --- | --- | --- |

## Usage Rule

- Do not restate the shared schema here.
- Read this file after `templates/plan-schema.md`.
- If this file conflicts with the shared schema, the shared schema wins unless the repo contract in `.github/agents/DemoPlanner.agent.md` explicitly says otherwise.
