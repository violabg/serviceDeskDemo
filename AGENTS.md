<!-- agentic-system:start -->
# serviceDeskDemo Agentic System

Route the current request through this file, then load only what that request needs. Keep this file under 80 lines: it is a router, not a knowledge base.

## Roles

Started by the developer, each as the main conversation of its session:

- `orchestrator` — drives one workflow the developer chooses explicitly: `DESIGN`, `FAST_IMPLEMENTATION` or `DOCUMENTATION`. It never writes production code.
- `ask` — answers project and programming questions; never implements.
- `knowledge-builder` — builds and updates project knowledge.

Started only by the orchestrator, each in a fresh context with only its prompt, reporting back in the same conversation:

- `code-implementor`, `design-verifier`, `implementation-verifier`, `documentation-reviewer`.

Full role contracts live in `.claude/agents (Claude Code), .github/agents (GitHub Copilot (VS Code and CLI)), .opencode/agents (OpenCode)`. Do not restate them here.

## Runtime

Every `#capability:<token>` in a role, skill or workflow instruction is an operation of the agentic system runtime or of an approved integration, bound for this repository. Runtime operations run as `node agentic-system/bin/agentic-system.mjs <token>`; pass large payloads with `--json <file>`. The JSON payload is the operation's argument object, defined in `agentic-system/contracts/`: design operations take `{ "sessionId", "jobId", "request": { ... } }`, and fields such as `operation`, `rows` and `ids` go inside `request`; every other operation takes its arguments at the top level. Read the contract before an operation's first call, or run the operation with `--help` to print its arguments. A long answer arrives in parts: when it ends with `[part N of M. The answer continues: …]`, make the call it names and read every part before acting on any of it. Run one runtime operation per shell command: never join two calls with `;`, `&&` or a loop, and never pipe an answer through `head`, `tail`, `cut`, `sed` or `dd`.

- Session memory, the event log and artifacts are the session files under `agentic-system-sessions/<sessionId>/`, never the client's own memory feature.
- Workflow instructions are served one at a time by the runtime. Never open `agentic-system/workflows/` directly.
- Never edit runtime-owned files by hand: designs, jobs and integrity seals change only through runtime operations.
- A delegate that returns its report is never a stop point: continue the active instruction.

## Skills

Repository skills live in `.claude/skills (workflow skills), .claude/skills (Claude Code role skills)`. Read a skill's `SKILL.md` before running its workflow.

## Knowledge

- Read the knowledge catalogue with `#capability:knowledge-catalog`. Every `MustHave` document is read in full; `PerContext` and `PerComponent` documents are read when the work touches them.
- Knowledge documents live in `knowledge`. Resolve repository vocabulary in `CONTEXT.md`.
- Only `knowledge-builder` changes knowledge. No workflow and no delegate creates, edits or deletes a file in `knowledge`, in a correction round either. A knowledge statement the work made stale is never fixed in place: report it to the developer, who takes it to `knowledge-builder`.

## Validation

Validate every change with `pnpm lint && pnpm typecheck && pnpm test` before handing work back.
<!-- agentic-system:end -->

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
