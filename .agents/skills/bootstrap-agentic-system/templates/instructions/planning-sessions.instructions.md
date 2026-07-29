---
applyTo: "{{SESSION_ROOT}}/**"
---

# Planning Session Rules

- External Issue ID identifies the tracker ticket and matches `{{WORK_ITEM_ID_FORMAT}}`. Planning Session ID identifies the session folder. Never use one in place of the other.
- Work only inside the current `{{SESSION_ROOT}}/<planning-session-id>/` folder. Resume directly from the known Planning Session ID; never scan or enumerate other session folders.
- Store session identity, tracker evidence, dependency evidence, decisions, and gate evidence as artifacts in that folder.
- Retrieve the current issue only. Read a referenced issue only when the current issue explicitly references it and the reference changes the plan, then record it as dependency evidence.
- Follow `{{PLAN_SCHEMA_PATH}}` for implementation plans and `{{ARTIFACT_GATES_PATH}}` for artifact and gate evidence. Blocking clarifications use the per-question format defined by the planner agent.
- Ask a blocking clarification only when evidence leaves a material planning decision unresolved. Otherwise complete the required gates and artifacts uninterrupted.
