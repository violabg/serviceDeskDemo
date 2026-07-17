# Testing Matrix

| Scenario Type | Preferred Test | Notes |
| --- | --- | --- |
| Pure business rule | Vitest unit test | Assert inputs, outputs, errors, and state transitions. |
| Server action | Vitest unit or integration-style unit test | Mock auth and persistence at stable boundaries. |
| Route handler | Vitest request/response test | Assert status, body, validation, and auth behavior. |
| React component | React Testing Library | Assert accessible roles, labels, user events, and visible outcomes. |
| Form validation | React Testing Library plus schema/unit tests | Cover required fields, invalid values, and submission state. |
| Prisma mapping | Unit test around mapper/service | Avoid hitting a real database unless the project convention requires it. |
| Auth behavior | Unit or component test with mocked identity | Cover unauthenticated, unauthorized, and authorized paths. |
| Regression | Focused test reproducing the bug | Prove failure before fix when possible. |