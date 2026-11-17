---
---

# Knowledge Index

Select the smallest set of documents a task needs. Read the catalog intent for each id and open only the documents whose trigger matches.

## Entries

| ID | Path | Tier | When to read | Do not read when |
| --- | --- | --- | --- | --- |
| 1 | `knowledge/access-control.md` | MustHave | Any permission-gated design, role statement translation, role or permission assignment change, read/write/manage policy, or seed and effective-permission diagnosis | Never skipped |
| 2 | `knowledge/base-ui-composition-checklist.md` | PerComponent | Creating or editing a Base UI wrapper, or a navigation or action control built on one | No Base UI wrapper or navigation control is touched |
| 3 | `knowledge/customers_domain.md` | PerContext | Changing customer pages, customer status, or the customer-to-ticket link | No customer behaviour changes |
| 4 | `knowledge/dashboard-forms-best-practices.md` | PerComponent | Creating or refactoring interactive dashboard forms, URL-driven filter forms, or fields submitting a server action | The task has no form or form mutation |
| 5 | `knowledge/dashboard-navigation-boundaries.md` | PerContext | Adding or changing breadcrumbs, sidebar groups or links, navigation visibility or active state, or dashboard route structure | Navigation, breadcrumbs and route structure are untouched |
| 6 | `knowledge/dashboard-section-permission-flow-checklist.md` | PerContext | Adding an entity that needs independent privileges or a new `ACCESS_SECTIONS` boundary, and wiring its routes or navigation | The change stays inside an existing section's keys |
| 7 | `knowledge/nextjs-cache-components-pattern.md` | PerContext | Adding or refactoring pages, Server Action invalidation, or instant-navigation behaviour involving caching or Suspense | No cache, invalidation, skeleton or Suspense change is in scope |
| 8 | `knowledge/nextjs-server-execution-checklist.md` | PerContext | Adding or changing app router pages, layouts, server actions, form submit wiring, or session and permission checks | The task is non-app-router code or docs only |
| 9 | `knowledge/shared-component-reuse-checklist.md` | PerComponent | Creating any new UI component in pages, navigation or app chrome | No UI component work is planned |
| 10 | `knowledge/testing-flow-checklist.md` | PerContext | Planning, creating, changing or running tests or validation | No test or validation implication |
| 11 | `knowledge/ticket_workflow.md` | PerContext | Changing ticket creation, reference data, status, priority, technician, notes or the activity log | No ticket behaviour changes |

## Selection

1. Restate the task in one sentence.
2. Match its terms and risk against the triggers above.
3. Read only the matching documents, and re-evaluate `PerContext` and `PerComponent` entries as the task evolves.
4. If none matches, record `Selected Knowledge: None` and continue with bounded discovery.
5. When a selected document conflicts with stronger evidence, record the conflict instead of loading more documents.

## Artifact Record

```markdown
## Selected Knowledge

| ID | Path | Why Selected | Rules Extracted | Skipped Related Knowledge |
| --- | --- | --- | --- | --- |
```
