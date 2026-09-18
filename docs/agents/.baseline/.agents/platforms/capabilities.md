# Shared capability contract

Load only the active host adapter: `copilot.md` for GitHub Copilot or `codex.md` for Codex, in this directory. Paths in shared roles are relative to the repository root. Resolve capability tokens using the active host's actual callable tools. Tool configuration is not evidence that a tool is available or authenticated. Check operation inputs and outputs before using a binding; stop the affected gate when a required capability is missing.

## GitHub issue evidence

The approved provider is the configured GitHub MCP server. Planner and its explicitly delegated evidence collector may read the requested `violabg/serviceDeskDemo#<positive-number>` and every issue explicitly referenced by that issue. Validate owner, repository, and issue number. Use the host's exposed GitHub issue-read operation (commonly `issue_read` with `get` and `get_comments` methods); the callable namespace is host-dependent. Inspect its schema rather than guessing a tool name. An equivalent authenticated GitHub MCP read operation is approved; shell `gh`, direct HTTP, web scraping, searches, and local Markdown are not fallback adapters for ID-based planning.

Retrieve title, body, issue type/labels when supplied, acceptance criteria, image references, and all comments/discussion required by the planning skill. Follow comment pagination to completion. Record exact IDs and evidence provenance; do not invent absent fields. Retrieve explicitly linked issues once, record the reason, and do not recursively traverse dependencies or enumerate unrelated issues. Missing, duplicate, invalid, inaccessible, or incomplete evidence blocks the affected gate.

Implementor consumes the Planner's captured evidence in the current session. Missing or stale tracker evidence requires a Planner handoff, not an independent tracker call. MCP visibility alone does not authorize issue mutations, unrelated reads, or expanded role scope. Existing no-local-fallback and session-isolation rules remain mandatory.

## Visual evidence

Use a supplied image attachment or an available native image-reading/browser tool to inspect the actual source. Delegate deterministic extraction to `demo-vision` when available. The caller passes the active session ID, image, requested output, and any required contracts the target cannot read. If no image can be inspected, request textual evidence and stop image-dependent planning; never infer unseen content. Write permitted evidence only under the active session's `visual/` directory. Capture tools are optional until the requested workflow needs a fresh capture.

## Shared host operations

- Repository search: bounded file, text, or symbol lookup followed by focused reads; role-specific search restrictions still apply.
- File reads/writes and terminal execution: use native host capabilities only inside the role's authorized scope.
- Diagnostics: use the host binding while preserving the role's Compiler Recovery Policy.
- Ask-user: use an available clarification tool or a direct question; an unanswered blocking question never counts as approval.
- Delegation: use the native host mechanism with bounded input/output and its concurrency limits. If unavailable, execute the same authorized task inline; never skip a required capability or gate.
- Shared skills contain no platform-specific tool allowlists. Codex invocation metadata lives only in each skill's `agents/openai.yaml`; Copilot retains `disable-model-invocation` frontmatter.
