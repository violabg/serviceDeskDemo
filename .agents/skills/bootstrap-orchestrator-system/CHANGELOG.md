# Changelog

Versions follow semantic versioning. The installer reads the first version heading as the kit version it records in the target's manifest.

## 1.0.0

- First release of the orchestrator system Bootstrap: one orchestrator role with the `DESIGN`, `FAST_IMPLEMENTATION` and `DOCUMENTATION` workflows served by a local Node runtime, four delegates with their own context, and the `ask` and `knowledge-builder` roles.
- A zero-dependency installer renders every file from the bundled payload, the client profiles and an answers file, with `plan`, `apply`, `check` and `show`.
- Client profiles for Claude Code, Codex, GitHub Copilot in VS Code, OpenCode and Cursor; other clients are rendered by hand under the same rules.
- Sessions live where the developer chooses, inside the repository (ignored by git) or outside it.
