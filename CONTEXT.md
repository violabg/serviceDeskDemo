# Repository Context Glossary

Use this file for stable repository code and domain vocabulary. Prefer one canonical term per concept.

## Rule

- Use the `Use` term when the concept matches.
- Avoid the `Avoid` terms when they mean the same concept.
- If a source artifact uses a different term intentionally, preserve the quoted source term and note the mapping instead of silently normalizing it.

## Ticket

- Definition: The core service desk work item in the application domain, stored in the Prisma `Ticket` model.
- Use: `Ticket`
- Avoid: `issue`, `request`, `case` when referring to the app data model
- Notes or boundary: Distinct from a GitHub issue, which is a planning or tracker artifact.

## User

- Definition: An authenticated application person stored in the Prisma `User` model and linked to roles, assigned tickets, created tickets, notes, and activities.
- Use: `User`
- Avoid: `member`, `operator`, `account holder` when they mean the same app concept
- Notes or boundary: Distinct from `Customer` unless a future approved domain document defines a mapping.

## Role

- Definition: The access-control grouping stored in the Prisma `Role` model and assigned to users.
- Use: `Role`
- Avoid: `group`, `persona`, `profile` when they mean the RBAC object
- Notes or boundary: A role grants permissions; it is not a user type shortcut.

## Permission

- Definition: A section and operation pair stored in the Prisma `Permission` model and granted through roles.
- Use: `Permission`
- Avoid: `capability`, `privilege`, `right` when they mean the same stored concept
- Notes or boundary: The canonical key shape is `${section}:${operation}`.

## Access Management

- Definition: The repository area and workflow that govern roles, permissions, and effective access.
- Use: `Access Management`
- Avoid: `auth`, `authorization`, `security settings` when they mean the same local workflow area
- Notes or boundary: Authentication is related but separate.

## Account

- Definition: A reserved business term in repository docs whose exact domain meaning is not yet fully defined in code.
- Use: `Account` only when the source artifact explicitly means `Account`
- Avoid: using `Account` as a synonym for `User`
- Notes or boundary: `Account` is also a `TicketCategory` enum value in the ticket domain. Do not assume that enum value defines a separate top-level data model.

## Customer

- Definition: The requester organization or person stored in the Prisma `Customer` model and linked to submitted tickets.
- Use: `Customer`
- Avoid: `User`, `requester`, `account` when they mean the stored app data model
- Notes or boundary: Distinct from `User`, which is the authenticated application person who signs in and may create, assign, or update tickets.

## Asset

- Definition: The tracked device or resource stored in the Prisma `Asset` model and optionally linked to a ticket.
- Use: `Asset`
- Avoid: `device`, `equipment`, `item` when they mean the same stored app concept
- Notes or boundary: A ticket may be created without an asset and marked for later asset linking.

## Ticket Note

- Definition: A comment or investigation update stored in the Prisma `TicketNote` model and authored by a `User`.
- Use: `Ticket Note`
- Avoid: `comment`, `message` when they mean the stored app concept
- Notes or boundary: Creating a ticket note also records a separate `Ticket Activity` entry.

## Ticket Activity

- Definition: The audit-log event stored in the Prisma `TicketActivity` model for ticket lifecycle changes.
- Use: `Ticket Activity`
- Avoid: `history entry`, `event`, `log` when they mean the stored app concept
- Notes or boundary: Activity types are constrained by the `ActivityType` enum and are written as mutation side effects.

## Session

- Definition: The local planning and handoff artifact package under `sessions/<issue-id>/`.
- Use: `Session`
- Avoid: `workspace`, `ticket folder`, `artifact bundle` when they mean the same current workflow concept
- Notes or boundary: Session state is local and gitignored.

## Approval Status

- Definition: The recorded implementation approval metadata stored in session artifacts.
- Use: `Approval Status`
- Avoid: `sign-off`, `go-ahead`, `approval note` when they mean the same artifact block
- Notes or boundary: Valid approval requires both explicit user approval and recorded metadata.

## Handoff Envelope

- Definition: The required metadata block that transfers state from one agent role to another.
- Use: `Handoff Envelope`
- Avoid: `summary`, `transition note`, `handoff summary` when they mean the same required contract
- Notes or boundary: The canonical field set lives in `templates/artifact-gates.md`.

## Agentic System Terms

## Knowledge Index

- Definition: The repo-local routing file that tells agents which knowledge files to read for a task.
- Use: `Knowledge Index`
- Avoid: `glossary`, `doc index` when they mean the same routing artifact
- Notes or boundary: This repo uses `docs/agents/knowledge/README.md` for that role.

## Selected Knowledge

- Definition: The explicit set of knowledge files chosen for the current planning or testing task.
- Use: `Selected Knowledge`
- Avoid: `background reading`, `full docs`, `all knowledge` when they mean the same step
- Notes or boundary: Record it in planning artifacts with skipped related candidates.

## Current Gate

- Definition: The active numbered workflow gate for the current role or handoff.
- Use: `Current Gate`
- Avoid: `phase`, `step`, `status` when they mean the formal gate label
- Notes or boundary: Use the `Gate <n>: <name>` format.

## Visual Contract

- Definition: The deterministic text artifact produced from screenshots, mockups, diagrams, or other images.
- Use: `Visual Contract`
- Avoid: `image summary`, `screenshot notes` when they mean the same durable artifact
- Notes or boundary: Non-vision agents should cite the artifact, not the raw image.
