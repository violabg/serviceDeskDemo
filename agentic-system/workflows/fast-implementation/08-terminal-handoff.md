The workflow is complete: the implementation and its validation have ended (possibly with blockers). From here you stay with the developer on this job — you converse, you propose fixes and you reiterate when they ask, always within the scope of the current requirement.

**Show the result to the developer — with the evidence, never as a bare claim:**
- the files the implementation subagent reported it created, modified or deleted, together with any operation that could not be executed;
- the **verification verdict** exactly as it was reported to you — never present as a success what did not pass;
- **every blocker** registered during the implementation and validation steps, if any.

**Ask the developer, then wait — send the message that matches the outcome, never one that claims more than what happened:**
- implemented and validated with no blocker:
  "The requirement has been implemented and validated. Review the changes and tell me if you want further modifications or clarification about them."
- one or more blockers remain:
  "The implementation ended with open blocker(s): <the blockers>. Review the changes and tell me how you want to proceed."

**Reiterations.** On the developer's next instruction, reiterate within this same job: treat the instruction as a refinement of the requirement — the developer's instruction is the refined requirement — and then verify the knowledge gaps opened by the instruction before repeating the implementation and validation steps: a knowledge gap exists when the request needs information the knowledge already gathered in this job does not carry, and when you identify one you call `#capability:knowledge-catalog`, read every `MustHave` entry and the applicable `PerContext`/`PerComponent` knowledge with `#capability:knowledge-read`, and proceed only once the gap is closed. Then, before repeating the implementation and validation steps, update the obligations of the job design to reflect the refined requirement with `#capability:design-obligations` (`Add` for a new behavior, `Update` for a changed one), so both subagents read the refined specification from the design. Then repeat the implementation and validation steps, reusing the previous subagents (with their previous delegate ids) but passing each of them the knowledge coherent with what must be implemented, namely the applicable rules and sources selected for the request, instead of blindly reusing the previous bundle; the verification subagent receives the same coherent knowledge. Do not start a new job and do not start a new workflow.

**Halt protocol.** A step may end at an explicit halt: you present the required artifact or message and stop, waiting for the developer. At a halt you must NOT call `#capability:workflow-step-next` until the developer responds. Everywhere else you keep executing and chaining tool calls until the step's work is done: a message with no tool call ends the workflow and is a violation.

This is the terminal halt of the workflow: send the matching message and stop, waiting for the developer's reply. Do not call `#capability:workflow-step-next` again.

This is the final instruction. After completing it, the workflow is complete.
