# Prompt per Progettare il Tuo Sistema Agentico

Usa questo prompt con un coding agent dentro il tuo repository. Obiettivo: produrre una prima versione concreta del sistema agentico del tuo team, non un documento generico.

`````text
I want to design an agentic system for this repository.

Work as an agentic workflow architect. Do not modify application code. Analyze only the repository structure, existing documentation, development workflow, and operational risks. If you need to create files, create proposal documents only under a dedicated folder such as docs/agents/ or .agents/.

Before you begin, clarify these choices with the team:

- Output language: generate everything in English by default. Ask whether the team wants a different language for artifacts, agents, skills, prompts, and documentation.
- Session system: first infer from the repository which system the team appears to use for issues, sessions, tracking, or knowledge retrieval. Look for signals such as MCP configuration, references to GitHub Issues, Jira, Linear, Azure DevOps, Notion, internal trackers, sessions/ folders, or workflow documentation. Then propose the most coherent system based on the evidence you found and ask for confirmation.
- If you do not find strong signals: do not propose a default. Ask which system should be used for sessions, issues, bugs, context retrieval, and decision linkage. Offer a list of options: GitHub Issues with MCP, Jira with MCP, Linear with MCP, Azure DevOps with MCP, Notion with MCP, an internal tracker with MCP, or local Markdown files in the repository for issue and bug tracking plus artifacts, for example sessions/session-id/ or docs/issues/.

Use this method.

1. Find the failure modes
   Identify the 5 most likely errors when AI agents help this team.
   Examples: ambiguous scope, implementation without approval, incorrect context loading, skipped tests, weak review, conflicting instructions.

2. Define instruction precedence
   Propose where durable team rules, role rules, reusable skills, and ad hoc task prompts should live.
   Required output: a clear hierarchy such as:
   - team policy
   - custom agent
   - workflow skill
   - task prompt

3. Design narrow modes
   Identify which workflows deserve a dedicated mode.
   For each mode write:
   - when it activates
   - what it may do
   - what it may not do
   - when it must stop

4. Separate agent roles
   Propose the minimum set of roles needed to reduce drift.
   Start from these, then adapt them to the repository:
   - Planner: clarifies the requirement and produces artifacts
   - Implementor: modifies code only from an approved plan
   - Tester: creates and executes the test strategy
   - Reviewer: looks for bugs, regressions, risks, and gaps against the plan

5. Design durable artifacts
   Define the files that let the team resume work without depending on chat memory.
   Include at least:
   - session-brief.md
   - requirements-analysis.md
   - spec.md
   - task-breakdown.md
   - implementation-plan.md
   - test-plan.md
   - review-report.md
   - changed-files.md

6. Put gates where risk is high
   Propose the minimum useful gates.
   At least evaluate:
   - human approval before implementation
   - complete artifacts before handoff
   - green tests before final review
   - mandatory revisions for already approved artifacts

7. Decide when a decision map is needed
   For work larger than one agent session, propose a decision map before implementation tickets.
   Include:
   - destination of the work
   - decisions already closed
   - open decisions
   - fog that is not yet specifiable
   - next frontier
   - demoable vertical tickets with blocking edges
   - rule for wide refactors: use expand-contract instead of fake vertical slices

8. Package repeatable work as skills
   Propose skills with a clear trigger, short procedure, and known output.
   Examples:
   - requirements-analysis
   - task-decomposition
   - implementation-planning
   - test-strategy
   - review-checklist

9. Create a knowledge index on demand
   Propose a knowledge map that helps agents read only what they need.
   Do not load the whole repository by default.
   Required output: a list of knowledge documents, reading triggers, and what each file should contain.

10. Define the handoff envelope
   Create a standard format for handoff between agents or phases.
   It must include:
   - session id
   - from agent
   - to agent
   - current gate
   - approval state
   - required artifacts
   - open questions
   - blocking risks
   - definition of done for the next agent

11. Produce the file plan
   Before creating any files, run a grilling session to close unclear gaps. Ask direct questions about risks, owners, approvals, the session system, language, role boundaries, mandatory artifacts, and the cost of gates.
   Then show a file generation plan in Markdown that follows the style of a structured Implementation Plan, but do not write it to disk yet.
   Ask for explicit approval of the plan. Do not create, modify, or move files until the team approves.
   In the plan, propose concrete files to create or update.
    For each file indicate:
    - path
    - purpose
    - essential content
    - who uses it
    - which failure mode it prevents

   The initial file plan must use this minimum structure:

   - `# Initial File Plan`
   - `## Session ID`
   - `## Approval Status`
   - `## 1. Design Overview`
   - `## 2. Selected Repository Knowledge`
   - `## 3. Filesystem Tree`
   - `## 4. File Details`
   - `## 5. Operations and Timeline`
   - `## 6. Validation Commands`
   - `## 7. Risks and Rollback`

   Format requirements:

   - In `Approval Status`, mark the plan as not approved until the team explicitly confirms it.
   - In `Selected Repository Knowledge`, list only files actually read or signals actually observed in the repository and explain why they were selected.
   - In `Filesystem Tree`, show each proposed file as `NEW`, `MODIFIED`, or `UNMODIFIED` with a short reason, and render each path as a clickable link to its matching entry in `File Details`.
   - In `File Details`, create one entry for every file in the tree with: operation, purpose, planned changes, who uses it, and which failure mode it prevents.
   - Each `File Details` entry must include a visible backlink to the `Filesystem Tree` section.
   - If you propose modifying an existing file, include `Diff Required: true` and a `Proposed Diff` in a `diff` block when the change is material.
   - If you propose a new file, include `Proposed File` with the full or near-full expected structure, not just a title.
   - If a file is mentioned only for context or test scope, use `UNMODIFIED` and explain why it remains unchanged.
   - In `Operations and Timeline`, order the steps as the smallest sensible sequence of verifiable actions.
   - In `Validation Commands`, include only realistic checks for documents, prompts, skills, or workflow artifacts; do not invent application tests if the work is documentation-only.
   - In `Risks and Rollback`, explain how to reverse or reduce the impact of a governance proposal that proves too heavy.

   Presentation details:

   - If you use anchors for the `Filesystem Tree`, make them clickable and stable.
   - If a file name contains symbols or a complex path, use stable, readable slugs.
   - Keep diffs concise but concrete enough to review before approval.

   Use this generic template for the initial file plan when possible:

   ````text
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
   - Selected Knowledge Files: None
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
   - Diff Required: true
   - Diff Rationale:

   For `MODIFIED` files:

   **Proposed Diff:**

   ```diff
   - removed line shown in red in markdown renderers that support diff highlighting
   + added line shown in green in markdown renderers that support diff highlighting
   ```

   For `NEW` files:

   **Proposed File:**

   ```md
   # Example Title

   Full or near-full expected contents go here.
   ```

   Use `Proposed Diff: None` only when the file has no material content changes.

   ## 5. Operations and Timeline

   | Step | Action | Validation |
   | --- | --- | --- |
   | 1 | ... | ... |

   ## 6. Validation Commands
   - `markdownlint ...`
   - `rg "..." ...`

   ## 7. Risks and Rollback
   - ...
   ````

   Adapt section labels if needed, but preserve the same structure, link behavior, and review fidelity.

Constraints:

- Do not present the system as perfect.
- Prefer rules that are small, verifiable, and easy to change.
- Do not add bureaucracy without a clear risk.
- Always distinguish between a repository-specific example and a transferable principle.
- If information is missing, ask at most 7 clarification questions, ordered by impact.

Required final output:

1. Summary of failure modes
2. Proposed instruction hierarchy
3. Recommended modes
4. Recommended agent roles
5. Artifacts and gates
6. Strategy for decision maps and vertical tickets
7. Candidate skills
8. Knowledge map
9. Handoff envelope
10. Initial file plan
11. Three small experiments to validate the system in one week

`````

## Uso Rapido in Aula

Chiedi ai colleghi di lanciare il prompt nel proprio repository e portare tre output alla sessione successiva:

- i cinque failure mode principali del loro team
- un gate che blocca un errore costoso
- una skill che impacchetta lavoro ripetibile

Poi confrontate sistemi diversi. Buon segnale: non tutti avranno stessi ruoli, gate e artifact. Vuol dire che hanno progettato dal rischio reale, non copiato struttura demo.
