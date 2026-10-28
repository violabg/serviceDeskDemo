# Changelog

Versions follow semantic versioning. The installer reads the first version heading as the kit version it records in the target's manifest.

## 2.0.1

- The review document is redesigned. Its sections, its data and how the runtime renders it are unchanged; only the page changes.
  - Light is the default theme, with a dark theme that follows the system; the ink is blue-black and references are cyanotype blue.
  - A sticky header carries the design title and id, the obligation count, the generator, the plan name and the approval stamp.
  - Cards, code blocks, the section path, the legend and the file and decision dialogs are restyled, and the page prints every section.

## 2.0.0

The canonical system follows upstream 3.0.1. Several answers and outputs change, so a target re-installed from this version must re-read its workflows.

- **The obligations are the requirement.** No workflow writes or reads the `requirement_R_lock` artifact any more. The design verifier judges the design and its obligations through the verification view, no longer reports unmapped requirement rules, and compares every design section with the knowledge the design is grounded in. `design-submit` no longer needs `header.requirementRef`; it is still accepted.
- **FAST_IMPLEMENTATION serves 8 instructions.**
  - A requirement decomposition step is new at 3/8; knowledge, codebase, implementation, validation and wrap-up move down one.
  - A FAST job now creates a job design that holds its obligations, open points and knowledge references, with no approval gate.
  - The workflow files are renamed: `03-requirement-decomposition` … `08-terminal-handoff`.
- **Knowledge references.**
  - Every knowledge read in a job with a design is followed by `design-knowledge-references`, which registers the applicable prescriptions as `kid`s (file id, line range, scope `Production` or `Test`).
  - `knowledge-read` numbers every line.
  - An operation lists the kids it needs, and the knowledge steps make the prescriptions bind every section of the design.
- **The served implementation loop.**
  - The implementor gets one operation at a time from `design-implementation-operation`, with the text of its knowledge references, and closes each one with `design-implementation-operation-close`.
  - It reads the rest of the design once with `design-implementation-context`.
  - Operations are served by weight class: `authoring`, `external-execution`, `unit-test`, `integration-test`, `verification`. Only `authoring` runs without the developer's authorisation, and the developer may authorise several operations together.
  - The new operation kinds `UnitTest` and `IntegrationTest` are added. A plan with more than one `UnitTest` operation fails the `unit-test-operations` check.
  - Only a work unit that writes production code is verified.
- **Decisions.** `highlight` replaces `blocking`, which is still accepted and read as `highlight`. A contract signature change is always a highlighted decision.
- **Codebase clusters are a partition.** Every file is in exactly one cluster:
  - test infrastructure is in `Tests`;
  - every other file is in a PascalCase domain named after its directory;
  - residual files are in `General`; `Uncategorized` is gone.
  - Names are matched exactly, and an unknown name answers `Cluster name '<name>' not found.`
- **Review document.**
  - The header shows the obligation count and the generator instead of the requirement reference.
  - The document gains a Highlighted decisions group, operation weights and statuses, scope tags, and a Knowledge references section with the resolved text.

## 1.2.3

- Every `#operation:<op>` a role or skill names is bound in its Bindings section to the client's native tool, and the binding says it is never a runtime command. In GitHub Copilot for VS Code the knowledge builder ran `agentic-system.mjs question`, read the refusal as a missing runtime and stopped with "required agentic system runtime operations are not available".
  - `#operation:question` (the role's question tool) binds to `vscode/askQuestions` in GitHub Copilot for VS Code, `AskUserQuestion` in Claude Code and `question` in OpenCode. A client with no listed tool uses its own tool, or asks in the reply.
  - The orchestrator's workflow choice says "using `#operation:question`" in place of "using your question tool", so it is bound like the rest.
  - The runtime binding says `<token>` is a runtime capability name and that an `#operation:<op>` is never a runtime command.
- The runtime refuses a host operation (`question`, `read`, `search`, `write`, `terminal`, `delegate`) by naming it as a host operation. Every unknown command now says the runtime is installed and working, so it is not reported as an outage.
- The availability guard of `ask` and `knowledge-builder` says that only the runtime's own commands count, and that a refused `#operation:` call is not an outage.

## 1.2.2

- One runtime operation per shell command. A verifier that fetched several parts in one loop, or piped a part through `head`, `tail`, `cut` or `dd`, went past what the shell host shows and then sliced the spilled output, so each round judged a different fragment of the design.
  - The footer of a part that continues says to run the next call as a shell command of its own, with nothing chained and no pipe.
  - The repository router and every role's runtime binding say: never join two runtime calls with `;`, `&&` or a loop, and never pipe an answer through `head`, `tail`, `cut`, `sed` or `dd`. This replaces "never cut an answer with `head`, `tail` or a byte count".
- `design-verification-view`: a non-empty `## Knowledge grounding` ends with the `knowledge-read` call, with the listed file ids, that reads it.

## 1.2.1

- A `request` object sent to an operation that takes none (anything except the ten design operations that write or act on the design) is read as top-level arguments, and a top-level value wins. Before, `session-artifact-read`, `knowledge-read` and the other plain operations ignored the fields inside `request`. That meant "'name' is required", "pass one or more file ids", or part 1 served again in place of the requested part.
- `node agentic-system.mjs <token> --help` prints the operation's argument shape (request envelope or top-level) and its definition from the runtime contracts. Before, it failed with "'sessionId' is required".
- `design-schema` has a contract definition in `contracts/design-model.md`.
- The repository router and every role's runtime binding say that operations other than the design writes take top-level arguments, and that `--help` prints them.

## 1.2.0

- Long runtime answers arrive in parts of at most 24,000 characters, below what a shell host shows of one command. This covers `knowledge-read`, `design-snapshot`, `design-verification-view` and the workflow instructions.
  - Each part starts at a whole unit (a knowledge document, a snapshot item, an obligation or operation, a paragraph) and ends with the call that returns the next part.
  - `workflow-step-next` serves part 1, and `workflow-step-pending --part <k>` serves the rest of the same instruction without advancing the workflow.
  - `part: "all"` returns the whole answer.
  - The repository router and every role's runtime binding say to read every part before acting and never to cut an answer by bytes.
- The CLI takes every value after a flag, and a repeated flag adds to it. `--fileIds 6 11`, `--fileIds 6 --fileIds 11` and `--fileIds 6,11` are the same call; before, the repeated form kept only the last id. `--json` takes exactly one value.
- `knowledge-read` records the documents it serves in the session (`knowledge-reads.json`). `design-verification-view` opens with `## Knowledge grounding`: every MustHave document, every document read during the design and every document the design names. The design verifier now reads the knowledge the design was built on, not only what an operation cites.
- `session-artifact-read` also accepts `artifactId` and `artifact` for the artifact name.

## 1.1.3

- The runtime CLI exits only after its output is written. On a pipe it used to stop at the first 64 KB, so a delegate reading a large design view through a shell saw only the first obligations.
- `design-verification-view` no longer repeats an operation under every obligation it carries. Each obligation shows only the text its own `{{O#.k}}` placeholders introduce, by operation name. Failure arms, contracts and files are listed once under `# Operations`, and decisions once under `# Decisions`. A 66-obligation design went from 518 KB to 99 KB with the same content.

## 1.1.2

- `design-overview`, `design-submit` and `design-approve` no longer return the design document path. `design-overview` answers `{"status", "currentState", "gaps"}`, `design-submit` answers `status` first, then `applied`, `rejected`, `errors`, `warnings` and `coverage`, and `design-approve` answers `Design approved (<YYYY-MM-DD HH:MM:SS>Z).`. The document is located only with `design-document`, which is where the workflows already read it.

## 1.1.1

- A design operation called with a request field beside `sessionId` and `jobId` (for example `operation: "Read"` at the top level) is refused with an error that names the field and says it belongs inside `request`. Before, the runtime answered `/operation: required property is missing`, which pointed the caller the wrong way, and a flat `design-overview` Read was taken for an empty write.
- Error paths in rejected design requests are absolute: `/request/operation`, `/request/rows/0/<field>`.
- The runtime binding in each role's skill and the repository router say the JSON payload is the operation's argument object, defined in the runtime contracts, with design fields inside `request`.

## 1.1.0

- The design review document (`design.html`) is redesigned for reading:
  - a sticky title bar with the legend and the theme switch;
  - a numbered reading path that shows one section at a time;
  - each decision, operation and obligation opens with its ID in the margin;
  - anchored instructions split into one row per element;
  - a collapsible file tree;
  - links from every mention of a design ID to its item.
- At the design review, the orchestrator gives the developer a `file://` link that opens the design document in a browser, next to its path.
- Symbolic links in the workspace are recorded as links, not read: the design iteration snapshot and the file listing used for clusters no longer follow a link to a directory, so a skill directory linked by the skills installer is not walked.

## 1.0.0

- First release of the orchestrator system Bootstrap: one orchestrator role with the `DESIGN`, `FAST_IMPLEMENTATION` and `DOCUMENTATION` workflows served by a local Node runtime, four delegates with their own context, and the `ask` and `knowledge-builder` roles.
- A zero-dependency installer renders every file from the bundled payload, the client profiles and an answers file, with `plan`, `apply`, `check` and `show`.
- Client profiles for Claude Code, Codex, GitHub Copilot in VS Code, OpenCode and Cursor; other clients are rendered by hand under the same rules.
- Sessions live where the developer chooses, inside the repository (ignored by git) or outside it.
