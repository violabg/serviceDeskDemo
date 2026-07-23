# Prompt per Progettare il Tuo Sistema Agentico

I want to design an agentic development system for this repository.

Work as an agentic workflow architect. Do not modify application code. Analyze only repository structure, existing documentation, development workflow, agent/tooling conventions, and operational risks. If files are eventually created, create only proposal or agent-system files under dedicated locations such as docs/agents/, .agents/, .github/agents/, .claude/agents/, or the chosen platform equivalent.

First, infer and confirm these choices with the team:

- Agent platform: infer the target system from repository signals such as .github/agents/, .claude/agents/, Copilot customizations, Claude Code files, Cursor rules, Cline conventions, or other agent folders. If signals are weak, ask which platform to target: Claude Code, GitHub Copilot, Cursor, Cline, or another agent framework.
- Agent meaning: in this design, `agent` and `custom agent` mean persistent, user-invokable custom agent definitions saved in the chosen platform's agent location.
- Output language: default to English for artifacts, custom agents, skills, prompts, and documentation unless the team asks otherwise.
- Session and issue system: infer whether the repository uses GitHub Issues, Jira, Linear, Azure DevOps, Notion, an internal tracker, MCP tools, local sessions/, docs/issues/, or another artifact system. If signals are weak, ask which system should connect sessions, issues, bugs, context retrieval, and decisions.

Use this method.

1. Find the failure modes
   Identify the 5 most likely costly errors when AI agents help this team. Examples: ambiguous scope, implementation without approval, wrong context loading, skipped tests, weak review, missing evidence, or conflicting instructions.

2. Define instruction precedence
   Propose where durable team policy, custom-agent role rules, reusable skills, ad hoc prompts, and task-specific user instructions should live. Make the precedence explicit so conflicts are resolvable.

3. Design narrow modes
   Identify workflows that need a dedicated mode because their permissions or goal differ from normal development. For each mode define: trigger, allowed actions, forbidden actions, and stop condition.

4. Separate user-invokable custom agents
   Start with these core custom agents, then adapt them to the repository and chosen platform:
   - Planner: clarifies requirements and produces artifacts.
   - Implementor: changes code only from an approved plan.
   - Tester: creates and executes the test strategy.
   - Reviewer: reviews defects, regressions, risks, and plan/spec conformance.

   These core roles must be persistent custom agents directly invokable by the user. They may call sub-agents or reusable skills internally, but they must not collapse into hidden responsibilities, prompt patterns, or skills only.

   Evaluate optional user-invokable custom agents when they reduce role drift:
   - Ask agent: repository-grounded Q&A, explanations, and navigation without starting implementation workflow.
   - Intake agent: issues, bugs, external tracker records, or support requests.
   - Visual-intake agent: screenshots, mockups, browser captures, diagrams, or other non-text evidence.
   - Knowledge-builder agent: durable domain, architecture, testing, workflow, or governance knowledge.

   Keep Q&A, intake, visual normalization, and knowledge maintenance separate from Planner when those tasks can happen outside feature planning.

5. Specify role rules that prevent drift
   For Planner, require:
   - ask only the minimum blocking clarification questions needed to continue
   - distinguish blocking questions from non-blocking preferences
   - use concise questions with bounded choices when possible
   - explain why each blocking question matters and how the answer changes the plan
   - never request approval while blocking questions remain unanswered
   - never treat assumptions as answers to blocking questions
   - select relevant knowledge index-first when an index exists
   - extract a small rule inventory from selected knowledge
   - cluster the likely codebase surface before deep reading
   - inspect only files that answer concrete planning questions
   - include an alignment review mapping selected rules to planned files, decisions, or blockers

   For Tester, require affected-test scope first, narrow meaningful checks before broad regression, and explicit residual risk when something cannot be automated.

   For Reviewer, require review along two axes: conformance to the approved plan/spec and conformance to durable repository standards.

6. Design durable artifacts
   Define the artifact package that lets the team resume work without chat memory. Include at least:
   - session-brief.md
   - requirements-analysis.md
   - clarification-questions.md
   - spec.md
   - task-breakdown.md
   - implementation-plan.md
   - test-plan.md
   - review-report.md
   - changed-files.md

   If visual evidence or external tracker records affect scope, UX, or acceptance criteria, define a normalized evidence artifact and link it from later planning artifacts.

7. Put gates where risk is high
   Propose only gates that block costly errors. At minimum evaluate:
   - human approval before implementation
   - blocking clarifications resolved before approval request
   - complete artifacts before handoff
   - selected-knowledge alignment before approval
   - affected-test scope before implementation or test handoff
   - green focused tests before final review
   - revision records for approved artifacts
   - lightweight enforcement only after a rule proves useful and prevents a costly failure

8. Decide when decision maps are needed
   For work larger than one agent session, propose a decision map before implementation tickets. Include destination, closed decisions, open decisions, unclear fog, next frontier, demoable vertical tickets with blocking edges, and an expand-contract rule for wide refactors that cannot be sliced vertically.

9. Package repeatable work as skills
   Propose skills only for repeatable procedures with clear triggers, short steps, and stable outputs. Consider skills for requirements analysis, task decomposition, implementation planning, test strategy, review checklist, artifact workflow, and knowledge selection.

10. Design bounded knowledge loading
   Propose a knowledge map with document names, read triggers, and expected contents. Define how agents should:
   - read the knowledge index first when present
   - select knowledge by trigger, not bulk loading
   - extract applicable rules into a small rule inventory
   - record selected knowledge in artifacts
   - prefer selected knowledge over conflicting legacy patterns
   - verify plans against selected rules before approval

11. Define the handoff envelope
   Create a standard handoff format with: session id, from agent, to agent, current gate, approval state, required artifacts, open questions, blocking risks, and definition of done for the next agent.

12. Produce an initial file plan
   Before proposing files, run a short grilling pass to close unclear gaps about platform, risks, owners, approvals, session system, role boundaries, mandatory artifacts, and gate cost.

   Then show a Markdown file plan, but do not write anything to disk until the team explicitly approves. The plan must be marked unapproved by default and must include concrete files to create or update.

   Use this structure:

   ````markdown
   # Initial File Plan

   ## Session ID
   - Session:

   ## Approval Status
   - Approved: false
   - Approved By:
   - Approval Date:

   ## 1. Design Overview
   - Goal:
   - Scope:
   - Out of Scope:
   - Key Decisions:

   ## 2. Selected Repository Knowledge
   - Selected Knowledge Files:
   - Reason:

   ## 3. Filesystem Tree

   > Paths link to their File Details entry below for quick navigation.

   | Operation | Path | Reason |
   | --- | --- | --- |
   | NEW | [`...`](#file-slug) | ... |
   | MODIFIED | [`...`](#file-slug) | ... |
   | UNMODIFIED | [`...`](#file-slug) | context or validation scope only |

   Path slug rule: lowercase the path, replace every run of non-alphanumeric characters with `-`, then trim leading and trailing `-`.

   ## 4. File Details

   <a id="file-slug"></a>

   ### `<path>`
   Back to [Filesystem Tree](#3-filesystem-tree)

   - Operation:
   - Purpose:
   - Planned Changes:
   - Who Uses It:
   - Failure Mode Prevented:
   - Diff Required:
   - Diff Rationale:

   For `MODIFIED` files, include a concise `Proposed Diff` in a `diff` block when the change is material.
   For `NEW` files, include a `Proposed File` block with full or near-full expected contents.
   Use `Proposed Diff: None` only when a file has no material content changes.

   ## 5. Operations and Timeline

   | Step | Action | Validation |
   | --- | --- | --- |
   | 1 | ... | ... |

   ## 6. Validation Commands
   - realistic document, prompt, skill, or workflow checks only

   ## 7. Risks and Rollback
   - ...
   ````

Constraints:

- Do not present the system as perfect.
- Prefer small, verifiable rules that are easy to change.
- Do not add bureaucracy without a clear risk.
- Keep repository-specific examples separate from transferable principles.
- Ask at most 7 clarification questions, ordered by impact.
- Do not request approval while blocking questions remain open.

Required final output:

1. Failure mode summary
2. Instruction hierarchy
3. Recommended modes
4. Recommended custom agents
5. Role-specific rules
6. Artifacts and gates
7. Decision-map and vertical-ticket strategy
8. Candidate skills
9. Knowledge map
10. Handoff envelope
11. Initial file plan
12. Three small experiments to validate the system in one week
