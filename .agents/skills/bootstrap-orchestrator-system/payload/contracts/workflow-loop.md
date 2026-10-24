# Workflow loop

Lab-authored contract, derived from the captured workflow tools. The runtime implements it in `runtime/lib/workflow.mjs`.

The orchestrator does not know the workflow. The runtime serves it one instruction at a time, and the instruction text names the tools that step may use. The loop is the only clock: the orchestrator never reads the instruction files directly and never sees a future step, so it states every deferred effect as a condition ("when a step asks to interview the developer"), never as "at step N".

## workflow-types

`workflow-types-list` — no arguments. Read `{{RUNTIME_ROOT}}/workflows/workflow-types.yaml` and answer:

```text
Available workflow types:
- DESIGN: Design. Design complex requirements with a human in the middle decision judgement.
- DOCUMENTATION: ...
- FAST_IMPLEMENTATION: ...
```

The developer always chooses the workflow type explicitly; the orchestrator never infers it.

## job-activate

`workflow-job-activate` — arguments `sessionId`, `jobId`, `workflowType`, optional `agentName` and `designId`.

Write `sessions/<sessionId>/jobs/<jobId>.json`:

```json
{ "jobId": "...", "sessionId": "...", "agentName": "orchestrator", "workflowType": "DESIGN",
  "designId": "...", "steps": ["shared/01-user-instruction-space", "design/02-image-intake", "..."],
  "currentStep": 0, "delegates": {}, "createdAt": "..." }
```

- `steps` is the ordered list of the type in `workflow-types.yaml`, frozen into the job.
- A DESIGN job without `designId` creates a new design whose id is the job id. A job with `designId` reuses that existing design, approval included: follow-up work continues on the same design.
- FAST_IMPLEMENTATION and DOCUMENTATION jobs have no design (`designId: null`); every `#capability:design-*` operation on them is refused.
- Activating an existing job resumes it; asking for a different workflow type on an existing job is refused.

Response: `Agent job created;\nJobId: <jobId>\nDesignId: <designId given, or <none>>`, or `Agent job resumed; ...` with the current instruction.

## step-serving

`workflow-step-pending` — arguments `sessionId`, `jobId`. Serve the current instruction; on a new job this is instruction 1. Calling it again re-serves the same instruction.

`workflow-step-next` — arguments `sessionId`, `jobId`. Advance `currentStep` by one and serve that instruction. After the last instruction it is refused: the final instruction says the workflow is complete and the orchestrator stays with the developer.

The served text is:

```text
Instruction <N>/<M>.
<the content of workflows/<step>.md>

---

## ACTIVE USER INSTRUCTION REGISTER

<the content of the session artifact user_instruction_register_<jobId>>
```

The register section is appended from instruction 2 on, in every workflow. When the artifact does not exist, the section says so instead of being silently dropped.

**Halt points.** An instruction may end at an explicit halt (a review awaiting approval, an interview question, a required decision). At a halt the orchestrator presents what the instruction requires and stops; it calls `#capability:workflow-step-next` only after the developer answers. Everywhere else it keeps executing until the step's work is done.
