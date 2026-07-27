---
name: integration-test-knowledge-checklist
description: "Use when: generating project-specific integration-test knowledge."
disable-model-invocation: true
---

# Integration Test Knowledge Checklist

# Integration Test Knowledge Checklist for Integration Tester

Use this checklist to generate a project-specific integration-test knowledge for Integration Tester.

## Scope

- The knowledge states exactly which test family it covers.
- The knowledge states what is out of scope.
- The knowledge explains the real integration boundary.
- The knowledge explains which dependencies remain real and which are mocked or stuffed.

## Targeting And Metadata

- The frontmatter contains title, description, keywords, authority, and intent.
- The intent makes it clear when the agent must load the knowledge.
- The authority level divided in:
  - `MustHave`: fundamental and mandatory knowledge that agents must always adhere to.
  - `PerComponent`: specific knowledge of project components or modules.
  - `PerContext`: contextual knowledge that may vary based on the specific situation or task.
- The keywords are specific enough to let the agent associate the knowledge with the right task.

Example snippet:

<!-- CANONICAL-TEMPLATE-SLOT: TEST_STACK_CONVENTIONS START -->
```yaml
---
title: Orders API Integration Test Knowledge
description: Rules and templates for integration tests covering the Orders API.
keywords:
  - integration test
  - api testing
  - orders
  - test host
  - seeding
authority: MustHave
intent: When an agent needs to create, modify, or debug integration tests for the Orders API.
---
```
<!-- CANONICAL-TEMPLATE-SLOT: TEST_STACK_CONVENTIONS END -->

## Project Test Stack

- The knowledge names the test framework.
- The knowledge names the assertion library.
- The knowledge names the mocking library.
- The knowledge names the standard test-host builder, factory, or fixture.
- The knowledge documents the baseline setup chain the agent should prefer.

## Flow Reconstruction

- The knowledge explains where the agent must start to reconstruct the flow under test.
- The knowledge defines the source of truth for route, verb, payload, or message contract.
- The knowledge defines the source of truth for setup prerequisites.
- The knowledge explains what to do if those source artifacts are missing or outdated.

## Setup Discovery

- The knowledge explains how the agent identifies required setup data.
- The knowledge distinguishes business data from setup data.
- The knowledge covers access, visibility, tenant, or identity prerequisites when relevant.
- The knowledge covers relation or join prerequisites when relevant.
- The knowledge covers side-effect prerequisites when relevant.
- The knowledge documents any topology, multi-tenant, workflow, or context-isolation rules.

## Seeding Rules

- The knowledge defines the preferred seeding order.
- The knowledge explains whether official helpers are mandatory.
- The knowledge explains what must never be created inline.
- The knowledge points to the actual helper locations.
- The knowledge explains how to build deterministic negative scenarios.
- The knowledge warns against wildcard or over-broad seed data when relevant.

## Test Structure

- The knowledge defines the expected test-file organization.
- The knowledge defines class and method naming conventions.
- The knowledge explains whether fixture usage is required.
- The knowledge explains whether serialized execution is required.
- The knowledge includes at least one minimal structural template.
- The knowledge documents the scenario container pattern if the project uses one.

## Mocking Policy

- The knowledge states which dependencies must always be mocked.
- The knowledge states which dependencies should remain real.
- The knowledge explains how mocks are registered in the test container.
- The knowledge explains how shared or static mock state is reset.
- The knowledge explains how side effects against mocked dependencies are verified.

## Assertion Strategy

- The knowledge separates transport or invocation assertions from business assertions.
- The knowledge defines how persistence must be verified.
- The knowledge defines how side effects must be verified.
- The knowledge requires a baseline reachability check when the project needs it.
- The knowledge explains whether final assertions must use fresh runtime state.

## Failure Interpretation

- The knowledge lists the important negative scenario categories.
- The knowledge documents the expected outcomes for those categories.
- The knowledge documents failure signatures that usually indicate setup mistakes.
- The knowledge helps the agent avoid changing production code when the issue is really in test setup.

## Hard Constraints

- The knowledge contains explicit do-not-do rules.
- The knowledge contains explicit always-use rules.
- The knowledge contains project-specific anti-patterns.
- The wording is prescriptive, not vague.

## Completion Criteria

- The knowledge contains enough detail for the agent to build a new test, not just understand an existing one.
- The knowledge contains enough detail for the agent to debug an existing failing test.
- The knowledge contains project-specific instructions rather than generic testing advice.
- The knowledge contains at least one template or copy-and-adapt code shape.
- The knowledge contains a final green-flag checklist or equivalent completion gate.

## Recommended Split Decision

Create a second companion knowledge if one file is becoming too broad because it mixes:

- framework explanation and deep project context
- hard constraints and strict templates
- different integration-test families with different entrypoints or setup models

A good split is usually:

- one descriptive knowledge for workflow, utilities, discovery, and validation
- one prescriptive knowledge for constraints, templates, anti-patterns, and checklists
