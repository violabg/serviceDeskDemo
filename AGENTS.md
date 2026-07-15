# Enterprise Agentic Demo Shared Contract

This file defines the shared behavior for agents and skills in this demo pack.

## Scope

Work only inside the target application workspace and the current session artifact folder. Do not modify files in the original MoltiAgent folders unless the user explicitly asks for that in a separate task.

## Language

All demo agents, skills, artifacts, and user-facing outputs use English.

## Workflow Principles

- Work artifact-first: preserve analysis, questions, spec, plan, test plan, review notes, and changed files as explicit artifacts.
- Keep roles separated: planner plans, implementor implements, tester tests, reviewer reviews.
- Do not implement before an implementation plan exists and is explicitly approved.
- Ask focused clarification questions only when the answer can change the plan.
- Prefer bounded discovery over broad repository exploration.
- Load only the skills relevant to the current stage.
- Keep GitHub issue input optional; the sample markdown story must be enough for an offline demo.

## Standard Artifact Names

- `session-brief.md`
- `requirements-analysis.md`
- `clarification-questions.md`
- `spec.md`
- `task-breakdown.md`
- `implementation-plan.md`
- `test-plan.md`
- `review-report.md`
- `changed-files.md`

## Visual Artifacts

Use native model vision capability first when the active model supports images. Delegate to `Demo Vision UI` only when the model is text-only or image inspection is unavailable.

## Service Desk Domain Boundary

The demo domain includes dashboard, tickets, clients, technicians, assets, reports, and administration. Keep examples grounded in IT service desk work instead of generic CRUD language.

always use caveman skill