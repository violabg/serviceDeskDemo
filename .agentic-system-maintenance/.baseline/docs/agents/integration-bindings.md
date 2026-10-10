# Environment Binding Router

Resolve the active agent environment from the client/session identity before any native operation. A directory, installed configuration, or visible tool name never selects a different client. If identity is ambiguous, request the client identity and stop binding-dependent work.

- For the codex environment, load only docs/agents/bindings/codex.md.
- For the copilot environment, load only docs/agents/bindings/copilot.md.

GitHub issue reads for planning and implementation are limited to Planner, Implementor, and Direct Implementor. Codex uses the `github` app's issue-fetch and issue-comments tools; Copilot retains its existing role bindings. Issue search, listing, and tracker writes remain prohibited for those role workflows. The sole skill-scoped exception is explicit invocation of `create-work-item-from-description` in the default Copilot or Codex agent; it uses only a GitHub issue-creation operation actually exposed and authorized in that active client, as documented in its binding and the GitHub Issues adapter. It does not widen any custom role's grants.

Read only the current role's entries plus docs/agents/integration-policy.md. For the explicitly invoked work-item creation skill, read the active client's separate skill-operation entry instead of treating it as a role. Shared workflows use this already selected binding. Never load both binding files, mix native syntax, guess delegate selectors, or copy another client's tools. Shared skill bodies are environment-neutral; exact calls belong in the selected binding.

## Ordinary context boundary

Before repository discovery or delegation, exclude `.agentic-system-maintenance/` and the installed `.agents/skills/bootstrap-agentic-system/` and `.agents/skills/maintain-agentic-system/` trees, including aliases. Open those locations only during initial Bootstrap or explicitly requested agent-system maintenance.
