# Sample User Story: Ticket Intake With Asset Link

## Story

As a help desk operator, I want to create a new support ticket for a client and optionally link it to one of the client's assets, so that technicians can start troubleshooting with the correct context.

## Current Notes

- The operator selects a client before entering ticket details.
- The asset field is optional.
- The ticket should start in `New` status.
- Priority can be `Low`, `Medium`, `High`, or `Critical`.
- The ticket must have a title and description.
- The operator should see validation errors before submission.

## Acceptance Criteria

- A ticket can be created with title, description, client, optional asset, and priority.
- The asset selector only shows assets that belong to the selected client.
- The ticket is created with status `New`.
- The ticket creation screen shows a success confirmation after creation.
- Invalid submissions do not create tickets.

## Open Context

- Authentication and role rules are not specified.
- SLA behavior is not specified.
- Duplicate ticket handling is not specified.
- The post-create navigation behavior is not specified.