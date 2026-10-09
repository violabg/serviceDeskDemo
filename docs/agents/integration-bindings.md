# Environment Binding Router

Resolve the active agent environment from the client/session identity before any native operation. A directory, installed configuration, or visible tool name never selects a different client. If identity is ambiguous, request the client identity and stop binding-dependent work.

- For the codex environment, load only docs/agents/bindings/codex.md.
- For the copilot environment, load only docs/agents/bindings/copilot.md.

GitHub issue reads are limited to Planner, Implementor, and Direct Implementor. Codex uses the `github` app's issue-fetch and issue-comments tools; Copilot retains its existing GitHub binding. Issue search, listing, and tracker writes are prohibited.

Read only the current role's entries plus docs/agents/integration-policy.md. Shared workflows use this already selected binding. Never load both binding files, mix native syntax, guess delegate selectors, or copy another client's tools. Shared skill bodies are environment-neutral; exact calls belong in the selected binding.
