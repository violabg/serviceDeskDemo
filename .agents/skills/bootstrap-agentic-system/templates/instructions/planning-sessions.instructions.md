---
applyTo: "{{SESSION_ROOT}}/**"
---

# Planning Session Rules

- External Issue ID identifies the tracker ticket and matches `{{WORK_ITEM_ID_FORMAT}}`. Planning Session ID identifies the session folder. Never use one in place of the other.
- Create or resume the current `{{SESSION_ROOT}}/<planning-session-id>/` folder before artifact intake, clarification, or plan drafting. Resume directly from the known Planning Session ID; never scan or enumerate other session folders.
- Work only inside the current `{{SESSION_ROOT}}/<planning-session-id>/` folder.
- Store session identity, tracker evidence, dependency evidence, decisions, gate evidence, and derived planning artifacts in that folder as they are produced. The implementation plan is not the only required artifact.
- Preserve separate sanitized session-state files when the workflow needs them: `session-memory.md` for durable summaries, `session-log.md` for chronological event entries, and `execution-report.md` for implementation or validation progress snapshots.
- `agent_session_state.yaml` has no direct public read or write contract in the current upstream workflow. Treat its semantics as part of session activation or resume, not as a standalone generated file, unless a future upstream tool makes it explicit.
- Retrieve the current issue only. Read a referenced issue only when the current issue explicitly references it and the reference changes the plan, then record it as dependency evidence.
- Follow `{{PLAN_SCHEMA_PATH}}` for implementation plans and `{{ARTIFACT_GATES_PATH}}` for artifact and gate evidence. Blocking clarifications use the per-question format defined by the planner agent.
- Ask a blocking clarification only when evidence leaves a material planning decision unresolved. Otherwise complete the required gates and artifacts uninterrupted.
