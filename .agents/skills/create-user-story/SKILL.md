---
name: create-user-story
description: "Use when: creating a new user story from scratch. Runs a grill-with-docs session to sharpen the idea, then synthesises it into a spec and breaks it into tickets. Non-repo mode — no codebase exploration required."
argument-hint: "Describe the feature idea or user need in a sentence"
user-invocable: true
disable-model-invocation: true
---

# Create User Story

Use this skill to turn a rough feature idea into a groomed, ticketed user story.

This is a **non-repo workflow**. Do not explore the application codebase unless the user explicitly asks. Focus on the idea, the actor, the benefit, and the acceptance criteria.

## Process

### Step 1 — Grill

Run `/grill-with-docs` on the idea. The goal is to surface:

- Who is the actor?
- What is the desired outcome?
- What problem does it solve?
- What are the edge cases and failure modes?
- What are the acceptance criteria?

Ask one question at a time. Provide your recommended answer for each. Wait for the user's response before continuing. Do not proceed to Step 2 until you have reached a shared understanding with the user.

### Step 2 — Spec

Run `/to-spec` on the grilled understanding. Synthesise everything discussed into a structured spec. Do NOT re-interview — just produce the document.

### Step 3 — Tickets

Run `/to-tickets` on the approved spec. Break the work into tracer-bullet vertical slices with explicit blocking edges. Quiz the user on granularity before publishing.

## Constraints

- No codebase exploration unless the user asks.
- No implementation decisions unless the user explicitly brings in a technical context.
- Stay in the service desk domain vocabulary when working inside this project.
