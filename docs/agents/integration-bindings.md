# Agent Integration Bindings

These bindings implement the approved role operations. Read only the current role's rows and the common rules required by the task. Output language: English. Never treat a configured tool as evidence that authentication or runtime access works.

## Exact MCP assignments

| Role | Server | Raw tool names |
| --- | --- | --- |
| demo-planner | github | `issue_read` |
| demo-planner | neon | `list_docs_resources`, `get_doc_resource`, `get_database_tables`, `describe_table_schema`, `list_branches`, `compare_database_schema` |
| demo-planner | next-devtools | `init`, `nextjs_docs`, `nextjs_index`, `nextjs_call` |
| demo-implementor | github | `issue_read` |
| demo-implementor | neon | `list_docs_resources`, `get_doc_resource`, `get_database_tables`, `describe_table_schema`, `list_branches`, `compare_database_schema`, `prepare_database_migration`, `run_sql`, `complete_database_migration` |
| demo-implementor | next-devtools | `init`, `nextjs_docs`, `nextjs_index`, `nextjs_call`, `browser_eval` |
| demo-direct-implementor | github | `issue_read` |
| demo-direct-implementor | neon | `list_docs_resources`, `get_doc_resource`, `get_database_tables`, `describe_table_schema`, `list_branches`, `compare_database_schema`, `prepare_database_migration`, `run_sql`, `complete_database_migration` |
| demo-direct-implementor | next-devtools | `init`, `nextjs_docs`, `nextjs_index`, `nextjs_call`, `browser_eval` |
| demo-knowledge-builder | neon | `list_docs_resources`, `get_doc_resource`, `get_database_tables`, `describe_table_schema`, `list_branches`, `compare_database_schema` |
| demo-knowledge-builder | next-devtools | `init`, `nextjs_docs`, `nextjs_index`, `nextjs_call` |
| demo-ask | neon | `list_docs_resources`, `get_doc_resource`, `get_database_tables`, `describe_table_schema`, `list_branches`, `compare_database_schema` |
| demo-ask | next-devtools | `init`, `nextjs_docs`, `nextjs_index`, `nextjs_call` |

Codex qualified names use `mcp__github__<tool>`, `mcp__neon__<tool>` and `mcp__next_devtools__<tool>`. Copilot uses `github/<tool>`, `neondatabase/mcp-server-neon/<tool>` and `io.github.vercel/next-devtools-mcp/<tool>`. Raw names are used in Codex `enabled_tools`. Existing user MCP configuration supplies the transport and authentication; native agent overlays narrow each named server's tools. No credentials are copied here.

Neon raw names were confirmed against its public catalog. Qualified Neon names are configuration bindings, not verified tools in this session. Copilot qualified names likewise require the actual client tool picker/diagnostics check. If the required bound tool is missing, report the missing binding and stop that dependent operation. Continue independent work that does not need it. Do not silently switch services.

## Repository and native operations

- Codex execution-host tools: `functions.exec` invokes `tools.exec_command` for targeted reads, `rg`, file listing and approved commands, and `tools.apply_patch` for edits. `tools.view_image` reads local images. Native web access is `tools.web__run`. Native wrappers may differ in the CLI: inspect the active tool surface before use, and do not invent identifiers.
- Foreground Codex questions use plain user-facing chat. The discovery host exposed `collaboration.spawn_agent`, `collaboration.wait_agent` and messages for built-in evidence agents. Other Codex clients must inspect their active native delegation surface before use. Pass the exact current session and smallest evidence task. Delegates return blocking questions to the coordinator. A custom demo role is callable only after native discovery confirms it; the pre-install host did not expose those roles.
- Copilot reads/searches use `read/readFile`, `search/fileSearch`, `search/listDirectory`, `search/textSearch`, `search/usages`. Artifact/code writes use the role's `edit/*` tools. Implementor/Direct Implementor/Integration Tester use `execute/runInTerminal`, `execute/getTerminalOutput`, `read/problems` for approved verification. Documentation retrieval uses `web/fetch` for Ask, Planner and Knowledge Builder.
- Copilot delegation uses `agent/runSubagent` (tool set `agent`), with `agentName="agent"` for bounded general evidence tasks or `agentName="demo-vision"` for the approved visual case. Foreground questions use `vscode/askQuestions`. Delegates cannot ask directly: return questions to the coordinator, which asks and reinvokes with answers. Do not depend on nested delegation being enabled.
- Source baseline editor capabilities on implementation roles remain available only for tasks justified by approved implementation scope. Their presence is not authorization to install extensions or alter global settings.
- Source capability tokens resolve to the current-session files and schema/index paths in the canonical tables. `#capability:agent-workflow-service` is audit history, not a server requirement. `registry/capabilities.yaml` references resolve to `docs/agents/sources/registry/capabilities.yaml`.
- Filesystem tools are broad: Planner and Knowledge Builder restrictions against application edits are instruction boundaries, not a per-path tool allowlist. Codex Ask requests the native read-only sandbox. Effective client policy must still be verified; tool frontmatter alone is not proof of enforcement.
- Explicitly select the named role. Planner, Implementor, Direct Implementor, Tester, Knowledge Builder and Ask are user-invoked workflows; do not automatically delegate a complete role when the user has not selected it. Built-in evidence scouts are allowed where the canonical contract delegates them. Codex lacks the Copilot user-only metadata equivalent; this restriction is instruction-level there.

## Neon operation boundaries

- Ask, Planner and Knowledge Builder have only the six catalog/schema/documentation tools. They do not run arbitrary SQL or mutate cloud resources.
- Use the linked project in `.neon`; that file currently provides project/org context, not a branch selection. Resolve the task's exact branch and database before schema calls. Do not assume the default branch is a disposable development branch.
- Discover documentation with `list_docs_resources` before `get_doc_resource`. Bound table/schema reads to the evidence question.
- Implementor and Direct Implementor may use their three additional tools only for the current implementation's validated, authorized database work. Preserve the repository's Prisma schema/migration source of truth; do not create unexplained schema drift through ad hoc SQL.
- `prepare_database_migration` creates a temporary branch. Validate using the returned branch ID, never by omitting the branch ID or falling back to production. Before calling `complete_database_migration`, satisfy its explicit user-approval requirement for the concrete migration. Pass `apply_changes` explicitly: `true` applies, `false` discards. Omission is not a safe default. Never infer destructive approval from generic implementation permission.
- Schema/SQL results may contain sensitive data: store only necessary, sanitized evidence in artifacts. Do not store connection strings or secrets.
- Existing Neon skills provide relevant task guidance, but do not install/update skills, run checkout, pull environment files or create resources merely to answer a question or perform Bootstrap.

## Next.js operation boundaries

- The repository config pins `next-devtools-mcp@0.3.6`. Call `init` before its documentation workflow; use `nextjs_docs` for the applicable App Router contract.
- Use `nextjs_index` to discover the intended development server and its available runtime tool names. Do not guess a port or use another project's server.
- Ask, Planner and Knowledge Builder may call `nextjs_call` only for operations documented by that discovered server as read-only diagnostics, routes, errors, logs or metadata. Inspect the operation before calling it; the generic dispatcher is not intrinsically read-only.
- Implementor and Direct Implementor additionally have `browser_eval` for validation within authorized scope. Browser actions that submit forms or alter data require the same implementation authorization and scoped test environment as other mutations.
- Upgrade and cache-component migration MCP tools are intentionally omitted. Tool availability does not expand the approved feature scope.

## Conditional visual processing

- Inspect the active model's actual image-input capability. If supported, Planner or Direct Implementor performs the image extraction inline using the complete demo-vision body. If unsupported, spawn `demo-vision`, whose registered model is Luna. Unknown capability must be resolved; do not guess from a model name.
- Delegated model: Codex `gpt-5.6-luna`; Copilot `GPT-5.6 Luna`. No substitute model is approved. If Luna is unavailable, stop the image-dependent operation and report it.
- Every image produces SlimUI under the current session's `artifacts/visual/`. The parent writes a JSON reference with session_id, image, artifact_path and format, then reads that reference and the SlimUI. The Vision agent preserves its SlimUI-only output contract.
- The user explicitly overrode the source Vision `disable-model-invocation: true`. Its Copilot adapter sets false; the pristine canonical copy retains true. This is recorded as `overrides-canonical`, not an unmodified metadata translation.

## Validation scope

For product work, check diagnostics and run scoped lint/typecheck before focused tests. Preserve the existing exclusion for direct `components/ui/**` tests unless explicitly overridden. Integration Tester covers connected repo-owned wiring with external services stubbed; Direct Implementor never creates unit or integration tests. Broader lint, tests and builds run only when required by the approved change. This Bootstrap installs only agent-system files and does not execute database or product changes.
