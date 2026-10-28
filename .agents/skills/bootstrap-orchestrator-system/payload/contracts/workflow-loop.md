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
- A FAST_IMPLEMENTATION job without `designId` creates a job design whose id is the job id, as a DESIGN job does: it holds the obligations of step 3 (the requirement of the flow), the open points and the knowledge references. It has no approval gate.
- DOCUMENTATION jobs have no design (`designId: null`); every `#capability:design-*` operation on them is refused.
- Activating an existing job resumes it; asking for a different workflow type on an existing job is refused.

Response: `Agent job created;\nJobId: <jobId>\nDesignId: <designId given, or <none>>`, or `Agent job resumed; ...` with the current instruction.

## step-serving

`workflow-step-pending` — arguments `sessionId`, `jobId`, optional `part`. Serve the current instruction; on a new job this is instruction 1. Calling it again re-serves the same instruction, and `part` selects which part of it (see Parts).

`workflow-step-next` — arguments `sessionId`, `jobId`. Advance `currentStep` by one and serve part 1 of that instruction. After the last instruction it is refused: the final instruction says the workflow is complete and the orchestrator stays with the developer.

The served text is:

```text
Instruction <N>/<M>.
<the content of workflows/<step>.md>

---

## ACTIVE USER INSTRUCTION REGISTER

<the content of the session artifact user_instruction_register_<jobId>>
```

The register section is appended from instruction 2 on, in every workflow. When the artifact does not exist, the section says so instead of being silently dropped.

**Parts.** A shell host caps the output it shows of one command (about 30,000 characters in Claude Code) and spills the rest to a file the agent then slices by hand. So an answer longer than 24,000 characters (Lab-authored: `PART_LIMIT` in `runtime/lib/util.mjs`) is served in parts, by `workflow-step-next`/`workflow-step-pending`, `#capability:knowledge-read`, `#capability:design-snapshot` and `#capability:design-verification-view`. Each part starts at a unit of that answer: a paragraph of an instruction, a knowledge document, a snapshot item, an obligation or an operation of the view. A unit longer than the limit is a part of its own and is never cut. Part 1 is the answer's own text followed by:

```text
[part 1 of <M>. The answer continues: <the call that returns part 2> Run it as a shell command of its own, with nothing chained before or after it and no pipe. Read every part before acting on any of it.]
```

A later part opens with `[part <k> of <M>]` and the last part ends with `[part <M> of <M>: end of the answer.]`. The optional argument `part` selects a part (a whole number, default 1) or `all` for the whole answer; any other value is refused with the valid range. Parts are computed from the same state, so asking again returns the same part. An answer that fits is returned unchanged, with no marker. One runtime operation runs per shell command: calls joined with `;`, `&&` or a loop exceed the host cap again, and an answer piped through `head`, `tail`, `cut`, `sed` or `dd` is cut (Lab-authored: verifiers that looped over parts and sliced the spilled file judged a different fragment of the design in each round). The rest of an instruction always comes from `workflow-step-pending`, which never advances the workflow.

The CLI takes every value after a flag up to the next flag, and a repeated flag adds to the earlier values: `--fileIds 6 11`, `--fileIds 6 --fileIds 11` and `--fileIds 6,11` are the same call. `--json` takes exactly one value.

**Arguments.** Only the design operations that write or act on the design take `{ "sessionId", "jobId", "request": { ... } }`: `design-obligations`, `design-open-points`, `design-file-references`, `design-decisions`, `design-overview`, `design-submit`, `design-approve`, `design-operation-status`, `design-iteration-open` and `design-iteration-close` (`REQUEST_TOKENS` in `runtime/lib/api.mjs`). Every other operation takes its arguments at the top level. When one of those is sent a `request` object anyway, its fields are read as top-level arguments, and a top-level value wins (Lab-authored: agents carry the design envelope over to every call). `node agentic-system.mjs <token> --help` prints the token's argument shape and its definition from these contracts.

**Halt points.** An instruction may end at an explicit halt (a review awaiting approval, an interview question, a required decision). At a halt the orchestrator presents what the instruction requires and stops; it calls `#capability:workflow-step-next` only after the developer answers. Everywhere else it keeps executing until the step's work is done.
