# Expected Artifact: Task Breakdown

## Task 1: Ticket Creation Form

- Area: Frontend
- Goal: Provide a ticket intake form with client, optional asset, title, description, and priority.
- Dependencies: Task 2, Task 3

## Task 2: Ticket Creation Server Action

- Area: Backend
- Goal: Validate input and create a ticket with `New` status.
- Dependencies: Task 3

## Task 3: Client Asset Query

- Area: Data
- Goal: Return only assets owned by the selected client.

## Task 4: Ticket Creation Tests

- Area: Testing
- Goal: Cover validation, asset filtering, successful creation, and invalid submission behavior.