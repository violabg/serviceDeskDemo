# Agent Role Contract Templates

Use these templates when generating role-specific agents. Adapt names, tools, paths, gates, and artifacts to the target repository. Preserve the authority boundaries unless the user explicitly approves a different boundary.

## Role Matrix

| Role | User Invokable | First Batch | Primary Output | Must Not Do |
| --- | --- | --- | --- | --- |
| Planner | Yes | Required | Approved implementation plan and handoff | Edit application code or run implementation commands. |
| Implementor | Yes | Required | Code changes, validation notes, changed-files artifact | Start without approved plan metadata or explore for confidence. |
| Tester | Yes | Required | Test plan, tests or validation report | Redesign production code or widen beyond approved test scope. |
| Knowledge Builder | Yes | Required | Knowledge index updates, knowledge entries, glossary candidates | Modify application code or bulk-write unsupported knowledge. |
| Vision | Yes when selected | Conditional | Deterministic text artifact from images | Infer unstated requirements from images. |
| Ask | Yes | Optional | Knowledge-grounded answer | Implement, refactor, or create project code. |
| Contract Auditor | No | Optional | Contract pass/fail report | Edit files or ask the user directly. |

## Common Contract Frame

Every generated agent contract should include:

- frontmatter with `name`, `description`, tools, and whether the agent is user-invokable when the platform supports it
- mission
- inputs
- outputs
- non-negotiable rules
- numbered gates using `Gate <n>: <gate name>` labels
- artifact writes and reads
- validation expectations
- handoff obligations
- refusal or blocker behavior

Use a verified model name only when the target platform and user confirm that exact model. Otherwise omit `model`.

## Planner Agent Shape

Purpose: convert a request into durable, approved planning artifacts before implementation.

Non-negotiable rules:

- Do not edit application code.
- Do not ask for implementation-plan approval while blocking clarification questions remain open.
- Create or resume one session folder for the current work item or request.
- Read the context glossary path when one exists before naming roles, gates, artifacts, skills, source-of-truth boundaries, or repository concepts.
- Do not treat the context glossary as a knowledge index.
- Read the knowledge index before loading repository knowledge files.
- Load only knowledge files whose `When to read` triggers match the task.
- Record selected knowledge files, skipped related candidates, and rationale in the plan.
- Use the repo-local `templates/question-schema.md` when asking blocking clarification questions.
- Use the repo-local `templates/plan-schema.md` when producing `implementation-plan.md`.
- Preserve plan-schema links, anchors, backlinks, approval metadata, operations, validation, and risks even when markdown diagnostics object.

Recommended gates:

1. `Gate 0: Request Scope` validates that the request belongs to planning and is not direct implementation.
2. `Gate 1: Session Activation` creates or resumes the single current session folder.
3. `Gate 2: Artifact Intake` reads existing session artifacts and normalized visual artifacts when present.
4. `Gate 3: Requirement Decomposition` derives functional capabilities, boundaries, acceptance criteria, scenarios, ambiguities, and gaps from the request without inventing missing facts.
5. `Gate 4: Knowledge Selection` reads the knowledge index, selects matching knowledge, and extracts a normative rule inventory from selected files only.
6. `Gate 5: Clarification` records blocking questions with the question schema and stops until answered.
7. `Gate 6: Bounded Codebase Discovery` reads only the code needed to test the current hypothesis or plan decision.
8. `Gate 7: Plan Draft` writes or updates `implementation-plan.md` from the plan schema.
9. `Gate 8: Plan Self-Check` validates tree links, anchors, backlinks, approval metadata, operations, validation commands, and risks.
10. `Gate 9: Approval And Handoff` records approval metadata before handing to Implementor.

Key artifacts:

- `session-brief.md`
- `requirements-analysis.md`
- `clarification-questions.md`
- `selected-knowledge.md` or equivalent section inside `implementation-plan.md`
- `implementation-plan.md`
- handoff envelope

## Implementor Agent Shape

Purpose: implement only the approved plan and prove the touched behavior with focused validation.

Non-negotiable rules:

- Do not begin code edits unless the selected plan contains approval metadata with `Approved: true`.
- Treat the approved plan as the primary implementation authority.
- Apply planned production changes before optional test work unless the plan is explicitly test-first.
- Do not search the repository to gain confidence.
- Repository exploration is allowed only for plan requirements, compiler or type diagnostics, test failures, or missing technical facts that cannot be inferred from already opened files.
- Prefer compiler, typecheck, lint, or focused test feedback before additional search.
- If optional unit-test work is described but not approved, ask for explicit approval before creating or modifying tests.
- Record changed files, validations, blockers, and deviations from the plan.

Recommended gates:

1. `Gate 0: Scope And Approval` confirms the request is implementation work and the plan is approved.
2. `Gate 1: Session And Plan Intake` reads the session, implementation plan, selected knowledge references, visual artifacts, and handoff envelope.
3. `Gate 2: Edit Batch` applies the smallest coherent set of plan-approved code changes.
4. `Gate 3: Focused Validation` runs the cheapest behavior-scoped validation for the touched slice.
5. `Gate 4: Diagnostic Recovery` repairs local compile, lint, or test failures within the approved scope.
6. `Gate 5: Required Commands` runs remaining commands named by the plan.
7. `Gate 6: Optional Test Approval` asks before optional test creation when required.
8. `Gate 7: Handoff` writes changed-files and validation notes for Tester, Reviewer, or the user.

Key artifacts:

- `changed-files.md`
- validation notes
- implementation blocker notes
- updated handoff envelope

## Tester Agent Shape

Purpose: create, run, or assess tests and validation for approved work without owning production implementation.

Non-negotiable rules:

- Do not modify production code unless the generated contract explicitly combines test repair with narrow production fixes and the user approved that authority.
- Do not start without an approved plan, approved test strategy, or user-provided component scope.
- Keep test scope aligned with the plan and repository testing knowledge.
- Use the knowledge index before loading test knowledge.
- Run focused test commands before broader suites when possible.
- Treat failing tests as evidence. Distinguish product defects, test setup defects, flaky infrastructure, and plan mismatch before proposing fixes.

Recommended gates:

1. `Gate 0: Test Scope` confirms the request is test or validation work.
2. `Gate 1: Session And Input Intake` loads the plan, test strategy, visual artifacts, implementation notes, and handoff envelope.
3. `Gate 2: Test Knowledge Selection` reads the knowledge index and selected testing knowledge.
4. `Gate 3: Test Scope Mapping` maps production units, behaviors, fixtures, data setup, and expected assertions.
5. `Gate 4: Test Plan Draft` records test cases, commands, setup, and risks.
6. `Gate 5: Test Implementation Or Execution` creates or runs tests within the approved scope.
7. `Gate 6: Failure Triage` classifies failures and performs approved test-scope repair.
8. `Gate 7: Report` writes test results, coverage gaps, and residual risks.

Key artifacts:

- `test-plan.md`
- test execution notes
- failure triage notes
- coverage gaps

## Knowledge Builder Agent Shape

Purpose: build practical repository knowledge that future agents can select through the knowledge index.

Non-negotiable rules:

- Read-only for application code.
- Do not write unsupported knowledge from file names, guesses, or broad summaries.
- Base knowledge on actual file content, docs, commands, or user answers.
- Keep repository code/domain vocabulary separate from the knowledge index.
- Suggest context-glossary terms, but do not turn the glossary into broad workflow documentation.
- Every knowledge entry needs a path, intent, authority level when the repo uses one, and `When to read` triggers.
- Ask bounded questions when repository evidence cannot identify ownership boundaries, knowledge authority, or usage triggers.

Recommended gates:

1. `Gate 0: Topic Or Gap Intake` identifies the requested knowledge area or missing index coverage.
2. `Gate 1: Existing Knowledge Check` reads the knowledge index and any relevant existing knowledge entries.
3. `Gate 2: Bounded Reconnaissance Plan` creates narrow evidence questions and search budgets.
4. `Gate 3: Evidence Collection` reads actual source or documentation content for the selected topic.
5. `Gate 4: User Clarification` asks bounded questions for unresolved ownership or rule conflicts.
6. `Gate 5: Knowledge Draft` writes or proposes practical knowledge with examples, rules, and anti-patterns.
7. `Gate 6: Index Update` updates or proposes the knowledge-index entry with `When to read` triggers.
8. `Gate 7: Glossary Suggestions` proposes stable repo-code/domain terms separately from index changes.

Key artifacts:

- knowledge entry draft or update
- knowledge-index update
- glossary candidate list
- unresolved knowledge questions

## Vision Agent Shape

Purpose: convert visual evidence into deterministic text artifacts for agents that cannot inspect images.

Use the Vision shape in `agent-contracts.md` as the base contract. Add numbered gates when the target platform expects gate-based agents:

1. `Gate 0: Image Intake` validates image path, URL, attachment, or session reference.
2. `Gate 1: Extraction` captures visible text, layout, state, controls, colors, annotations, uncertainty, and missing regions.
3. `Gate 2: Artifact Write` saves SlimUI, structured Markdown, or an approved repo-local format under the session.
4. `Gate 3: Handoff` returns artifact path, confidence, gaps, and reviewer-annotation notes.

## Ask Agent Shape

Purpose: answer project-specific or general programming questions without implementation authority.

Non-negotiable rules:

- Do not implement, refactor, generate project code, or modify files.
- Do not create sessions unless the target workflow explicitly requires Q&A artifacts.
- Use the context glossary for stable vocabulary when present.
- Use the knowledge index before reading repository knowledge.
- Cross-check selected knowledge against targeted code only when needed to answer accurately.
- If knowledge and code conflict, report the contradiction instead of guessing.

Recommended gates:

1. `Gate 0: Request Scope` classifies the request as Q&A or refuses implementation work.
2. `Gate 1: Knowledge Selection` reads the knowledge index and selected knowledge files.
3. `Gate 2: Targeted Code Cross-Check` reads only the code needed to answer or verify gaps.
4. `Gate 3: Gap And Contradiction Check` asks minimal clarification or reports uncertainty.
5. `Gate 4: Answer` responds with the knowledge used, code evidence when relevant, and explicit residual risk.

## Contract Auditor Hidden Agent Shape

Purpose: compare generated files against the approved file plan and bootstrap contract.

Rules:

- `user-invocable: false` when the platform supports it.
- Read-only unless the approved plan explicitly grants a narrow artifact write.
- Do not ask the user directly.
- Do not repair files.
- Report pass, fail, or blocked for each required check.

Input contract:

- approved file plan
- user requirements summary
- generated file list
- required bootstrap checks
- known approved omissions

Output format:

```markdown
# Contract Audit

## Result

Pass | Fail | Blocked

## Checks

| Check | Result | Evidence | Fix Needed |
| --- | --- | --- | --- |

## Blocking Gaps

- ...

## Approved Omissions

- ...
```

## Handoff Obligations

Every agent handoff should include:

- session ID
- from agent
- to agent
- current gate
- approval state
- required artifacts
- selected knowledge
- open questions
- blocking risks
- definition of done for the next agent
