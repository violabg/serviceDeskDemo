# Approved targeted context-isolation migration — 2026-10-10

Mode: evolve, applying the 7.0 context boundary and layout rules while retaining the approved 6.0 deferral.

Approval: user approved the plan on 2026-10-10 and clarified that skills installed by `npx skills add violabg/agentic-system-kit` remain at their current paths. Generated maintenance evidence belongs under `.agentic-system-maintenance/`; project knowledge belongs under `knowledge/`. Codex and Copilot MCP configuration, authentication and role grants are preserved.

Operations completed:

- Moved generated maintenance evidence, templates, scripts, maintenance history, and pristine baseline inputs from `docs/agents/` to `.agentic-system-maintenance/`.
- Moved all nine project knowledge documents and the knowledge index from `docs/agents/knowledge/` into `knowledge/`, with index links resolving within that directory.
- Moved the remaining 2026-10-08 GitHub Apps maintenance plan into `.agentic-system-maintenance/history/`; removed the stray macOS metadata file and Python bytecode cache from `docs/agents/`.
- Kept the installed Bootstrap and Maintainer skill packages and all five configured project skills at their existing paths.
- Re-keyed runtime references, bindings, native instruction bodies, inventories, and verification commands. Runtime capability resolution uses the selected binding and integration policy; moved registry snapshots remain maintenance evidence.
- Added ordinary-context exclusions to the root router, binding/policy guidance and knowledge guard. The full maintenance skills remain available for explicit invocation.
- Preserved the explicit Bootstrap 6.0 deferral and the known diagnostics source-slot blocker. Applied-through remains 5.3.0 plus targeted 7.0 context isolation; this does not certify full 7.0 compatibility.

Merge evidence: 22 canonical copies pass the declared preservation recipe after the approved path re-keying. The two protected C011/C012 knowledge baseline differences remain unresolved and visible. The old baseline and answers were archived under `history/2026-10-10-before-layout/` before refreshing the path-keyed baseline. No session-folder contents or application files were read or changed.

Validation: context inventory/static path boundary passed; canonical preservation passed; native client discovery, search filtering and generated-role operations remain unverified. The environment binding audit still reports the known Codex `read/problems` source-slot violation. No MCP settings were changed.
