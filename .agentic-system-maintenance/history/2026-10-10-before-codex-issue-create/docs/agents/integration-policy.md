# Agent Integration Policy

Environment-neutral authority and evidence rules. Exact calls, permissions, model metadata and delegation procedures live only in the binding selected before this file is loaded. Read only the current role's scope. Output language: English. Configuration is not proof of authentication or runtime access.

## Approved role operation scope

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


If a required approved integration is unavailable, stop its dependent operation and report it. Continue independent work. Do not silently switch services or broaden grants.

## Explicit Skill Operations

- In the default GitHub Copilot or Codex agent only, explicit invocation of `.agents/skills/create-work-item-from-description/SKILL.md` enables its separately scoped GitHub issue-creation workflow. This is not a role grant and does not authorize any other skill or custom role to write issues.
- The skill must use the active client's documented issue-creation operation, restricted to create behavior, and must obtain the skill's explicit user approval before creation. The configured tool must actually be available and authenticated for the target repository; skill instructions do not create host permissions. Copilot's binding names `issue_write(method: create)`. The current repository Codex GitHub Apps binding does not configure a write tool; Codex can proceed only if its default session independently exposes an authorized GitHub issue-creation operation, whose exact schema must be checked at runtime.
- The issue-write operation does not accept screenshot bytes. Attach a screenshot only if a separate image-upload capability is available. If the user requested an attachment and upload is unavailable, ask whether to proceed without it; never claim an attachment was added when it was not.

## Ordinary context boundary

- Generated project knowledge lives under `knowledge/`; authoritative project documents may remain in place and be indexed by repository-relative path.
- Before ordinary reading, search, indexing, retrieval, or delegation, exclude `.agentic-system-maintenance/`, `.agents/skills/bootstrap-agentic-system/`, and `.agents/skills/maintain-agentic-system/`, including aliases and symlink targets. These locations are available only during initial Bootstrap or explicitly requested agent-system maintenance.
- Runtime work must resolve capabilities through the selected environment binding and this policy. Maintenance registry/template snapshots are evidence only and must not be opened as runtime contracts.
- After ordinary edits to an agent-system file, report that maintenance evidence needs refresh; do not access the manifest, answers, or baseline.

## Repository evidence and authority

- `#capability:repository-search` does not require an MCP or a server that supplies clusters. When such a search is available and verified for the current role, use its returned clusters, filenames and terms. Otherwise use the current role's native workspace search: the file/path and text search procedures in the already selected environment binding. First list paths within the task's likely scope, excluding session contents, generated output and dependencies. Group the returned paths by their relative parent directories into candidate clusters. For each selected cluster, list its returned filenames and derive search terms from those filenames or actual search hits; label clusters and terms as locally derived, not server-returned. Report the selected clusters, filenames, terms and filename-scoped regex queries before opening code or continuing to reconnaissance. Use only the selected filenames and observed terms for subsequent queries; record the exact search hits and opened lines as required by the role. If neither a cluster-producing search nor native file/path and text search is available, report the missing operation and stop the dependent gate.
- Source baseline editor capabilities on implementation roles remain available only for tasks justified by approved implementation scope. Their presence is not authorization to install extensions or alter global settings.
- Source capability tokens resolve to the schema/index paths and, only for roles using sessions, current-session files in the canonical tables. Bootstrap 5.3.0 replaces Ask/Knowledge Builder broad service evidence with explicit operation records in the answers file. `#capability:agent-workflow-service` remains audit history, not a server requirement. `registry/capabilities.yaml` is a maintenance snapshot; runtime capability resolution uses the selected role binding and this policy document.
- Filesystem scope for Planner and Knowledge Builder is an instruction boundary unless the selected client actually enforces it. Tool metadata alone does not prove enforcement.
- Explicitly select the named role. Planner, Implementor, Direct Implementor, Tester, Knowledge Builder and Ask are user-invoked workflows; do not automatically delegate a complete role. Built-in evidence scouts are allowed where the canonical contract delegates them.

## Neon operation boundaries

- Ask, Planner and Knowledge Builder have only the six catalog/schema/documentation tools. They do not run arbitrary SQL or mutate cloud resources.
- Use the linked project in `.neon`; that file currently provides project/org context, not a branch selection. Resolve the task's exact branch and database before schema calls. Do not assume the default branch is a disposable development branch.
- Discover documentation with `list_docs_resources` before `get_doc_resource`. Bound table/schema reads to the evidence question.
- Implementor and Direct Implementor may use their three additional tools only for the current implementation's validated, authorized database work. Preserve the repository's Prisma schema/migration source of truth; do not create unexplained schema drift through ad hoc SQL.
- `prepare_database_migration` creates a temporary branch. Validate using the returned branch ID, never by omitting the branch ID or falling back to production. Before calling `complete_database_migration`, satisfy its explicit user-approval requirement for the concrete migration. Pass `apply_changes` explicitly: `true` applies, `false` discards. Omission is not a safe default. Never infer destructive approval from generic implementation permission.
- Schema/SQL results may contain sensitive data: store only necessary, sanitized evidence in artifacts. Do not store connection strings or secrets.
- Existing Neon skills provide relevant task guidance, but do not install/update skills, run checkout, pull environment files or create resources merely to answer a question or perform Bootstrap.

## Database migration and privilege bootstrap workflow

- For work that changes the Prisma schema, an `ACCESS_SECTIONS` boundary, the code-defined permission set, or the configured initial administrator, Planner must select the relevant access-control knowledge from `knowledge/knowledge-index.md` and make the database work explicit in the implementation plan's Section 4. Identify the exact authorized project, branch, and database, plus the migration and permission-state checks that determine whether each operation is needed. If the target or required evidence cannot be established, mark the operation blocked rather than assuming the database is current.
- Keep schema migration and privilege seeding as separate conditional operations. Compare the target schema and migration history with the repository's Prisma schema and migrations; apply only required unapplied migrations, and skip migration when the target is current. Check whether the target has the complete current code-generated permission set, Admin role grants, and configured administrator assignment; run the repository seed flow only when that state is incomplete or stale. A privilege-only change may require seeding without a schema migration. A current database requires verification and a recorded no-op, not a database mutation.
- Before seeding, review changes to the complete `ACCESS_SECTIONS` set because bootstrap may remove permissions for sections no longer present. Use the repository's seed flow (`pnpm db:seed`) against the explicitly authorized target, after any required migration. Do not create permissions or grants with ad hoc SQL.
- Before implementation, Implementor must confirm the approved plan covers these checks and conditional operations whenever the change affects schema or permissions. If it omits them or does not identify the authorized target, stop and request a plan correction; do not silently omit the database work or expand the approved scope.
- Execute only the approved operations against the identified target. For Neon migrations, validate on the returned temporary branch and complete the concrete migration only after the existing explicit user-approval requirement is satisfied; approval of the feature plan alone is not migration approval. Seed only when the checks show it is needed.
- Verify that every current code-generated base permission is granted to the system Admin role, that the configured `INITIAL_ADMIN_EMAIL` user has the Admin role when configured, and that the intended administrator's effective permissions include the new privileges. Admin users inherit privileges through the role; do not insert individual permission grants for administrators. Seed output or a seed count alone is not verification. Record skipped operations with the evidence that the target was already current.

## Next.js operation boundaries

- The repository config pins `next-devtools-mcp@0.3.6`. Call `init` before its documentation workflow; use `nextjs_docs` for the applicable App Router contract.
- Use `nextjs_index` to discover the intended development server and its available runtime tool names. Do not guess a port or use another project's server.
- Ask, Planner and Knowledge Builder may call `nextjs_call` only for operations documented by that discovered server as read-only diagnostics, routes, errors, logs or metadata. Inspect the operation before calling it; the generic dispatcher is not intrinsically read-only.
- Implementor and Direct Implementor additionally have `browser_eval` for validation within authorized scope. Browser actions that submit forms or alter data require the same implementation authorization and scoped test environment as other mutations.
- Upgrade and cache-component migration MCP tools are intentionally omitted. Tool availability does not expand the approved feature scope.

## Conditional visual processing

- Inspect the active model's actual image-input capability. If supported, Planner or Direct Implementor performs extraction inline using the complete demo-vision body. Otherwise invoke demo-vision only after its registration, model and invocation schema are verified in the selected environment binding. Resolve unknown image capability before continuing. Never substitute an unapproved model.
- Pass the exact local image path and obtain actual image input using the selected environment's image tool. A filename, text-file read or URL is not image inspection. If the selected role cannot inspect the image, stop the image-dependent operation.
- For remote issue images, fetch the bytes through authorized repository access or obtain a local copy. Verify fetch permission and image inspection separately. If inaccessible, request the image from the user and stop the image-dependent operation.
- Each image produces SlimUI under the current session's artifacts/visual/. The parent writes and reads a JSON reference containing session_id, image, artifact_path and format, then reads the SlimUI. The delegate retains SlimUI-only output.

## Validation scope

For product work, check diagnostics and run scoped lint/typecheck before focused tests. Preserve the existing exclusion for direct `components/ui/**` tests unless explicitly overridden. Integration Tester covers connected repo-owned wiring with external services stubbed; Direct Implementor never creates unit or integration tests. Broader lint, tests and builds run only when required by the approved change. This Bootstrap installs only agent-system files and does not execute database or product changes.

## Ask and Knowledge Builder capability scope (5.3.0)

- Capability Substitutions and Role Tooling Intent are source evidence for discovery, not blanket grants. The canonical workflow and the role's approved operations determine authority. No native tool or MCP grant is added by this upgrade.
- Ask is read-only Q&A and does not use sessions, memory or logging. Session read/write/list/activation, project file editing, knowledge writes and plan save/load/list operations in its source capability table are explicitly out of scope; their answer records are blocked rather than represented as working bindings. Schema/index reads and bounded repository discovery use its existing read/search tools.
- Knowledge Builder may read repository evidence, write repository knowledge and index entries, and persist evidence/memory/logs in its explicitly identified owning session. Its file-editing binding is restricted to these outputs. Implementation-plan and test-plan save/load operations are outside its knowledge-building workflow because the source-defined load includes editing in place. Existing plan evidence may be inspected read-only through file-read; that does not grant plan-editing authority. It must never implement or modify product code.
- Visual evidence requires actual image input under the conditional visual-processing rules above. Configured tools, URL strings and source tokens do not verify fetch permission or inspection. The expanded operation records remain unverified until exercised in the selected generated role.
