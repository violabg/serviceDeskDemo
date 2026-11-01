This is the **User Instruction Space**: the first step of every workflow. It exists so that the particular requests the developer makes in the first prompt are executed or evaluated and then stay binding for the rest of the workflow. It is served before any intake and before any documentation target is chosen.

The developer's first prompt is the user message that opens the work of this job: the message that carries the requirement or the documentation target, together with any additional request inside the same message. Only the developer's own words count: the text of a skill or command that started this workflow, and any prompt template it holds, is not a request.

---

## 1. What counts as a particular request

A request is **particular** when it does not change the system behaviour the requirement (R) asks you to implement and does not change the content the documentation target must produce. It belongs to this space when it concerns:

- **Process**: order of work, gates, checkpoints, subagents, tools, how the work is split.
- **Output form and style**: structure, phrasing, languages, formatting, level of detail.
- **Extra investigation or verification**: analyses, checks and evidence the developer wants in addition to the workflow's own.
- **Operating preferences**: conventions and constraints about how you work.
- **Procedures and gates the developer wants executed before or during the workflow**: a multi-phase procedure, a sequence of gates with halt points, a structured command that must be read as a whole document rather than as a single sentence.
- **Changes to how the workflow runs**: start from a specific point, add gates, skip steps (saltare i passi), or otherwise alter the default sequence.

A request that adds or changes a behaviour of the system remains part of the requirement and follows the ordinary workflow. This definition is the same in every workflow, so the same prompt is classified in the same way regardless of the workflow type. The particular requests and their effects stay in the register described below and never become part of the requirement.

Italian terms used for these effects: **procedura** = procedure, **saltare i passi** = skip steps, **effetti** = effects, **step successivi** = later steps.

---

## 2. Enumerate every request

Read the first prompt and enumerate **all** its particular requests, not only a part of them.

1. Create the session artifact `user_instruction_register_<jobId>` with `#capability:session-artifact-write`, where `<jobId>` is the current job id.
2. Write one entry per request, with the request **verbatim**: never summarize, translate, reorder or reformat the developer's words. The `request` text is immutable from now on.
3. If the first prompt contains no particular request, still create the register with an empty `requests` list. The absence of particular requests is a no-op, not a halt: continue the workflow normally.
4. Put only a pointer to the artifact in the session memory (its name and purpose). Do not copy the register into the memory, and do not write a new artifact for every update: `#capability:session-artifact-write` overwrites the file, so re-create the same artifact name with the updated content.

Use this versioned YAML shape as the register body:

```yaml
version: 1
job_id: <jobId>
requests:
  - id: UR1
    request: "<the developer's request, verbatim and immutable>"
    category: procedure | gate | workflow-execution | output-form | investigation | operating-preference
    evaluation: executed | binding | pending-clarification | conflict | unapplied
    executed_in: "<where the request is binding, from this step onward>"
    effects:
      - kind: skipped-step | start-point | fixed-decision | artifact | constraint | added-gate
        condition: "<when this effect applies>"
        applied_at: "<the actual Instruction N/M and its text, recorded when it applies>"
        detail: "<the concrete effect>"
    notes: "<optional>"
```

Write each effect as a **condition** that says when it applies, for example "when a step asks to interview the developer" or "when a step settles the design decisions". Never name a future step or a future design operation: you receive one instruction at a time and you do not know which steps follow the current one.

---

## 3. Execute or evaluate every request in this step

Do not defer the space to a later moment. For every request in the register:

- If the request can be executed here, execute it now and record in `executed_in` the observable outcome and where it is binding.
- If the request governs the behaviour of later steps, mark it as binding from this step onward and record its effects as conditions.
- If a new finding changes the evaluation of a request, update its `evaluation` and `effects` and reiterate. Never modify the request text.
- If a condition never matches any step, mark the effect as `unapplied`, record the reason, and let the terminal wrap-up report it.

A procedure, a set of gates or a workflow-execution change must be executed, evaluated and, when needed, reiterated **in the order the developer gave**, completing the phases it provides (information gathering, analysis, selection, saving of its own analysis) **before the workflow intake starts**. When the procedure says to start from a specific point or to skip workflow steps such as the interview, the workflow starts there and the indicated steps are omitted.

Keep the subagents you invoked and the artifacts the procedure produced available to the standard workflow: later steps may use them instead of reproducing them.

---

## 4. Apply the effects in later steps

The serving tool appends the register body to every instruction served after this one, inside a clearly marked active-register section. You do not need to re-read the artifact manually at each step: when the current instruction arrives, inspect the register it carries and apply the effects whose condition matches that instruction.

- **Skipped steps**: when the current instruction matches a skip condition, do not perform the step's work; record the skip with the actual `Instruction N/M` and the instruction text, then call `#capability:workflow-step-next`. For a start point, keep skipping matching steps until one matches the start condition, then proceed from there.
- **Fixed decisions**: treat decisions already settled in the space as fixed. Do not reopen them and do not overwrite them.
- **Artifacts and constraints**: the artifacts and operating constraints produced in the space are available to later steps and must be applied by them.
- **Updates**: when a later finding changes the evaluation of a request, update its effect in the register (never the request text) and apply the updated effect.

A skip or a start point that would remove an artifact or a gate required by the requirement or by a knowledge rule is a conflict: do not skip, record it and halt.

---

## 5. Priority, ambiguity and conflicts

- The project knowledge base and the constraints of the requirement prevail over a particular request.
- Towards the default instructions of the workflow, the particular request prevails: execute it and skip the steps the developer indicates, because removing that rigidity is exactly what the developer asked for.
- **Pending clarification**: if a request is ambiguous or requires a choice only the developer can make, register it as `pending-clarification` and halt, asking for the missing choice. Resume only after the answer.
- **Conflict**: if a request contradicts a knowledge rule or a constraint of the requirement, do not execute it silently. Register it as `conflict` naming the violated rule, halt and ask the developer how to proceed.

Failure arms:
- If `#capability:session-artifact-write` or the session-memory write fails, retry once; if it still fails, register a blocker and do not proceed to the intake.

**Halt protocol.** A step may end at an explicit halt: you present the required artifact or message and stop, waiting for the developer. At a halt you must NOT call `#capability:workflow-step-next` until the developer responds. Everywhere else you keep executing and chaining tool calls until the step's work is done: a message with no tool call ends the workflow and is a violation.
