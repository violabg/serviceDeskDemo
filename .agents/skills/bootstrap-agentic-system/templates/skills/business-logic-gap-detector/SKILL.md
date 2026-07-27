---
name: business-logic-gap-detector
description: "Use when: creating unit tests designed to break or expose weaknesses in production logic."
disable-model-invocation: true
---

# Business Logic Gap Detector

# Business Logic Gap Detector for Implementor

Use these instructions to create unit tests designed to break (or expose weaknesses in) production logic.

# Invocation Format

## Purpose

You expect to receive a single invocation message that identifies:

- A session ID
- One or more classes to analyze
- Optional method names to restrict the analysis scope

## Canonical Format

The preferred canonical format is:

```markdown
## Activate session: {session_id}

List of test scope items:

- {ClassName}: {MethodName1}, {MethodName2}
```

This format is recommended because it is the clearest and easiest to parse.

### Example 1 — Specific methods

```markdown
## Activate session: test_1

List of test scope items:

- ExampleClassName1: Handle, ValidateGroupId
```

### Example 2 — All methods (methods omitted)

```markdown
## Activate session: test_2

List of test scope items:

- ExampleClassName2
```

### Example 3 — Multiple classes

```markdown
## Activate session: test_3

List of test scope items:

- ExampleClassName3: Handle
- AnotherExampleClassName3: Method1, Method2
```

---

# Flexible Input Acceptance

The canonical format above is provided for clarity and consistency.

It is NOT a strict formatting requirement.

You MUST accept any invocation that clearly communicates:

1. A session identifier
2. At least one class name
3. Optional method names

If the required information can be determined unambiguously, you MUST normalize the input internally into the canonical structure and continue processing.

Do NOT reject an invocation solely because it is not written in the canonical format.

---

## Valid Alternative Formats

<!-- CANONICAL-TEMPLATE-SLOT: REPO_DOMAIN_TERMS START -->
### Natural language

```text
Analyse HermesAssignmentDocumentBoardingUseCase in session test_detector_6
```

### Compact format

```text
class HermesAssignmentDocumentBoardingUseCase. session_id: test_detector_6
```

### Key-value format

```text
session_id=test_detector_6
class=HermesAssignmentDocumentBoardingUseCase
```

### Multiple classes

```text
session_id=test_detector_6
classes=ClassA, ClassB
```

### Class with methods

```text
session_id=test_detector_6
class=HermesAssignmentDocumentBoardingUseCase
methods=Handle, Validate
```

### Free-form request

```text
Use session test_detector_6 and analyse HermesAssignmentDocumentBoardingUseCase.Handle
```
<!-- CANONICAL-TEMPLATE-SLOT: REPO_DOMAIN_TERMS END -->

---

# Do

1. For each class file and for the involved methods, you must create unit tests that break the business logic. For each method, you must analyze all private methods it invokes, including those called indirectly at any level of nesting or call depth. You must create unit tests that break the business logic of the production code, and you must ensure that every test case you create fails when executed against the production code before any fix is applied. If a test case does not fail, it means that it does not effectively break the production logic and it is not a valid test case. In such cases, you must revise the test case to ensure that it genuinely exposes a weakness or failure point in the production logic.
2. Every test case you create must highlight real weaknesses and failure points that can genuinely occur in practice.

# Do not

- Do not modify the production class; limit yourself to writing the tests and ensuring that they fail.
- Do not be speculative and do not create impossible scenarios.
- Do not restrict your analysis to the content of the specified method. Instead, thoroughly examine all private methods invoked by it, including those called indirectly at any level of nesting or call depth.

# Workflow

# Gate 0 - Invocation validation

Before doing any repository work, validate the invocation payload.
If the caller message does not match the required input, stop and report `blocked invalid invocation`.
If any required field is missing for a test scope item, stop and report `blocked invalid invocation`.

# Gate 1 - Knowledge refresh

<!-- CANONICAL-TEMPLATE-SLOT: KNOWLEDGE_SOURCE START -->
Before starting the unit-test implementation, refresh your knowledge of the project conventions, especially regarding unit tests. Read relevant coding knowledges using optional project knowledge integration tools. Pay special attention to any knowledges related to testing conventions, test file organization, naming conventions for test classes and methods, and any specific testing frameworks or tools used in the project. Update your understanding of the unit-test requirements and conventions based on this refreshed knowledge before proceeding to unit-test scope resolution and implementation.
<!-- CANONICAL-TEMPLATE-SLOT: KNOWLEDGE_SOURCE END -->

# Repository Discovery Budget

<!-- CANONICAL-TEMPLATE-SLOT: REPOSITORY_SEARCH_TOOL START -->
Repository discovery is one of the most expensive operations.

Hard limits:

- Before implementation:
  maximum TWO repository search calls.

- During compiler recovery:
  maximum ONE repository search call per compiler iteration.

Never perform consecutive repository search calls without first:

- implementing code,
- compiling,
- or executing tests.

Every search must have a specific unresolved technical objective.

Searching to gain confidence or familiarity with the codebase is forbidden.

# Gate 2 - Unit-test resolution and execution preparation

If no suitable test file already exists, create a new test file in the appropriate test project, using the production-class to test-class mapping and the project testing conventions.
Derive actual target test files from the the production-class to test-class mapping, and the minimum repository discovery needed to implement the tests.

Repository discovery is expensive and must be minimized.

Execution strategy:

Step 1
Perform exactly ONE repository search integration call to discover all of the following:

- existing test files
- production class → test class mappings
- handler/test patterns
- required helper classes explicitly needed by the implementation plan

Batch all discovery into this single search whenever possible.

Step 2
Read every returned file required for the implementation.

Step 3
Determine every target test file (existing or new).

Step 4
Implementation is expected to be completed in a single editing phase whenever feasible.

Do not interrupt implementation to gather additional context unless blocked.

Do NOT perform exploratory searches.

Every repository search integration call must answer a specific unresolved technical question.

Examples of INVALID searches:

- find similar tests
- inspect project
- explore repository
- search for examples
- verify conventions

Examples of VALID searches:

- Where is EntityWithIdNotFoundError defined?
- What namespace contains IAuditEntityRepository?
- What is the signature of Query()?

A search whose only purpose is increasing confidence is forbidden.

Do not perform additional searches unless blocked by compiler diagnostics or a missing technical dependency.

When uncertain, prefer writing code and letting the compiler identify the missing information rather than searching the repository.
<!-- CANONICAL-TEMPLATE-SLOT: REPOSITORY_SEARCH_TOOL END -->

# Gate 3 - Unit-test implementation and red flag verification

<!-- CANONICAL-TEMPLATE-SLOT: TEST_STACK_CONVENTIONS START -->
Create or update the unit tests files according to the scope defined in the previous gate and strictly following the instructions in the implementation plan and the project conventions.
Preserve one test file per production class.
Follow Arrange-Act-Assert structure if not differently specified in the project conventions.
<!-- CANONICAL-TEMPLATE-SLOT: TEST_STACK_CONVENTIONS END -->

Work in batches whenever possible.

Preferred execution order:

1. Prepare every test modification.

2. Apply every file modification.

3. Compile once.

4. Fix all Category A compiler errors.

5. Compile again.

6. Only if Category B errors remain, execute the minimum required repository search.

7. Run the broadest relevant test suite.

8. Only narrow test execution if failures become localized.

Avoid alternating:

search → read → search → read → search

Instead:

search → read → implement → compile

or

compile → fix → compile

Repository exploration is a last resort, never a confidence-building activity.

## Compiler Recovery Policy

Compiler diagnostics are the authoritative source of truth.

Do not proactively verify symbols, namespaces, helpers, or implementations.

Every compiler error must first be classified.

### Category A — Local Fixes

Examples:

- missing using
- namespace
- syntax errors
- generic arguments
- constructor overload
- nullable annotations
- assertion syntax
- incorrect mock setup
- missing references already implied by opened files

Repository search is prohibited.

Repair immediately using:

- compiler diagnostics
- implementation plan
- files already opened
- project knowledges

Compile again.

---

### Category B — Missing Knowledge

Examples:

- unknown interface
- unknown helper
- unknown extension method
- unresolved dependency
- unknown repository method
- unknown production behavior

Only Category B errors justify a repository search integration call.

Each search must answer exactly one unresolved technical question.

Never search proactively.

Compile after every repair iteration.

The compiler—not repository exploration—drives the recovery process.
After successful verification, update the execution report with the completed optional unit-test outcomes, summarize the changes in agent memory, and log the outcome.
If a blocker remains after reasonable autonomous repair attempts, record it clearly, keep the related optional unit-test work in a non-completed state, and report the blocker in the final summary.
Every test case must fail when executed against the production code before any fix is applied. If a test case does not fail, it means that it does not effectively break the production logic and it is not a valid test case. In such cases, you must revise the test case to ensure that it genuinely exposes a weakness or failure point in the production logic.

# Gate 4 - Final summary

After implementing the unit tests, provide a final summary of the implemented tests, including the specific weaknesses or failure points they are designed to expose in the production logic.
Write a note in memory for the next agent who will be responsible for fixing the production code, describing the weaknesses or failure points that the implemented tests are designed to expose. This will help guide their efforts in addressing the issues identified by the tests.
Write a message to the caller that unit tests have been implemented and red tested and the agent can now proceed for fixing the production code.

Use this template to construct your response to the caller:

```markdown
**Return format**:

# Overall verdict

- <implemented failing tests | no actionable issue | blocked invalid invocation>

# Findings ordered by severity

- <for each finding: production weakness, exact failing test scenario, why it matters>

# Implemented failing tests

- <test file path>: <test name and weakness exposed>

# Next step for fix agent

- <narrow production area that must be fixed, or `none`>
```
