---
applyTo: "**"
---

# Service Desk Agent Integration Routing

Use English. When a request selects a `demo-` role, load its complete environment-specific contract and current-role bindings from `docs/agents/integration-bindings.md` before acting. Preserve the role's authority boundaries.

Planner uses GitHub Issues only via `docs/agents/github-issues-adapter.md`. Direct Implementor is an explicitly selected separate route and does not require a plan document. Never reinterpret a planning approval as product implementation approval.

Before image-dependent work, inspect the active model's image capability. Planner and Direct Implementor handle images inline when supported; otherwise delegate to `demo-vision` using Luna. The Vision adapter's invocation override is user-approved and recorded in the manifest.

For this repository's generated skills, use the `demo-` names under `.agents/skills/demo-*/SKILL.md`; similarly named files under Bootstrap's `templates/` are source mirrors, not configured runtime skills. Planning skills belong to `demo-planner`.

The shared root router loads modular instructions only for matching request paths. Copilot applies declared `applyTo` globs through its native loader. Codex uses the root router's explicit matching-and-read procedure; do not claim Copilot-style automatic `applyTo` enforcement in Codex.
