# Context Glossary

This glossary captures stable repository code and domain vocabulary. It is not a knowledge index.

## Domain Terms

### Customer

The canonical domain term for the party served by the service desk workflow.

Terms to avoid for this concept: `Client`, `Clients`.

Accepted alias: `Clients` only when referring to existing UI or module wording that has not yet been renamed or explicitly redefined.

### User

The authenticated or local application user who signs in, receives roles, and gains effective permissions.

Do not use `User` as a synonym for `Customer`.

### Account

An identity or account-level record associated with authentication or ownership boundaries.

Do not use `Account` as a synonym for `Customer` or `User`.

### Role

A named permission bundle assigned to users through the application access-control workflow.

### Permission

A code-defined capability such as `tickets:read`, `tickets:write`, or `tickets:manage`.

Permissions are created from code and seed flows, not free-form UI input.

### Access Management

The workflow and UI surface for assigning roles and permissions to users.

### Dashboard

The authenticated application shell and grouped route area for service-desk operations.

### Tickets

The service-desk work-item module for list, creation, detail, and related lifecycle actions.

## Source-Of-Truth Boundaries

- `docs/agents/knowledge/README.md` is the knowledge index.
- `docs/agents/governance.md` is the durable workflow policy source.
- `docs/agents/issue-tracker.md` defines the GitHub issue workflow contract.
- `docs/agents/access-control.md` defines permission and access-control workflow rules.

## Agentic System Terms

### Session ID

The identifier for the local session package under `sessions/<session-id>/`. For GitHub-driven work, this is the GitHub issue number.

### Approval Metadata

The explicit artifact fields required before implementation can begin: `Approved`, `Approved By`, `Approved At`, and `Source Message`.

### Handoff Envelope

The minimum cross-agent handoff contract containing session, gate, approval state, required artifacts, open questions, blocking risks, and next-agent definition of done.

### Vision Artifact

A deterministic text artifact derived from screenshots, mockups, diagrams, or QA images so non-vision agents can cite stable evidence.
