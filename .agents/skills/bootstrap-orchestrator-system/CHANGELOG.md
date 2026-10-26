# Changelog

Versions follow semantic versioning. The installer reads the first version heading as the kit version it records in the target's manifest.

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
