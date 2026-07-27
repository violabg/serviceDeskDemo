# Agentic System Governance

Canonical governance for the custom agentic coding system in this repository.

This file defines durable cross-session operating rules. Session artifacts are created per session under the repository `sessions/` root. The repository may include committed exemplar session folders, but agents must read and write only the active session folder for the current run.

Older sessions may be restored from an exported package or reused from an existing `sessions/` folder when the workflow resumes a prior run.

## Rule Precedence

When instructions conflict, resolve them in this order:

1. `AGENTS.md`
2. Agent files under `.github/agents/`
3. Custom skill files under `.agents/skills/`
4. Non-custom skill files under `.github/skills/`
5. Prompt-specific ad hoc instructions

If a lower-precedence source needs a stricter local rule, it may add one only when it does not contradict a higher-precedence source.

## Approval Authority

Only the user may approve implementation.

Valid approval requires both:

1. An explicit user message approving the implementation plan.
2. Approval metadata recorded in the session artifact set:
   - `Approved: true`
   - `Approved By`
   - `Approved At`
   - `Source Message`

If either element is missing, implementation must not start.

## Gate Contract Rule

Main agents that control authority changes or execution flow must define explicit numbered gates using the form `Gate <n>: <name>`.

Each accepted gate must record:

- Trigger
- Pass Condition
- Fail Condition
- Approver or Waiver
- Artifact Record
- Rollback

Workflow step lists are allowed inside a gate, but they do not replace the gate contract itself.

## Role Isolation

Default workflow uses hard role isolation:

- Planner plans.
- Implementor implements.
- Tester tests.
- Review is a required capability satisfied through review artifacts, review-checklist, validation gates, and human or PR review surfaces.

Cross-role overlap is not allowed by default.

### Emergency Mode

Emergency mode is allowed only when the user explicitly requests it. The session artifact set must log:

- who invoked emergency mode
- why it was needed
- scope of the override
- time of activation

## Handoff Envelope

Every agent-to-agent handoff must include the same minimum envelope:

- `Session ID`
- `From Agent`
- `To Agent`
- `Current Gate`
- `Approval State`
- `Required Artifacts`
- `Open Questions`
- `Blocking Risks`
- `Definition of Done for Next Agent`

Free-text summaries are optional, not a substitute.

## Artifact Revision Policy

Approved artifacts are immutable.

If an approved artifact must change:

1. Create a new revision file.
2. Link the prior revision in the new file header.
3. Record why the revision exists.

Do not silently edit an approved artifact in place.

## Session Policy

Session artifacts are always per session.

- They live under the repository `sessions/` folder.
- The repository may include committed exemplar or approved workflow session folders.
- Agents must stay inside the active session folder and must not scan sibling sessions broadly.
- Session packages may also be exported or attached to the related issue ticket when an external handoff needs them.

### Session ID Requirement

Each user-facing agent must ask for a session ID before it starts substantive workflow steps.

For GitHub-driven workflows, the canonical source ID is the GitHub issue ID resolved during intake.

- Normalize the issue number into the safe session ID used for filesystem paths.
- Preferred folder shape for GitHub-driven workflows: `sessions/<safe-session-id>/`.
- If `sessions/<safe-session-id>/` already exists, the agent must retrieve and reuse it.
- If `sessions/<safe-session-id>/` does not exist, the agent must create it before writing session artifacts.
- Prompts that resume prior work should refer to the session by ID.

Manual session IDs are fallback only for offline or non-ticket workflows.

### Session Retrieval

Older session packages may be retrieved from issue-ticket zip attachments or another approved export surface.

- Restore the package into the repository `sessions/` folder.
- Refer to the restored session by session ID in the prompt when a workflow should resume from that package.
- The restored copy is a working retrieval surface, not a new durable source of truth unless the repository workflow explicitly records it as one.

### Session Naming

For GitHub-driven workflows, the GitHub issue ID is the session source identifier and should be retrieved during intake before normalizing the safe session ID.

For offline or non-ticket workflows, the user provides or confirms the session identifier.

## Validation Before Handoff

Implementor validation is mandatory.

- The implementor must run all validation commands required by the approved implementation plan before handoff.
- If a required command fails for an in-scope reason, handoff is blocked.
- If a failure is an unrelated legacy issue, record it as a blocker with evidence.

## Skill Loading Policy

Each gate uses a hard allow-list of skills.

- Do not load extra skills opportunistically.
- Do not widen the skill set because a skill seems generally useful.
- Gate contracts should name the allowed skills explicitly.
- `caveman` is always allowed and should be used to keep prompts concise.
- `shadcn` is allowed when the prompt is relevant to shadcn/ui, `components.json`, registries, or component composition.
- Any skill the user explicitly invokes is allowed and must be honored, even when it sits outside the current gate allow-list.
- These exceptions do not permit unrelated opportunistic skill loading.

## Rule Violation Policy

If an agent breaks a gate rule:

1. Retry once with a stricter prompt.
2. If the retry also breaks policy, stop.

The violation report must include:

- `Session ID`
- `Agent Name`
- `Violated Rule`
- `Evidence`
- `Safe Next Action`

## Domain Language Sources

Use both:

- `CONTEXT.md`
- `docs/agents/domain.md`

If they conflict, `CONTEXT.md` wins.

## Success Metrics

Track the system with a balanced scorecard.

Minimum session metrics:

- Gate compliance rate
- First-pass plan approval rate
- Implementation rework count
- Escaped defect count after review
- Time from intake to approved plan
- Time from approval to validated implementation

## Concept Integration Policy

New workflow concepts become canonical only when they are rewritten as repository-owned policy.

- Reuse good ideas only when they strengthen this service desk workflow.
- Express durable behavior in local language.
- Do not depend on outside workflow text as the canonical reference.

## Rollout Order

Use this rollout sequence when evolving the system:

1. Governance and common knowledge
2. Planner and implementor contracts
3. Tester contract and review capability surfaces
4. Remaining agents and skills

## Enforcement Roadmap

Enforcement should harden in phases:

1. Add artifact and handoff lint checks.
2. Add runtime gate enforcement.

The first phase creates fast feedback. The second phase blocks illegal transitions.

See `docs/agents/enforcement-spec.md` for the Phase 1 lint contract.
