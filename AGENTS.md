# Agentic System Entry

Use this file as root navigation for repository-local agent workflow. Keep prompt handling narrow. Load only files needed for current request.

## Primary Entrypoints

- Planning: `.github/agents/demo-planner.agent.md`
- Implementation: `.github/agents/demo-implementor.agent.md`
- Integration testing: `.github/agents/demo-integration-tester.agent.md`
- Knowledge building: `.github/agents/demo-knowledge-builder.agent.md`
- Vision: `.github/agents/demo-vision.agent.md`
- Q&A: `.github/agents/demo-ask.agent.md`

## Core References

- Context glossary: `CONTEXT.md`
- Knowledge index: `docs/agents/knowledge/README.md`
- Implementation plan schema: `docs/agents/templates/plan-schema.md`
- Clarification question schema: `docs/agents/templates/question-schema.md`
- Artifact gates: `docs/agents/templates/artifact-gates.md`
- Tracker contract: `docs/agents/issue-tracker.md`
- Manifest: `docs/agents/agentic-system-manifest.md`
- Bootstrap changelog snapshot: `docs/agents/skill-changelogs/bootstrap-agentic-system.CHANGELOG.md`
- Skill directory: `.github/skills/`
- Session rules: `sessions/README.md`

## Routing Rules

- For planning requests, load `.github/agents/demo-planner.agent.md` first, then load `docs/agents/knowledge/README.md`, then only task-matched knowledge files.
- For implementation requests, require approved implementation-plan metadata first. Use `.github/agents/demo-implementor.agent.md` plus only plan-relevant knowledge.
- For integration-test-only requests, use `.github/agents/demo-integration-tester.agent.md`.
- For repository knowledge creation or refinement, use `.github/agents/demo-knowledge-builder.agent.md`.
- For screenshot, mockup, browser capture, diagram, or Figma-derived screenshot analysis, use `.github/agents/demo-vision.agent.md` and treat its SlimUI artifact as reusable visual contract.
- For project-specific or general programming Q&A without code changes, use `.github/agents/demo-ask.agent.md`.
- When request depends on terminology, source-of-truth boundaries, or role naming, load `CONTEXT.md`.
- When request depends on library, framework, SDK, or API behavior, Planner, Ask, and Knowledge Builder may use approved Context7 MCP tools.

## Session And Approval Rules

- Use local session artifacts under `sessions/<session-id>/`.
- For GitHub-driven workflows, GitHub issue number is canonical session ID.
- For offline workflows, ask user to provide or confirm session ID before durable planning artifacts are created.
- Do not implement code before artifact approval metadata is recorded in implementation-plan artifact.

## Validation Expectations

- Planner must reference `docs/agents/templates/plan-schema.md` and `docs/agents/templates/question-schema.md` explicitly.
- Implementor must validate touched behavior after first substantive edit.
- Generated agents must use `docs/agents/knowledge/README.md` as index-first knowledge routing file, not bulk-load all repo knowledge.
