# Environment Binding Router

Resolve the active agent environment from the client/session identity before any native operation. A directory, installed configuration, or visible tool name never selects a different client. If identity is ambiguous, request the client identity and stop binding-dependent work.

- For the copilot environment, load only docs/agents/bindings/copilot.md.
- For the claude-code environment, load only docs/agents/bindings/claude-code.md.

GitHub issue reads for planning and implementation are limited to Planner, Implementor, and Direct Implementor, through the GitHub MCP `issue_read` operation named in the selected binding. Issue search, listing, and tracker writes remain prohibited for those role workflows. The sole skill-scoped exception is explicit invocation of `manage-work-item` in the default agent of any selected client; it reads with `issue_read` and creates or updates only with the `issue_write` operation named in the active client's binding, after explicit approval of the exact proposal. It does not widen any custom role's grants.

Read only the current role's entries plus docs/agents/integration-policy.md. For `manage-work-item`, read the active client's `manage-work-item` entry instead of treating it as a role. Shared workflows use this already selected binding. Never load two binding files, mix native syntax, guess delegate selectors, or copy another client's tools. Shared skill and role bodies are environment-neutral; exact calls belong in the selected binding.

## Ordinary context boundary

Before repository discovery or delegation, exclude `.agentic-system-maintenance/` and the installed `.agents/skills/bootstrap-agentic-system/` and `.agents/skills/maintain-agentic-system/` trees, including aliases such as `.claude/skills/bootstrap-agentic-system` and `.claude/skills/maintain-agentic-system`. Open those locations only during initial Bootstrap or explicitly requested agent-system maintenance.
