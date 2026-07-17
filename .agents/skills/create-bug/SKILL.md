---
name: create-bug
description: "Use when: filing a new bug report. Runs a grill-with-docs session to sharpen the reproduction case, then synthesises it into a structured bug spec and breaks it into fix tickets. Non-repo mode — no codebase exploration required."
argument-hint: "Describe the unexpected behaviour in a sentence"
user-invocable: true
disable-model-invocation: true
---

# Create Bug

Use this skill to turn a vague bug report into a groomed, ticketed defect.

This is a **non-repo workflow**. Do not explore the application codebase unless the user explicitly asks. Focus on the symptom, the reproduction path, the expected vs actual behaviour, and the impact.

## Process

### Step 1 — Grill

Run `/grill-with-docs` on the bug description. The goal is to surface:

- What is the observed (actual) behaviour?
- What is the expected behaviour?
- What are the exact reproduction steps?
- What is the environment (browser, role, data state)?
- What is the impact / severity?
- Is there a workaround?
- Are there related tickets or known regressions?

Ask one question at a time. Provide your recommended answer for each. Wait for the user's response before continuing. Do not proceed to Step 2 until you have a clear, reproducible description.

### Step 2 — Spec

Run `/to-spec` on the grilled understanding. Synthesise everything discussed into a structured bug spec:

- **Problem Statement** — observed vs expected behaviour, reproduction steps, environment, severity.
- **Solution** — proposed fix direction (may be left open if unknown).
- **User Stories** — frame each as a defect user story: "As a <actor>, I should NOT see <bad behaviour>, so that <reason>."
- **Testing Decisions** — regression test anchors.

Do NOT re-interview — just produce the document.

### Step 3 — Tickets

Run `/to-tickets` on the approved spec. Break the fix into tracer-bullet slices (investigation, fix, regression test, release note if needed). Quiz the user on granularity before publishing.

## Constraints

- No codebase exploration unless the user asks.
- Stay in the service desk domain vocabulary when working inside this project.
- Do not guess at root cause during the grill phase — focus on observable facts.
