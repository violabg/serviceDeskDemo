# Changelog

Versions follow semantic versioning. The installer reads the first version heading as the kit version it records in the target's manifest.

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
