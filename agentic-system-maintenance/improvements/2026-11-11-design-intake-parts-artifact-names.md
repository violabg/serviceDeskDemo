# Kit improvement report: intake delegate cost, small-client part limit, artifact naming, step 1 register scope

- Date: 2026-11-11
- Kit version: 6.2.0
- Clients: Claude Code (usage recorded), Copilot CLI (usage recorded), OpenCode (no transcript; usage unavailable, session store only)
- Sessions audited: 3, on 1 issue; workflows: DESIGN (each stopped at the approval gate of step 9 of 11, design in Draft)

## Findings

### 1. The intake delegate of the work item skill costs more than the intake it hides

- Class: workflow
- Where: the `plan-user-story-from-id` skill, its subagent prompt template
- Evidence: measured cost, judged cause. The delegate retrieved one work item of about 10.9k chars and stored it as an artifact; the main conversation then read the whole artifact (about 11k chars) with `session-artifact-read`, so the delegate kept nothing out of the main context. On Copilot CLI the delegate also read the full orchestrator role contract (about 19k chars), ran `knowledge-catalog` and `knowledge-read` on one document (2 parts), wrote the artifact twice, and read it back in 3 parts.
- Seen in: 2 of 2 sessions with a transcript; systemic
- Cost: 131,411 weighted input-equivalent tokens (3.5% of the run) on Claude Code, 5 turns; 163,640 (11.8% of the run) on Copilot CLI, 10 turns
- Proposed change: the delegate prompt states that the delegate loads no role contract and no knowledge, calls only the work item integration and `session-artifact-write`, writes the artifact once and does not read it back. The maintainer may also weigh whether the delegate pays for itself at all when the orchestrator reads the full artifact afterwards.
- Flow check: the intake delegate belongs to the skill, before or beside the served steps. Constraining its prompt removes, weakens or reorders no served step, check, verifier or approval gate.
- To reproduce: start the skill with a work item id on a client whose delegate has no role loaded; count the delegate's calls other than the work item integration and one `session-artifact-write`.

### 2. A client with no `partLimits` entry is served 7,000-character parts

- Class: runtime
- Where: `config.json`, `partLimit` and `partLimits`; `lib/util.mjs`, `PART_LIMIT` and `servePart`
- Evidence: measured count, judged cause. `partLimit` is 7000 and `partLimits` holds 24000 for two clients and no entry for Copilot CLI, whose role file passes no `--client`. In the Copilot CLI session 40 of 151 tool calls only fetched a further part: 21 `workflow-step-pending`, 12 `knowledge-read`, 7 across `session-artifact-read`, `design-obligations`, `design-decisions` and `design-snapshot`. Instructions arrived in 2 to 5 parts and one knowledge read in 13. The same transcript shows the client returning single tool results of 18,974 and 10,484 chars uncut.
- Seen in: 1 of 1 Copilot CLI session; possibly a one-off, by construction systemic for that client
- Cost: not measured. Most parts were requested as parallel calls in one turn, so the cost is in call count and footers more than in turns.
- Proposed change: re-measure the largest tool result Copilot CLI passes uncut, and ship a `partLimits` entry for it with the role file passing `--client`, as the other two clients do.
- Flow check: only the size of each served part changes. Every instruction and document is still served whole and in order; no step, check, verifier or approval gate is touched.
- To reproduce: run any DESIGN job from Copilot CLI and count calls carrying `--part`.

### 3. The work item artifact has no prescribed name, and a name ending in `.md` gets a second `.md`

- Class: runtime (with a workflow part in the skill)
- Where: `session-artifact-write`; the `plan-user-story-from-id` skill, its subagent prompt template
- Evidence: measured. Three sessions on the same work item stored it under three names: two with a hyphenated name the delegate ended in `.md`, stored on disk with a doubled `.md.md` extension, and one as `work_item_<id>`. The skill's prompt asks for "a new artifact" and names none. Only the `work_item_<id>` name let the audit digest detect the issue from the artifact; the other two were detected from the session id alone.
- Seen in: 3 of 3 sessions; systemic
- Cost: not measured
- Proposed change: `session-artifact-write` drops a trailing extension that matches the artifact's `mimeType` from `name` before storing, or refuses it with the corrected name. The skill's prompt prescribes the name `work_item_<id>`.
- Flow check: a naming rule only. No step, check, verifier or approval gate is removed, weakened or reordered.
- To reproduce: call `session-artifact-write` with `mimeType` `text/markdown` and a `name` ending in `.md`; list the session's artifacts folder.

### 4. Step 1 does not say whether the work item id and session creation are "particular requests"

- Class: workflow
- Where: `workflows/shared/01-user-instruction-space.md`
- Evidence: judged. The same first prompt (a work item id and a request to create a named session) produced three registers: one with `requests: []`, one registering the session creation as a `workflow-execution` request, and one registering both the bare work item id and the session creation as binding requests, each with an `effects` block.
- Seen in: 3 of 3 sessions; systemic
- Cost: small. The register ranged from 491 to 1,560 bytes and is re-read by later steps.
- Proposed change: the instruction states whether the requirement source and the session id count as particular requests, with one example of a prompt that yields an empty register.
- Flow check: clarifies what the step records. The step itself, its artifact and every later check and gate stay as they are.
- To reproduce: start a DESIGN job whose first prompt carries only a work item id and a session name, on two clients; compare the two registers.
